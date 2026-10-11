/**
 * S4 L7 staging: chooses carry, raise, sight, lower, flash and casing states from
 * the shot timeline, and the aim view transform for L0–L6.
 */
import {clamp, ease, lerp, hash} from '../kit.js';
import {SHOTS, RAISE, DRIFT, LOWER, activeShot, shotTimes} from './timeline.js';
import {drawCarry, drawSight, drawMuzzle, drawCasing, recoil} from './rifle.js';

/**
 * L7 pose at t. Returns {mode: 'carry'|'sight', lift, slide, dark, shot, times}.
 * slide is the sight's vertical offset during HD-11/HD-14; dark hides the swap.
 */
export function rifleState(t, clicks) {
  const i = activeShot(t, clicks);
  if (i < 0) return {mode: 'carry', lift: 0, slide: 0, dark: 0, shot: -1};
  const p = shotTimes(i, clicks);
  const up = (t - p.raise) / RAISE, down = (t - p.lower) / LOWER;
  if (up < 0) return {mode: 'carry', lift: 0, slide: 0, dark: 0, shot: i, times: p};
  if (up < .55) return {mode: 'carry', lift: ease(up / .55), slide: 0, dark: up / .55 * .5, shot: i, times: p};
  if (down < 0) {
    const s = clamp((up - .55) / .45);
    return {mode: 'sight', lift: 1, slide: (1 - ease(s)) * 320, dark: (1 - s) * .5, shot: i, times: p};
  }
  if (down < .45) return {mode: 'sight', lift: 1, slide: ease(down / .45) * 320, dark: down / .45 * .5, shot: i, times: p};
  const s = clamp((down - .45) / .55);
  return {mode: 'carry', lift: 1 - ease(s), slide: 0, dark: (1 - s) * .5, shot: i, times: p};
}

/**
 * Aim transform for L0–L6: weight ramps over the raise, the target drifts onto
 * the post over 20 frames (HD-12), then a 3 px sway and optional tremor remain.
 * target = {x, y} world screen point supplied by the set. Returns aim or null.
 */
export function aimView(t, wt, clicks, target, reducedMotion) {
  const i = activeShot(t, clicks);
  if (i < 0 || !target) return null;
  const p = shotTimes(i, clicks), shot = SHOTS[i];
  const weight = clamp(ease((t - p.raise) / RAISE) - ease((t - p.lower) / LOWER));
  if (weight <= 0) return null;
  const drift = 1 - ease((t - p.sight) / DRIFT), motion = reducedMotion ? 0 : 1;
  const tremorF = Math.floor(t * 10);
  const tremor = shot.tremor * motion * 4;
  const ox = 170 * drift + 3 * Math.sin(wt * 1.4) * motion + (hash(tremorF) - .5) * tremor;
  const oy = -110 * drift + 3 * Math.cos(wt * 1.1) * motion + (hash(tremorF * 1.7) - .5) * tremor;
  return {x: target.x + ox / shot.zoom, y: target.y + oy / shot.zoom, zoom: shot.zoom, weight};
}

/** Muzzle flash intensity: full for 2 frames (4 on Shot 3); a soft glow when reduced. */
export function muzzleLevel(t, clicks, reducedMotion) {
  for (let i = 0; i < SHOTS.length; i++) {
    const fire = shotTimes(i, clicks).fire, held = SHOTS[i].flash / 24;
    if (reducedMotion) {
      const u = (t - fire) / .5;
      if (u >= 0 && u < 1) return .35 * Math.sin(u * Math.PI);
    } else if (t >= fire && t < fire + held) return 1;
  }
  return 0;
}

/** Most recent fire time at or before t (or -Infinity). */
export function lastFire(t, clicks) {
  let last = -Infinity;
  for (let i = 0; i < SHOTS.length; i++) { const f = shotTimes(i, clicks).fire; if (f <= t) last = f; }
  return last;
}

/**
 * Draw L7 (camera-locked). bob = {x, y, roll} at 1.3x with a 2-frame lag.
 * Rifle and sight are graded; the flash goes through the coloured pass.
 */
export function drawForeground(comp, art, t, clicks, bob, reducedMotion) {
  const st = rifleState(t, clicks), fire = lastFire(t, clicks), kick = recoil(t, fire, reducedMotion);
  comp.draw(c => {
    if (st.mode === 'carry') drawCarry(c, art.carry, {x: bob.x, y: bob.y + kick.y, roll: bob.roll + kick.roll, lift: st.lift});
    else drawSight(c, art.sight, {x: bob.x * .2, y: st.slide + kick.y, roll: kick.roll});
    if (st.dark > 0) { c.fillStyle = `rgba(14,13,12,${st.dark})`; c.fillRect(0, 0, 1920, 1080); }
    drawCasing(c, art.casing, (t - fire) / (10 / 24));
  });
  const flash = muzzleLevel(t, clicks, reducedMotion);
  if (flash > 0) comp.draw(c => drawMuzzle(c, art.flash, flash, {y: kick.y}), true);
  return st;
}

/** Sleeve reveal 0..1: low edge while carrying, full strip for 2 s after the hit. */
export function sleeveReveal(t, hit, st) {
  if (st.mode === 'sight' || st.lift > .3) return 0;
  const base = t < hit ? .16 : .26;
  const strip = clamp((t - hit) / .2) * (1 - ease((t - hit - 2) / .5));
  return lerp(base, 1, strip) * (1 - st.lift / .3);
}

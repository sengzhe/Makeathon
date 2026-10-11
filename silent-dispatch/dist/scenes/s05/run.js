/**
 * S5 0:00–0:02 — the run in BG-05, the grenade, slow motion and the HD-15 final reach.
 * World layers (L0–L6) follow world time; L7 staging follows the scene clock.
 */
import {W, H, clamp, lerp, progress, hash, drawCover} from '../kit.js';

const SLOW_AT = .5, SLOW = .1, REACH_END = .5 + 20 / 24;
const LAND = {x: 900, y: 800, at: .4};

/**
 * World time: full speed to 0:00.5, then eased into the 0.1 grenade slow motion.
 * Fixed-step integration keeps the value identical whenever the review tool seeks.
 */
export function worldTime(t) {
  if (t <= SLOW_AT) return t;
  const steps = 24, ramp = Math.min(t, SLOW_AT + .3) - SLOW_AT;
  let sum = 0;
  for (let i = 0; i < steps; i++) sum += lerp(1, SLOW, clamp((i + .5) / steps)) * ramp / steps;
  return SLOW_AT + sum + Math.max(0, t - SLOW_AT - .3) * SLOW;
}

/** Camera offsets for the injured run: uneven bob, sway and roll (HD-10i). */
function camera(w, reducedMotion) {
  if (reducedMotion) return {bob: 0, sway: 0, roll: 0};
  const step = Math.PI * 2.8 * w;
  return {
    bob: 14 * Math.abs(Math.sin(step)) * (1 + .3 * Math.sin(step * .5)),
    sway: 8 * Math.sin(step / 2),
    roll: Math.PI / 180 * Math.sin(step / 2),
  };
}

/** PR-13 tumble from the right edge, landing two steps ahead; then the held ground state. */
function grenade(c, art, w) {
  if (w < LAND.at) {
    const n = w / LAND.at;
    const x = lerp(2080, LAND.x, n), y = lerp(470, LAND.y, n) - Math.sin(n * Math.PI) * 180;
    const width = lerp(200, 330, n);
    c.save(); c.translate(x, y); c.rotate(-n * Math.PI * 5.2);
    c.drawImage(art.grenadeAir, -width / 2, -width * art.grenadeAir.height / art.grenadeAir.width / 2, width, width * art.grenadeAir.height / art.grenadeAir.width);
    c.restore();
    return;
  }
  const width = 400, height = width * art.grenade.height / art.grenade.width;
  c.save(); c.translate(LAND.x, LAND.y - height * .35); c.rotate(-.1);
  c.drawImage(art.grenade, -width / 2, -height / 2, width, height); c.restore();
  // Fuse smoke from the handle end, rising slowly in world time.
  const since = w - LAND.at;
  for (let i = 0; i < 9; i++) {
    const emitted = since * 4 - i * .2;
    if (emitted < 0) continue;
    const age = emitted % 1.8;
    const x = LAND.x + 175 + age * 40 * Math.sin(i * 1.3), y = LAND.y - 30 - age * 160;
    c.fillStyle = `rgba(222,222,214,${.5 * (1 - age / 1.8)})`;
    c.beginPath(); c.arc(x, y, 12 + age * 38, 0, Math.PI * 2); c.fill();
  }
  // FX-11 mud splash hangs in the air once slow motion takes hold.
  const splash = clamp(since / .45);
  if (splash < 1) {
    const sw = lerp(180, 520, Math.sqrt(splash)), sh = sw * art.splash.height / art.splash.width;
    c.save(); c.globalAlpha = 1 - splash;
    c.drawImage(art.splash, LAND.x - sw / 2, LAND.y - sh * .82, sw, sh); c.restore();
  }
}

/** Slow outdoor snow (FX-06 role) on world time; deterministic per flake. */
function snow(c, w) {
  c.fillStyle = 'rgba(236,238,236,.75)';
  for (let i = 0; i < 90; i++) {
    const x = (hash(i) * 2200 + w * 40 * (hash(i + 7) - .5)) % 2100 - 90;
    const y = (hash(i + 3) * 1200 + w * (70 + hash(i + 5) * 80)) % 1200 - 60;
    c.beginPath(); c.arc(x, y, 1.6 + hash(i + 9) * 3.2, 0, Math.PI * 2); c.fill();
  }
}

/**
 * Draw the BG-05 world into the offscreen frame (graded later by the caller).
 * @returns world time used, for the caller's L7 staging.
 */
export function drawRunWorld(c, art, t, reducedMotion) {
  const w = worldTime(t), cam = camera(w, reducedMotion);
  const tilt = progress(t, SLOW_AT, REACH_END);
  c.save();
  c.translate(W / 2 + cam.sway, 430 + cam.bob - 230 * tilt); c.rotate(cam.roll);
  c.scale(1.05 + .035 * w, 1.05 + .035 * w); c.translate(-W / 2, -430);
  drawCover(c, art.field, {panY: -.05, zoom: 1.12});
  grenade(c, art, w);
  snow(c, w);
  c.restore();
  return w;
}

/**
 * L7 staging: low rifle, then HD-15 — rifle sinks 15°, the chest strip rises into view,
 * and the fixed contact hand with the stained sleeve slides onto the pocket over 20 frames.
 */
export function drawReach(ctx, art, prep, t, reducedMotion) {
  const w = worldTime(Math.max(0, t - 2 / 24)), cam = camera(w, reducedMotion);
  const reach = progress(t, SLOW_AT, REACH_END), sink = progress(t, SLOW_AT, SLOW_AT + .6);
  // PR-14 seen looking down: the front view turned 180°, so the hem is furthest from the
  // eye and the pocket lands on Scene 1's screen side.
  if (reach > 0) {
    const ch = prep.chest, width = 2300, sy = ch.height * .25, sh = ch.height * .75;
    const dh = sh * width / ch.width, top = lerp(H + 20, H - 470, reach);
    ctx.save(); ctx.translate(W / 2, top); ctx.rotate(Math.PI);
    ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30;
    ctx.drawImage(ch, 0, sy, ch.width, sh, -width / 2, -dh, width, dh);
    ctx.restore();
  }
  // HD-10i low rifle: stock and hands below frame; sinks out on the reach.
  if (sink < 1) {
    const bob = cam.bob * 1.3 * (1 - sink);
    ctx.save(); ctx.translate(2060, 1330 + bob + sink * 300); ctx.rotate(sink * 15 * Math.PI / 180 + cam.roll);
    ctx.drawImage(prep.rifle, -1180, -650, 1400, 1400 * prep.rifle.height / prep.rifle.width);
    ctx.restore();
  }
  if (reach > 0) {
    const hand = prep.hand, width = 430, height = width * hand.height / hand.width;
    const x = lerp(1150, 1500, reach), y = lerp(1450, 790, reach);
    ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(.6, .35, reach));
    ctx.drawImage(hand, -width * .55, -height * .3, width, height);
    ctx.restore();
  }
}

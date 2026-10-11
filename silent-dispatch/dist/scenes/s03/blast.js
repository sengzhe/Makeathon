/**
 * S3 mortar beats (0:00.8–0:03): FX-04 flash, FX-21 frozen cluster and burst,
 * PR-10 torn calendar, ash, FX-05 plaster rain and smoke rolling in through the gap.
 * All motion derives from scene time; the freeze uses worldTime().
 */
import {W, H, clamp, lerp, progress, hash} from '../kit.js';
import {worldTime, veil} from './common.js';
import {BLAST, wallEdge} from './kitchen.js';

/** Blast point on screen for the current pan (exterior parallax factor 0.4). */
export function blastPoint(cam) {
  return {x: BLAST.x - cam.p * .4, y: BLAST.y + cam.rise * .45};
}

/**
 * Ungraded exterior light: fireball held through the freeze, then crater fire that
 * stays orange after the colour drain. Clipped to the gap so it never crosses the wall.
 */
export function blastGlow(c, t, art, cam, reducedMotion) {
  if (t < .8) return;
  const b = blastPoint(cam), edge = wallEdge(cam);
  c.save(); c.beginPath(); c.rect(edge, 0, W * 3, 905 + cam.rise); c.clip();
  const flick = reducedMotion ? 0 : Math.sin(t * 17) * .04 + Math.sin(t * 29) * .03;
  const fh = 300 * (1 + flick), fw = fh * art.fire.width / art.fire.height;
  c.globalAlpha = progress(t, .9, 1.6);
  c.drawImage(art.fire, b.x - fw / 2, b.y - fh * .92, fw, fh);
  const ball = t < 1.4 ? progress(t, .8, .86) : 1 - progress(t, 1.4, 1.9);
  if (ball > 0) {
    const w = lerp(160, 620, Math.min(1, ball * 1.4)) * (t < 1.4 ? 1 : lerp(.8, 1, ball));
    c.globalAlpha = ball; c.globalCompositeOperation = 'lighter';
    c.drawImage(art.flash, b.x - w / 2, b.y - w * .45, w, w * art.flash.height / art.flash.width);
  }
  c.restore();
}

/** T-FLASH: white 4 frames, then fades over 8. Reduced motion: a soft, slow glow. */
export function flashOverlay(c, t, reducedMotion) {
  if (reducedMotion) { veil(c, '#f4f1e8', .45 * progress(t, .7, 1) * (1 - progress(t, 1.1, 1.6))); return; }
  if (t < .8) return;
  veil(c, '#ffffff', t < .8 + 4 / 24 ? 1 : 1 - (t - .8 - 4 / 24) / (8 / 24));
}

/**
 * FX-21 frozen cluster (1.0–1.4, rotating 1°) that then bursts toward and past
 * the camera, with extra procedural fragments leaving all four edges.
 */
export function debris(c, t, art, reducedMotion) {
  if (t < 1 || t > 2.3) return;
  const burst = progress(t, 1.4, 2.1), turn = (t < 1.4 ? (t - 1) / .4 : 1) * Math.PI / 180;
  const scale = reducedMotion ? lerp(1, 1.4, burst) : lerp(1, 4.2, burst * burst);
  const w = 1700 * scale, h = w * art.debris.height / art.debris.width;
  c.save(); c.globalAlpha = 1 - progress(t, 1.75, 2.2);
  c.translate(1010, 520); c.rotate(turn + burst * .12); c.drawImage(art.debris, -w / 2, -h / 2, w, h);
  c.restore();
  if (reducedMotion) return;
  for (let i = 0; i < 70; i++) {
    const a = hash(i) * Math.PI * 2, d = 120 + hash(i + 7) * 360;
    const travel = d + burst * burst * 1500 * (.6 + hash(i + 3));
    const size = (5 + hash(i + 11) * 16) * (1 + burst * 3);
    c.save(); c.translate(1010 + Math.cos(a) * travel * 1.6, 520 + Math.sin(a) * travel);
    c.rotate(a + burst * 3 * (hash(i + 5) - .5) + turn * 4);
    c.fillStyle = i % 3 ? '#8e5a40' : '#cbbfa8'; c.fillRect(-size, -size * .55, size * 2, size * 1.1);
    c.restore();
  }
}

/** PR-10 torn calendar hanging mid-air at the left edge, then thrown out of frame. */
export function calendar(c, t, art) {
  if (t < 1 || t > 2.1) return;
  const out = progress(t, 1.4, 2.0), freeze = t < 1.4 ? (t - 1) * .02 : 0;
  const w = 330, h = w * art.calendar.height / art.calendar.width;
  c.save(); c.translate(lerp(250, -420, out), lerp(400, 300, out)); c.rotate(-.32 + freeze - out * .8);
  c.drawImage(art.calendar, -w / 2, -h / 2, w, h);
  c.restore();
}

/** A single glass shard catching light in the frozen cluster. */
export function glint(c, t) {
  if (t < 1 || t > 1.6) return;
  const a = 1 - progress(t, 1.4, 1.6);
  c.save(); c.globalAlpha = a; c.translate(1290, 330); c.rotate(.5 + (t - 1) * .05);
  c.fillStyle = 'rgba(214,226,232,.85)'; c.beginPath(); c.moveTo(-26, -8); c.lineTo(22, -18); c.lineTo(8, 20); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.moveTo(0, -30); c.lineTo(0, 30); c.stroke();
  c.restore();
}

/** Ash flakes drifting down; they stop mid-fall during the freeze. */
export function ash(c, t, cam, reducedMotion) {
  if (t > 3.2) return;
  const wt = reducedMotion ? 0 : worldTime(t);
  c.save(); c.fillStyle = 'rgba(140,138,132,.75)';
  c.globalAlpha = 1 - progress(t, 1.4, 1.9) * .7;
  for (let i = 0; i < 46; i++) {
    const x = ((hash(i) * 2200 + Math.sin(wt * .8 + i) * 30 - cam.p * .6) % 2200 + 2200) % 2200 - 140;
    const y = ((hash(i + 40) * H + wt * (40 + hash(i + 2) * 40)) % H + H) % H;
    c.save(); c.translate(x, y); c.rotate(i + wt * .6); c.fillRect(-4, -2, 8 + i % 3 * 3, 4); c.restore();
  }
  c.restore();
}

/** FX-05 plaster rain from the ceiling after the freeze breaks. */
export function plaster(c, t, art, cam) {
  if (t < 1.4 || t > 3.4) return;
  const k = (t - 1.4) / 2, w = 2100, h = w * art.plaster.height / art.plaster.width;
  c.save(); c.globalAlpha = 1 - progress(t, 2.7, 3.4);
  c.drawImage(art.plaster, -90 - cam.p * .9, lerp(-h * .8, H * .55, k), w, h);
  c.drawImage(art.plaster, 300 - cam.p * .9, lerp(-h * 1.4, H * .1, k), w * .8, h * .8);
  c.restore();
}

/** FX-08/FX-07 smoke rolling into the room through the gap from 0:02.5. */
export function smokeIn(c, t, art, cam) {
  if (t < 2.3 || t > 5.3) return;
  const k = t - 2.3, gap = 1250 - cam.p;
  c.save();
  for (let i = 0; i < 3; i++) {
    const w = 1500 + i * 300, h = w * art.smoke.height / art.smoke.width;
    c.globalAlpha = clamp(k / 1.2) * (.55 - i * .1) * (1 - progress(t, 4.6, 5.3));
    c.drawImage(art.smoke, gap - k * (180 + i * 90) - w * .3, 330 + i * 110 - k * 20 + cam.rise, w, h);
  }
  c.restore();
}

/** Muffled hearing (AU-08 ringing is absent): a dark lens edge while sound drops out. */
export function muffle(c, t) {
  const a = progress(t, 1.4, 1.6) * (1 - progress(t, 2.3, 2.6));
  if (a <= 0) return;
  const g = c.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .62);
  g.addColorStop(0, 'rgba(10,10,10,0)'); g.addColorStop(1, `rgba(10,10,10,${.55 * a})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

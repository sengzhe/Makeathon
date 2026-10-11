/**
 * S3 yard run (0:06–0:20): BG-02 farmyard at 15% saturation, ground-plane L4
 * sprites approached at v = 6 m/s, fence posts on L5, house-collapse dust surge,
 * the GI who falls, and smoke building toward the T-SMOKE wipe.
 */
import {W, H, clamp, lerp, progress, hash} from '../kit.js';
import {GROUND, ground, groundSprite, runMotion, veil} from './common.js';
import {createRunGround} from '../runground.js';

let runGround = null;

const START = 6;
/** Distance of a static world object that was z0 metres away at 0:06. */
const near = (z0, t) => z0 - GROUND.v * (t - START);
const CRATER = {X: -700, z0: 22}, CART = {X: -980, z0: 27}, SERGEANT = {X: -430, z0: 17};
// The far GI runs for the open gateway; the crater sits left, clear of the rifle.
const GI = [{X: -150, z: 9, phase: 0}, {X: 500, z: 12.5, phase: .17}];

/** Camera for the yard: run bob, sway and roll (no drift). */
export function yardCamera(t, reducedMotion) {
  const m = runMotion(t, 5.5, reducedMotion);
  return {p: 0, rise: 0, sx: m.x, sy: m.y, roll: m.roll, zoom: 1, ax: 0, ay: 0, tx: 0, ty: 0};
}

/** BG-02 as L0–L3: slow push toward the gate, horizon held at y_h. */
function backdrop(c, t, art) {
  const k = lerp(1.25, 1.32, progress(t, START, 18.5)), bg = art.yard;
  const x = clamp(1150 - 980 * k, W - bg.width * k, 0);
  const ox = x - 40, oy = GROUND.yh - 390 * k, sx = (bg.width * k + 80) / bg.width;
  c.drawImage(bg, ox, oy, bg.width * k + 80, bg.height * k);
  // Open gateway: the painted gate boards are covered by the field band behind them.
  c.drawImage(bg, 858, 345, 228, 58, ox + 858 * sx, oy + 402 * k, 228 * sx, 110 * k);
  // Streaming perspective ground below the gate line: mud passes under the camera.
  runGround ||= createRunGround(bg, {sy: 640, sh: 380, fog: '120,108,92'});
  runGround.draw(c, GROUND.v * Math.max(0, t - START), {top: GROUND.yh + 175, fogDepth: 40});
}

/** Running GI ahead: whole-sprite bob and lean, no limb animation. */
function runner(c, t, img, g, alpha) {
  const ph = Math.PI * 2.8 * (t + g.phase);
  groundSprite(c, img, g.z, g.X + Math.sin(ph) * 10, 620, {a: alpha, r: Math.sin(ph) * .03, lift: Math.abs(Math.sin(ph)) * 22, foot: .96});
}

/** The nearer GI falls at 0:12.4; the static body is revealed behind a mud splash. */
function fallen(c, t, art, alpha) {
  const g = GI[0];
  if (t < 12.4) { runner(c, t, art.gi1, g, alpha); return; }
  const z = t < 12.6 ? g.z : g.z - GROUND.v * (t - 12.6);
  if (z < .8) return;
  if (t < 13) {
    const k = progress(t, 12.4, 12.95);
    groundSprite(c, art.fall, z, g.X, 620, {r: lerp(0, .5, k), lift: lerp(0, -60, k), foot: .96});
  } else groundSprite(c, art.body, z, g.X + 40, 330, {foot: .9});
  const splash = progress(t, 12.75, 12.95) * (1 - progress(t, 13.1, 13.5));
  if (splash > 0) groundSprite(c, art.splash, z, g.X, 420, {a: splash, foot: .85});
}

/** SP-02 sergeant: static body with one separated arm rotating in a broad wave. */
function sergeant(c, t, art) {
  const z = near(SERGEANT.z0, t);
  const g = groundSprite(c, art.sgtBody, z, SERGEANT.X, 430, {foot: .985});
  if (!g) return;
  const k = 430 * g.s / art.sgtBody.height, wave = Math.sin((t - START) * Math.PI * 2.4) * .32;
  c.save(); c.translate(g.x, g.y - 620 * g.s * .985); c.scale(k, k);
  c.translate(310 - art.sgtBody.width / 2, 350); c.rotate(wave - .1); c.scale(.45, .45);
  c.drawImage(art.sgtArm, -496, -1300);
  c.restore();
}

/** Fence posts PR-17 passing both frame edges on L5. */
function posts(c, t, art) {
  for (let i = 16; i >= 0; i--) {
    const z = near(3 + i * 3.2, t), side = i % 2 ? 1 : -1;
    if (z < .7 || z > 45) continue;
    groundSprite(c, i % 3 ? art.post1 : art.post2, z, side * 1250, 520, {foot: .97});
  }
}

/** Visibility loss from the collapse dust: peaks at 70% cover for 2 s. */
export function haze(t) {
  return .7 * progress(t, 8.3, 8.8) * (1 - progress(t, 10.4, 11.3));
}

/** World layers L0–L5 for the yard (graded later). */
export function yardWorld(c, t, art) {
  backdrop(c, t, art);
  const hz = haze(t), swallow = 1 - .85 * hz / .7;
  const zc = near(CRATER.z0, t), zt = near(CART.z0, t);
  if (zt > .8) groundSprite(c, art.cart, zt, CART.X, 560, {foot: .95});
  if (zc > 4) groundSprite(c, art.crater, zc, CRATER.X, 760, {foot: .62});
  if (zc > 2) groundSprite(c, art.column, zc + 1, CRATER.X + 40, 1500, {a: .6, foot: .97});
  runner(c, t, art.gi2, GI[1], swallow);
  sergeant(c, t, art);
  fallen(c, t, art, swallow);
  posts(c, t, art);
}

/** Ungraded crater fire: stays orange in the drained yard. */
export function yardGlow(c, t, art, reducedMotion) {
  const z = near(CRATER.z0, t);
  if (z < 4) return;
  const flick = reducedMotion ? 0 : Math.sin(t * 15) * .05 + Math.sin(t * 23) * .03;
  groundSprite(c, art.fire, z, CRATER.X, 520 * (1 + flick), {a: 1 - haze(t) * .8, foot: .9});
}

/** Bricks from the collapse bouncing forward through L5, overtaking the camera. */
function bricks(c, t) {
  for (let i = 0; i < 9; i++) {
    const ts = 8.15 + i * .14, u = (t - ts) / 1.3;
    if (u < 0 || u > 1) continue;
    const z = lerp(.9, 10, u), X = (hash(i) - .5) * 2400;
    const g = ground(z, X), size = 90 * g.s, hop = Math.abs(Math.sin(u * Math.PI * 2.3)) * (1 - u) * 260;
    c.save(); c.translate(g.x, g.y - hop * g.s); c.rotate(u * 9 * (hash(i + 4) - .5));
    c.fillStyle = '#7d5240'; c.fillRect(-size, -size * .45, size * 2, size * .9);
    c.fillStyle = '#5a3a2d'; c.fillRect(-size, size * .2, size * 2, size * .25);
    c.restore();
  }
}

/** FX-28 dust surge overtaking along both edges and the bottom, then flat haze. */
function surge(c, t, art) {
  for (const [X, lift, delay] of [[-1350, 0, 0], [1350, 0, .12], [0, -220, .25]]) {
    const u = (t - 8 - delay) / 1.6;
    if (u < 0 || u > 1.6) continue;
    const g = ground(lerp(.55, 7, Math.min(u, 1)), X), w = 2200 * g.s;
    c.save(); c.globalAlpha = .9 * (1 - progress(u, 1, 1.6));
    c.drawImage(art.dust, g.x - w / 2, g.y - w * .45 + lift * g.s, w, w * art.dust.height / art.dust.width);
    c.restore();
  }
}

/** Smoke thickening from the left before the player's T-SMOKE wipe (18–20 s). */
function endSmoke(c, t, art) {
  const k = progress(t, 18, 19.8);
  if (k <= 0) return;
  c.save();
  for (let i = 0; i < 3; i++) {
    const w = 2000 + i * 400, h = w * art.smoke.height / art.smoke.width;
    c.globalAlpha = k * (.5 - i * .1);
    c.drawImage(art.smoke, lerp(-w, 200, k) - i * 300, 120 + i * 260, w, h);
  }
  c.restore();
}

/** Foreground effects above the rifle (graded): bricks, dust surge, haze, end smoke. */
export function yardOverlay(c, t, art) {
  bricks(c, t);
  surge(c, t, art);
  veil(c, '#8f826d', haze(t));
  endSmoke(c, t, art);
}

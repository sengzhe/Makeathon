/**
 * S3 shared helpers: ground-plane placement, run camera, shake, frozen world time
 * and graded presentation. Pure functions of scene time so the review tool can seek.
 */
import {W, H, clamp, hash, surface} from '../kit.js';

export const FPS = 24;
/** Ground-plane constants from the production script (Global Systems). */
export const GROUND = {z0: 5, yh: 430, y0: 1010, xc: 960, v: 6};

/**
 * Screen placement of a ground-plane point.
 * @param z distance from the camera in metres; X sideways offset in px at z0.
 * @returns {s, x, y} scale, screen x and feet y.
 */
export function ground(z, X, yh = GROUND.yh) {
  const s = GROUND.z0 / z;
  return {s, x: GROUND.xc + X * s, y: yh + (GROUND.y0 - yh) * s};
}

/**
 * Draw an L4 sprite standing on the ground plane, bottom-centre at its feet.
 * height is the drawn height in px at 100% scale (5 m); foot is the image row
 * fraction where the feet sit. Options: a alpha, r rotation about the feet, lift px.
 */
export function groundSprite(c, img, z, X, height, {a = 1, r = 0, lift = 0, foot = .98, flip = false} = {}) {
  if (z <= .2 || a <= 0) return null;
  const g = ground(z, X), h = height * g.s, w = h * img.width / img.height;
  c.save(); c.globalAlpha *= a; c.translate(g.x, g.y - lift * g.s); c.rotate(r);
  if (flip) c.scale(-1, 1);
  c.drawImage(img, -w / 2, -h * foot, w, h);
  c.restore();
  return g;
}

/**
 * Run bob and sway: 14 px dip per footstep at 2.8 steps/s, 8 px sway, roll ±1°.
 * gain scales amplitude (L7 uses 1.3); lag delays the cycle in seconds.
 */
export function runMotion(t, start, reducedMotion, gain = 1, lag = 0) {
  if (reducedMotion || t < start) return {x: 0, y: 0, roll: 0};
  const k = clamp((t - start) / .3) * gain, phase = Math.PI * 2.8 * (t - lag);
  return {x: 8 * Math.sin(phase) * k, y: 14 * Math.sin(phase) ** 2 * k, roll: Math.PI / 180 * Math.sin(phase) * k};
}

/** Deterministic random shake of amp px decaying to zero over dur seconds after start. */
export function shake(t, start, amp, dur, reducedMotion) {
  if (reducedMotion || t < start || t > start + dur) return {x: 0, y: 0};
  const f = Math.floor(t * FPS), k = amp * (1 - (t - start) / dur) ** 2;
  return {x: (hash(f) * 2 - 1) * k, y: (hash(f + 91) * 2 - 1) * k};
}

/** World clock with the 10-frame freeze (time scale 0) at 1.0–1.4 s. */
export function worldTime(t) {
  return t < 1 ? t : t < 1.4 ? 1 : t - .4;
}

/** Smooth irregular closed contour used for the fluid colour drain mask. */
export function blobPath(c, x, y, radius, seed = 0) {
  c.beginPath();
  for (let i = 0; i <= 72; i++) {
    const a = i / 72 * Math.PI * 2;
    const k = 1 + .09 * Math.sin(a * 5 + seed) + .05 * Math.sin(a * 11 - seed * 2);
    const px = x + Math.cos(a) * radius * k, py = y + Math.sin(a) * radius * k;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}

/**
 * Present an offscreen layer onto ctx at saturation sat. When keep is given
 * ({x, y, r}), full colour survives inside a shrinking fluid blob (FX-22 drain).
 */
export function present(ctx, layer, mask, sat, keep) {
  const m = mask.getContext('2d'), drain = keep && keep.r > 0;
  m.clearRect(0, 0, W, H);
  if (drain) {
    m.fillStyle = '#fff'; blobPath(m, keep.x, keep.y, keep.r, keep.seed || 0); m.fill();
    m.globalCompositeOperation = 'source-in'; m.drawImage(layer, 0, 0);
    m.globalCompositeOperation = 'source-over';
  }
  desaturate(layer, sat, drain ? null : mask);
  ctx.drawImage(layer, 0, 0);
  if (drain) ctx.drawImage(mask, 0, 0);
}

/**
 * Grade a layer in place toward grey with a 'saturation' blend (no ctx.filter,
 * which is slow in software rendering). spare, when given, preserves the alpha
 * of transparent layers; opaque world layers may pass null.
 */
function desaturate(layer, sat, spare) {
  if (sat >= .999) return;
  const c = layer.getContext('2d');
  if (spare) spare.getContext('2d').drawImage(layer, 0, 0);
  c.save(); c.globalCompositeOperation = 'saturation'; c.globalAlpha = 1 - sat;
  c.fillStyle = '#808080'; c.fillRect(0, 0, W, H);
  if (spare) { c.globalAlpha = 1; c.globalCompositeOperation = 'destination-in'; c.drawImage(spare, 0, 0); }
  c.restore();
}

/** Horizontal smear for the FX-30 whip pan: re-draws the frame at offsets. */
export function whipSmear(ctx, scratch, amount) {
  if (amount < 1) return;
  const s = scratch.getContext('2d');
  s.clearRect(0, 0, W, H); s.drawImage(ctx.canvas, 0, 0);
  ctx.save();
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = .22; ctx.drawImage(scratch, amount * i / 4, 0);
    ctx.drawImage(scratch, -amount * i / 8, 0);
  }
  ctx.restore();
}

/** Full-frame flat fill at alpha a. */
export function veil(c, color, a) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = clamp(a); c.fillStyle = color; c.fillRect(0, 0, W, H); c.restore();
}

/**
 * Copy of an effect image whose rectangular border fades out (elliptical feather),
 * so smoke and dust sprites never show hard source edges. Call once at mount.
 */
export function feather(img) {
  const out = surface(img.width, img.height), c = out.getContext('2d');
  c.drawImage(img, 0, 0);
  const g = c.createRadialGradient(img.width / 2, img.height / 2, 0, img.width / 2, img.height / 2, img.width / 2);
  g.addColorStop(0, '#000'); g.addColorStop(.62, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalCompositeOperation = 'destination-in';
  const sy = img.height / img.width;
  c.setTransform(1, 0, 0, sy, 0, img.height / 2 * (1 - sy));
  c.fillStyle = g; c.fillRect(0, -10 * img.height, img.width, 20 * img.height);
  return out;
}

/**
 * S4 camera: ground-plane projection, run bob/sway and the aim view transform.
 * Usage: const cam = runCamera(t, plan, opts); applyCamera(ctx, cam);
 */
import {W, H, clamp, lerp, hash} from '../kit.js';

export const HORIZON = 430, FEET = 1010, Z0 = 5, PX_PER_M = 362, EYE = 1.6;

/**
 * Ground-plane placement (script Global Systems). z = metres from camera,
 * X = sideways offset in px at z0, eye = camera height in metres.
 * Returns {x, y, s, m}: feet position, scale and px per metre at that depth.
 */
export function project(z, X = 0, eye = EYE) {
  const s = Z0 / Math.max(z, .05);
  return {x: W / 2 + X * s, y: HORIZON + (FEET - HORIZON) * (eye / EYE) * s, s, m: PX_PER_M * s};
}

/** Forward speed in m/s at t, from the integrated plan. */
export function speedAt(plan, t) {
  return (plan.at(t + .05).d - plan.at(t - .05).d) / .1;
}

/**
 * Run bob, sway and roll from the footstep phase. injured adds the uneven limp.
 * Returns {x, y, roll} in px/radians; scale multiplies the amplitude (L7 uses 1.3).
 */
export function bob(step, amp, injured, scale = 1) {
  const phase = Math.PI * step, limp = injured && Math.floor(step) % 2 ? 1.6 : 1;
  const a = amp * scale * (injured ? 1.15 : 1);
  return {
    x: 8 * a * Math.sin(phase / 2),
    y: 14 * a * limp * Math.abs(Math.sin(phase)),
    roll: (Math.PI / 180) * a * Math.sin(phase / 2),
  };
}

/** Short decaying world shake; deterministic noise keyed on the event time. */
export function shake(t, at, duration, px, seed = 1) {
  if (t < at || t > at + duration) return {x: 0, y: 0};
  const k = 1 - (t - at) / duration, f = Math.floor(t * 24);
  return {x: (hash(f + seed) - .5) * 2 * px * k, y: (hash(f * 3.1 + seed) - .5) * 2 * px * k};
}

/**
 * Camera state for L0–L6. aim = {x, y, zoom, weight}: world point brought to the
 * sight post at (SIGHT_X, SIGHT_Y) with the given zoom, blended by weight.
 */
export function cameraMatrix({bobX = 0, bobY = 0, roll = 0, tilt = 0, aim}) {
  const m = new DOMMatrix();
  m.translateSelf(W / 2 + bobX, H / 2 + bobY + tilt);
  m.rotateSelf(roll * 180 / Math.PI);
  m.translateSelf(-W / 2, -H / 2);
  if (aim && aim.weight > 0) {
    const zoom = lerp(1, aim.zoom, aim.weight);
    const tx = lerp(aim.x, SIGHT_X, aim.weight), ty = lerp(aim.y, SIGHT_Y, aim.weight);
    m.translateSelf(tx, ty).scaleSelf(zoom, zoom).translateSelf(-aim.x, -aim.y);
  }
  return m;
}

// Front-post tip of the HD-K2 sight sprite when drawn at full frame width.
export const SIGHT_X = 962, SIGHT_Y = 467;

/** Amplitude of the run bob: proportional to speed, reduced in reduced-motion mode. */
export function bobAmp(speed, reducedMotion) {
  return clamp(speed / 3.2) * (reducedMotion ? .2 : 1);
}

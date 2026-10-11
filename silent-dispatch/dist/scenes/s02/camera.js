/**
 * S2 camera: scripted head turn across the BG-01 panorama, upward roof tilt,
 * cup push-in and lagged mouse drift. Pan values are panorama (L3) pixels.
 * World space is the panorama drawn 1400 px high (4200 px wide).
 */
import {W, H, clamp, progress, lerp} from '../kit.js';

export const PANO_SCALE = 1400 / 724;
export const PANO_W = 2172 * PANO_SCALE, PANO_H = 1400;
/** Parallax factors (script layer stack). L3 is the panorama reference. */
export const L3 = .55, L5 = 1.2;
const DRIFT_X = 200, DRIFT_Y = 60;
export const START_PAN = 1380, START_Y = 300, LEVEL_Y = 150, GAP_PAN = 3000;

// Pan keyframes [time, panX]. Slow passages (~30-40 px/s) sit at the photo and calendar.
const PAN_KEYS = [[0, START_PAN], [4, START_PAN], [6, 1360], [8.5, 1320], [10, 1100], [12, 1150],
  [17.5, 1880], [19.5, 1950], [24, GAP_PAN], [40, GAP_PAN]];

/**
 * Monotone cubic (Fritsch-Carlson) interpolation through [t, v] keys.
 * Keeps the pan smooth through slow holds without overshooting a stop.
 */
function monotone(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  const d = keys.slice(1).map((k, i) => (k[1] - keys[i][1]) / (k[0] - keys[i][0]));
  const m = keys.map((_, i) => i === 0 ? d[0] : i === n - 1 ? d[n - 2]
    : d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i]));
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const h = keys[i + 1][0] - keys[i][0], s = (t - keys[i][0]) / h;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * keys[i][1] + (s3 - 2 * s2 + s) * h * m[i]
    + (-2 * s3 + 3 * s2) * keys[i + 1][1] + (s3 - s2) * h * m[i + 1];
}

/** Vertical framing: look down at the crate, level out, 8 degree roof tilt (0:06-0:08.5). */
function cameraY(t) {
  const rise = progress(t, 4, 6.2), tiltUp = progress(t, 6, 7), tiltDown = progress(t, 8.5, 10);
  return lerp(START_Y, LEVEL_Y, rise) - 140 * tiltUp * (1 - tiltDown);
}

/** Cup push (0:00-0:04): zoom toward the rim, then release as the head turns. */
function cameraZoom(t, reducedMotion) {
  const push = reducedMotion ? .06 : .14;
  return 1 + push * progress(t, .2, 2.8) * (1 - progress(t, 3.8, 5.4));
}

/**
 * Create the camera controller. drift lags the pointer by ~0.3 s (head movement).
 * Returns {update(time, delta, pointer), layer(c, f), state}.
 */
export function createCamera({reducedMotion = false} = {}) {
  const lagged = {x: 0, y: 0};
  const state = {p: START_PAN, y: START_Y, zoom: 1, dx: 0, dy: 0};
  function update(time, delta, pointer = {x: 0, y: 0}) {
    const k = delta > 0 ? 1 - Math.exp(-delta / .3) : 0;
    lagged.x += (clamp(pointer.x || 0, -1, 1) - lagged.x) * k;
    lagged.y += (clamp(pointer.y || 0, -1, 1) - lagged.y) * k;
    // Drift fades in after the cut so Scene 1's last framing is not jolted.
    const amount = (reducedMotion ? .35 : 1) * progress(time, 0, 2);
    state.p = monotone(PAN_KEYS, time);
    state.y = cameraY(time);
    state.zoom = cameraZoom(time, reducedMotion);
    state.dx = lagged.x * DRIFT_X * amount;
    state.dy = lagged.y * DRIFT_Y * amount;
    return state;
  }
  /**
   * Set c's transform for a layer with parallax f. Panorama-attached art uses f = L3
   * and world coordinates. Zoom is centred on (zx, zy) and scaled by depth.
   */
  function layer(c, f = L3, {zx = 1458, zy = 653, origin = 'world'} = {}) {
    const r = f / L3, z = 1 + (state.zoom - 1) * f / L5;
    let tx, ty;
    if (origin === 'world') {
      // The panorama edge never enters frame, whatever the drift.
      tx = W / 2 - clamp(state.p + state.dx * f, W / 2, PANO_W - W / 2);
      ty = -clamp(state.y + state.dy * f, 0, PANO_H - H);
    } else {
      // Foreground props keep Scene 1 screen coordinates at the opening framing.
      tx = -(state.p - START_PAN) * r - state.dx * f;
      ty = -(state.y - START_Y) * r * 2.2 - state.dy * f;
    }
    c.setTransform(z, 0, 0, z, zx + (tx - zx) * z, zy + (ty - zy) * z);
    return {a: z, e: zx + (tx - zx) * z, f: zy + (ty - zy) * z};
  }
  /** Screen position and scale of a panorama point under the current L3 transform. */
  function toScreen(X, Y) {
    const z = 1 + (state.zoom - 1) * L3 / L5, zx = 1458, zy = 653;
    const tx = W / 2 - clamp(state.p + state.dx * L3, W / 2, PANO_W - W / 2);
    const ty = -clamp(state.y + state.dy * L3, 0, PANO_H - H);
    return {x: zx + (X + tx - zx) * z, y: zy + (Y + ty - zy) * z, s: z};
  }
  return {update, layer, toScreen, state};
}

/** Map the player's normalised pointer (-1..1 of the viewport) into canvas pixels. */
export function pointerToCanvas(pointer, canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return {x: W / 2, y: H / 2};
  const s = Math.min(rect.width / W, rect.height / H);
  const px = ((pointer.x || 0) + 1) / 2 * rect.width, py = ((pointer.y || 0) + 1) / 2 * rect.height;
  return {x: (px - (rect.width - W * s) / 2) / s, y: (py - (rect.height - H * s) / 2) / s};
}

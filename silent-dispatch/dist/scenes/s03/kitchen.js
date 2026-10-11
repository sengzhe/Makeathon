/**
 * S3 kitchen set (0:00–0:06): BG-01 layers, camera pans, rise and doorway run-in.
 * World units: L3 image px × K. Pan offset p is 0 on the wall gap, negative to the left.
 */
import {W, H, clamp, lerp, progress} from '../kit.js';
import {shake, runMotion, groundSprite} from './common.js';

export const K = 1.9;                 // L3 source px -> screen px
const CAM_GAP = 3060, OY = -700;      // camera centre (world x) on the gap; L3 vertical offset
export const PAN = {crate: -1160, door: -2010};
export const BLAST = {x: 1250, y: 623}; // impact 15 m outside the gap, at the gap view
/** Parallax factors relative to L3 (script factor / 0.55). */
const F = {sky: .1, field: .27, far: .4, near: 2.2};

/**
 * Kitchen camera at scene time t.
 * @returns {p, rise, sx, sy, roll, zoom, ax, ay, tx, ty} pan, rise, shake/bob and doorway zoom.
 */
export function kitchenCamera(t, reducedMotion) {
  let p = 0;
  if (t >= 3) p = lerp(0, PAN.crate, progress(t, 3, 3.4));
  if (t >= 5) p = lerp(PAN.crate, PAN.door, progress(t, 5, 5.4));
  const rise = 80 * progress(t, 4, 4.5);
  const sh = shake(t, 1.4, 30, .6, reducedMotion), bob = runMotion(t, 5.5, reducedMotion);
  const z = Math.max(.45, 3.6 - 6 * Math.max(0, t - 5.5));
  const zoom = t < 5.5 ? 1 : 3.6 / z, turn = progress(t, 5.5, 5.95);
  const door = doorwayScreen(p, rise);
  return {p, rise, sx: sh.x + bob.x, sy: sh.y + bob.y, roll: bob.roll, zoom,
    ax: door.x, ay: door.y, tx: lerp(door.x, 960, turn), ty: lerp(door.y, 520, turn)};
}

/** Screen position of the doorway opening centre for pan p (before zoom). */
function doorwayScreen(p, rise) {
  return {x: 172 * K - (CAM_GAP + p) + 960, y: 500 * K + OY + rise};
}

/** Screen x of the L3 broken-wall extreme right edge, used to clip exterior glow. */
export function wallEdge(cam) {
  return 1515 * K - (CAM_GAP + cam.p) + 960;
}

/** Apply shake, bob, roll and the doorway zoom to a context. Caller saves/restores. */
export function applyCamera(c, cam) {
  c.translate(W / 2 + cam.sx, H / 2 + cam.sy); c.rotate(cam.roll); c.translate(-W / 2, -H / 2);
  if (cam.zoom !== 1) { c.translate(cam.tx, cam.ty); c.scale(cam.zoom, cam.zoom); c.translate(-cam.ax, -cam.ay); }
}

/** Exterior seen through the gap: sky, field, the humming GI and markers. */
function exterior(c, t, art, cam) {
  const shift = -cam.p;
  c.drawImage(art.sky, -320 + shift * F.sky, -620 + cam.rise * .1, 2700, 1800);
  c.fillStyle = '#6b6858'; c.fillRect(-200 + shift * F.field, 640 + cam.rise * .4, 2600, 900);
  c.drawImage(art.field, -220 + shift * F.field, -562 + cam.rise * .4, 1536 * 1.6, 1024 * 1.6);
  c.save(); c.translate(shift * F.far, cam.rise * .45);
  for (const [X, z] of [[3800, 40], [4850, 40.5], [5300, 41]]) groundSprite(c, art.marker, z, X, 430, {foot: .985});
  humming(c, t, art);
  c.restore();
  // Cold exterior grade; the interior layers drawn next keep their warm light.
  c.fillStyle = 'rgba(88,104,122,.34)'; c.fillRect(0, 0, W, H);
}

/** SP-13 at 40 m: body rig plus a separated head that turns up at the whistle. */
function humming(c, t, art) {
  const g = groundSprite(c, art.gi, 40, 4330, 470, {r: Math.sin(t * 1.3) * .01, foot: .96});
  if (!g) return;
  const k = 470 * g.s / art.gi.height, lift = progress(t, .1, .6);
  c.save(); c.translate(g.x, g.y - 470 * g.s * .96); c.scale(k, k);
  c.translate(578 - art.gi.width / 2, 135);
  c.rotate(lerp(.55, 0, lift)); c.scale(.38, .38);
  c.drawImage(art.head, -715, -1090);
  c.restore();
}

/** Room floor up to the broken wall, with plank seams receding to the gap. */
function floor(c, cam) {
  const top = 800 + cam.rise, end = 2950 - (CAM_GAP + cam.p) + 960;
  const g = c.createLinearGradient(0, top, 0, H + 120);
  g.addColorStop(0, '#3d2c1d'); g.addColorStop(1, '#1e150d');
  c.fillStyle = g; c.fillRect(-400, top, end + 400, H + 400);
  c.strokeStyle = 'rgba(14,9,5,.45)'; c.lineWidth = 3;
  for (let i = -14; i <= 14; i++) {
    const x = 960 + i * 210 - cam.p * 1.6;
    if (x < -900 || x > end + 600) continue;
    c.beginPath(); c.moveTo(lerp(x, 960 - cam.p, .55), top); c.lineTo(x + i * 60, H + 200); c.stroke();
  }
}

/** L3 walls with a shadowed corner wall continuing left of the source image. */
function walls(c, art, cam) {
  const x0 = -(CAM_GAP + cam.p) + 960, y0 = OY + cam.rise;
  c.fillStyle = '#24190f'; c.fillRect(-2000, -400, x0 + 2000 + 60, 1210 + cam.rise + 400);
  c.drawImage(art.walls, x0, y0, 1536 * K, 1024 * K);
}

/** Brick heap on L5 at the gap base. */
function heap(c, art, cam) {
  const x = 1230 - cam.p * F.near, w = 1500, h = w * art.heap.height / art.heap.width;
  c.drawImage(art.heap, x - w / 2, 1095 + cam.rise * 1.6 - h * .8, w, h);
}

/** Draw BG-01 world layers L0–L5 into c (no props). */
export function kitchenWorld(c, t, art, cam) {
  exterior(c, t, art, cam);
  floor(c, cam);
  walls(c, art, cam);
  heap(c, art, cam);
}

/** Black hallway coverage for 4 frames as the doorframe passes the lens. */
export function doorwayDark(t) {
  return clamp((t - 5.72) / .11);
}

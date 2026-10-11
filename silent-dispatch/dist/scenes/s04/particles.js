/**
 * S4 procedural particle clusters: snow FX-06, crows FX-24, embers FX-25,
 * liquid tracers FX-29, ground clods and concealment puffs. All positions are
 * deterministic functions of world time (wt) so seeking is stable.
 */
import {W, H, clamp, lerp, hash, ease} from '../kit.js';
import {project} from './camera.js';

const wrap = (v, m) => ((v % m) + m) % m;

/** Steady snowfall on L6. density 0..1 scales the flake count. */
export function snow(c, wt, {density = 1, reducedMotion = false} = {}) {
  const n = Math.round(170 * density), speed = reducedMotion ? .4 : 1;
  c.save(); c.fillStyle = '#eef0ee';
  for (let i = 0; i < n; i++) {
    const depth = .35 + hash(i * 1.3) * .65, size = 1.2 + depth * 4.2;
    const x = wrap(hash(i) * (W + 200) + wt * speed * (14 + depth * 22) + Math.sin(wt * .7 + i) * 18, W + 200) - 100;
    const y = wrap(hash(i * 2.7) * (H + 120) + wt * speed * (40 + depth * 90), H + 120) - 60;
    c.globalAlpha = .35 + depth * .5;
    c.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 + i, r = size * (k % 2 ? .7 : 1);
      k ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    c.fill();
  }
  c.restore();
}

// Source crops of FX-24 crow parts v2: wings up, wings down, glide.
const CROWS = [[1031, 69, 657, 381], [600, 393, 640, 451], [90, 106, 843, 287]];

/**
 * Crow cluster: about 150 birds burst up from the furrows at u = 0 (seconds of
 * world time since the burst), split into two groups and wheel across L2–L3.
 */
export function crows(c, img, u, {count = 150, reducedMotion = false} = {}) {
  if (u < 0 || u > 14) return;
  for (let i = 0; i < count; i++) {
    const delay = hash(i * 5.1) * .5, v = u - delay;
    if (v < 0) continue;
    const dir = i % 2 ? 1 : -1, x0 = 260 + hash(i) * 1400, y0 = 560 + hash(i * 3.3) * 200;
    const rise = ease(v / 1.6) * (300 + hash(i * 7.7) * 160);
    const x = x0 + dir * (v * (90 + hash(i * 1.9) * 80) + v * v * 14) + Math.sin(v * 1.1 + i) * 50;
    const y = y0 - rise - v * 12 + Math.sin(v * .8 + i * .3) * 30 * clamp(v - 1.5);
    const size = (16 + hash(i * 2.2) * 26) * lerp(1.5, 1, clamp(v / 2));
    const beat = reducedMotion ? .6 : Math.abs(Math.sin(v * (9 + hash(i) * 4) + i));
    const [sx, sy, sw, sh] = CROWS[v > 4 && i % 3 === 0 ? 2 : beat > .5 ? 0 : 1];
    c.save(); c.translate(x, y); if (dir < 0) c.scale(-1, 1);
    c.globalAlpha = clamp(v * 4) * clamp((14 - u) / 2);
    c.drawImage(img, sx, sy, sw, sh, -size / 2, -size * sh / sw / 2, size, size * sh / sw);
    c.restore();
  }
}

/** Perched crows on a ridge from (x0,y0) to (x1,y1); n birds, size px; landing over u 0..1. */
export function perchedCrows(c, img, {x0, y0, x1, y1, n = 5, size = 30, u = 1}) {
  for (let i = 0; i < n; i++) {
    const f = (i + .5) / n, land = clamp(u * 1.5 - i * .1);
    const x = lerp(x0, x1, f), y = lerp(y0, y1, f) - (1 - ease(land)) * size * 3;
    const [sx, sy, sw, sh] = CROWS[land < 1 ? 0 : 1];
    c.save(); c.translate(x, y - size * .35); c.scale(i % 2 ? -1 : 1, land < 1 ? 1 : .8);
    c.globalAlpha = clamp(land * 3);
    c.drawImage(img, sx, sy, sw, sh, -size / 2, -size * sh / sw / 2, size, size * sh / sw);
    c.restore();
  }
}

/** Ember cluster: about 300 sparks drifting across the frame. Coloured layer. */
export function embers(c, wt, {count = 300, intensity = 1, reducedMotion = false} = {}) {
  const speed = reducedMotion ? .35 : 1;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const depth = .3 + hash(i * 4.1) * .7, s = 1.5 + depth * 4.5;
    const x = wrap(hash(i * 1.7) * (W + 300) - wt * speed * (40 + depth * 90), W + 300) - 150;
    const y = wrap(hash(i * 6.1) * H * .9 + 120 - wt * speed * (18 + depth * 30) + Math.sin(wt * 1.3 + i) * 22, H);
    const glow = .5 + .5 * Math.sin(wt * 2.2 + i * 1.7);
    c.globalAlpha = intensity * (.35 + .5 * glow) * depth;
    c.fillStyle = glow > .6 ? '#ffc35a' : '#ff7a1c';
    c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * .6, y); c.lineTo(x, y + s); c.lineTo(x - s * .6, y); c.fill();
  }
  c.restore();
}

/**
 * Liquid-light tracers from origin toward the camera. firing(wt) tells whether the
 * gun fires at a given world time; each round lives 0.5 s. Coloured layer.
 */
export function tracers(c, wt, origin, firing, {rate = .13} = {}) {
  const first = Math.floor((wt - .5) / rate), last = Math.floor(wt / rate);
  c.save(); c.lineCap = 'round';
  for (let k = first; k <= last; k++) {
    const born = k * rate;
    if (!firing(born)) continue;
    const p = (wt - born) / .5;
    if (p < 0 || p > 1) continue;
    const ex = W / 2 + (hash(k) - .5) * 3400, ey = 260 + hash(k * 1.7) * 1100;
    const at = q => ({x: lerp(origin.x, ex, q * q), y: lerp(origin.y, ey, q * q) - Math.sin(q * Math.PI) * 40});
    const head = at(p), tail = at(Math.max(0, p - .16)), width = lerp(1.5, 22, p * p);
    const g = c.createLinearGradient(tail.x, tail.y, head.x, head.y);
    g.addColorStop(0, 'rgba(255,110,20,0)'); g.addColorStop(.7, 'rgba(255,140,40,.75)'); g.addColorStop(1, 'rgba(255,236,170,1)');
    c.strokeStyle = g; c.lineWidth = width;
    c.beginPath(); c.moveTo(tail.x, tail.y); c.lineTo(head.x, head.y); c.stroke();
    c.fillStyle = 'rgba(255,150,50,.8)';
    for (let d = 1; d <= 3; d++) {
      const q = at(Math.max(0, p - .05 * d - .1)), r = width * (.35 - d * .07);
      c.beginPath(); c.arc(q.x + (hash(k + d) - .5) * width, q.y + d * width * .4, Math.max(.6, r), 0, Math.PI * 2); c.fill();
    }
  }
  c.restore();
}

/** Ground clods on the plane: they stream toward the camera with distance d. */
export function clods(c, d, eye, {count = 70, seed = 1, tone = 'rgba(48,40,32,.22)'} = {}) {
  c.save(); c.fillStyle = tone;
  for (let i = 0; i < count; i++) {
    const z = 1.2 + wrap(hash(i * 3.1 + seed) * 26 - d, 26), X = (hash(i * 7.9 + seed) - .5) * 5200;
    const p = project(z, X, eye), r = (.08 + hash(i) * .16) * p.m;
    if (p.y > H + r) continue;
    c.beginPath(); c.ellipse(p.x, p.y, r * 1.6, r * .55, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

/** A smoke or mud puff that swells and fades over u 0..1; conceals sprite swaps. */
export function puff(c, img, x, y, size, u) {
  if (u <= 0 || u >= 1) return;
  const a = Math.sin(u * Math.PI);
  c.save(); c.globalAlpha *= a * .95;
  const w = size * lerp(.6, 1.25, u), h = w * img.height / img.width;
  c.drawImage(img, x - w / 2, y - h * .8, w, h);
  c.restore();
}

/**
 * S4 ground-plane figures: alpha bounds, generic L4 sprites, the SP-01 run rig,
 * flare shadows and body scatter. All sizes are world metres via camera.project().
 */
import {surface, hash} from '../kit.js';
import {project} from './camera.js';

const boundsCache = new WeakMap();

/** Alpha bounding box of an image in source px ({x, y, w, h}); cached per image. */
export function bounds(img) {
  let b = boundsCache.get(img);
  if (b) return b;
  const sw = 192, sh = Math.max(1, Math.round(img.height * sw / img.width));
  const probe = surface(sw, sh), c = probe.getContext('2d', {willReadFrequently: true});
  c.drawImage(img, 0, 0, sw, sh);
  const data = c.getImageData(0, 0, sw, sh).data;
  let x0 = sw, y0 = sh, x1 = 0, y1 = 0;
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    if (data[(y * sw + x) * 4 + 3] > 40) {x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);}
  }
  const k = img.width / sw;
  b = {x: x0 * k, y: y0 * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k};
  boundsCache.set(img, b); probe.width = 0;
  return b;
}

/**
 * Draw an L4 sprite standing on the ground plane. opts: z, X, h or w (metres of
 * the alpha box), eye, flip, r (radians about the feet), a, lift (metres), sink
 * (fraction of the box pushed below the feet line), dry (measure only). Returns the screen box.
 */
export function groundSprite(c, img, {z, X = 0, h, w, eye, flip = false, r = 0, a = 1, lift = 0, sink = 0, dry = false, flat = 1}) {
  const p = project(z, X, eye), b = bounds(img);
  const k = h ? h * p.m / b.h : w * p.m / b.w;
  const dw = b.w * k, dh = b.h * k * flat, x = p.x, y = p.y - lift * p.m + sink * dh;
  if (dry) return {x: x - dw / 2, y: y - dh, w: dw, h: dh, cx: x, feet: y, m: p.m};
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(r);
  if (flip) c.scale(-1, 1);
  c.drawImage(img, b.x, b.y, b.w, b.h, -dw / 2, -dh, dw, dh);
  c.restore();
  return {x: x - dw / 2, y: y - dh, w: dw, h: dh, cx: x, feet: y, m: p.m};
}

// Rig metrics in source px: legs [top, bottom, centreX], upper [bottom]. Scale 0.6, 110 px overlap.
const RIG = {
  1: {contact: [88, 1479, 565], passing: [42, 1450, 546], upper: 1114},
  2: {contact: [61, 1216, 688], passing: [154, 1342, 517], upper: 1174},
  3: {contact: [78, 1196, 581], passing: [17, 1514, 520], upper: 1183},
};
const UPPER_SCALE = .6, OVERLAP = 110;

/**
 * SP-01 running rig seen from behind: legs alternate contact/passing (contact is
 * mirrored on alternate steps), the upper body bobs on the passing pose.
 * phase counts steps; the figure is 1.8 m tall. Returns the screen box.
 */
export function runner(c, art, v, {z, X, eye, phase, a = 1}) {
  const rig = RIG[v], p = project(z, X, eye), [ct, cb] = rig.contact;
  const figure = cb - (ct + OVERLAP - rig.upper * UPPER_SCALE);
  const k = 1.8 * p.m / figure, step = Math.floor(phase) % 4, passing = step % 2 === 1;
  const legs = passing ? art[`gi${v}Passing`] : art[`gi${v}Contact`];
  const [lt, , lcx] = passing ? rig.passing : rig.contact;
  const rise = passing ? .05 * p.m : 0;
  const waist = p.y - (cb - ct) * k - rise;
  const upper = art[`gi${v}Upper`];
  c.save(); c.globalAlpha *= a;
  c.save(); c.translate(p.x, waist);
  if (step === 2) c.scale(-1, 1);
  c.drawImage(legs, -lcx * k, -lt * k, legs.width * k, legs.height * k);
  c.restore();
  const uw = upper.width * UPPER_SCALE * k, uh = upper.height * UPPER_SCALE * k;
  const sway = Math.sin(phase * Math.PI) * .02;
  c.translate(p.x, waist + OVERLAP * k); c.rotate(sway);
  c.drawImage(upper, -uw / 2, -uh, uw, uh);
  c.restore();
  return {x: p.x - .4 * p.m, y: p.y - 1.8 * p.m, w: .8 * p.m, h: 1.8 * p.m, feet: p.y, m: p.m};
}

/**
 * Flare shadow for a sprite box: a dark, sheared and flattened copy cast toward
 * the camera, swinging with the flare's x. strength 0..1.
 */
export function flareShadow(c, img, box, flareX, strength) {
  if (strength <= 0 || !box) return;
  const b = bounds(img), shear = (box.cx ?? box.x + box.w / 2) > flareX ? -1.4 : 1.4;
  const swing = (flareX - 960) / 960;
  c.save(); c.globalAlpha *= .38 * strength; c.filter = 'brightness(0)';
  c.translate(box.cx ?? box.x + box.w / 2, box.feet);
  c.transform(1, 0, -(shear * .4 + swing * .9), -.32, 0, 0);
  c.drawImage(img, b.x, b.y, b.w, b.h, -box.w / 2, -box.h, box.w, box.h);
  c.restore();
}

/**
 * Deterministic body scatter along the run. count bodies per 'spacing' metres,
 * starting ahead of the set start. Returns [{key, z0, X, flip, w}] sorted far to near.
 */
export function scatterBodies(keys, count, seed, {near = 6, far = 46, side = 2600}) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const r = hash(seed + i * 7.3), q = hash(seed * 2.1 + i * 3.7);
    const sideSign = hash(seed + i) > .5 ? 1 : -1;
    list.push({key: keys[(i + seed) % keys.length], z0: near + (far - near) * r, X: sideSign * (380 + q * side), flip: q > .5, w: 1.75});
  }
  return list;
}

/** Soft contact shadow under a ground point; width in metres. */
export function contact(c, f, z, X, width) {
  if (z <= .5) return;
  const p = f.project(z, X), w = width * p.m;
  c.save(); c.fillStyle = 'rgba(18,16,14,.3)';
  c.beginPath(); c.ellipse(p.x, p.y, w * .5, Math.max(2, w * .09), 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

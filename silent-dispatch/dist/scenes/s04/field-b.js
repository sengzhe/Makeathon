/**
 * S4 Field B (0:40–1:15): BG-04 crater field, Karl's crater at 20 m with fire
 * behind, Shot 2, Tommy's wound, Karl on the near lip and his photograph.
 */
import {clamp, lerp, ease, surface} from '../kit.js';
import {backdrop} from './backdrop.js';
import {groundSprite, scatterBodies, bounds, contact} from './figures.js';
import {createRunGround} from '../runground.js';
import {HORIZON, EYE} from './camera.js';
import {snow, clods, puff} from './particles.js';
import {BODY_KEYS} from './assets.js';

const BODIES = scatterBodies(BODY_KEYS, 14, 11, {near: 5, far: 78, side: 2600});
// Crater art is drawn from above; flatten it for the ground-level eye so it reads as a hollow.
const CRATER_FLAT = .42;
const CRATERS = [{z0: 14, X: -1500, k: 'craterBowl2', w: 5}, {z0: 33, X: 1700, k: 'craterBowl3', w: 6}, {z0: 52, X: -900, k: 'craterBowl2', w: 4.5}, {z0: 66, X: 2100, k: 'craterBowl3', w: 5}];
export const PHOTO_SPLASH = 73.2;
// Karl stands on the far rim so the fire outlines him above the bowl.
const KARL_Z = 3.2;

/** Karl as a near-black silhouette, prepared once (script: black against fire). */
function silhouette(img) {
  const s = surface(img.width, img.height), c = s.getContext('2d');
  c.filter = 'brightness(.34) contrast(1.1)'; c.drawImage(img, 0, 0);
  return s;
}

export function createFieldB(art, reducedMotion) {
  const karlDark = silhouette(art.karl);
  // Streaming churned-mud plane from the plate's near rows (blurred and mirrored once).
  const ground = createRunGround(art.bgB, {sy: 620, sh: 404, fog: '128,118,104'});
  const since = (f, ref) => f.d - f.plan.at(ref).d;
  const craterZ = f => 20 - since(f, f.shots[1].start);

  /** Crater bowl and near lip share one registration; returns the mapping. */
  function craterMap(f, z) {
    const p = f.project(z, 0), b = bounds(art.craterBowl), k = 7.2 * p.m / b.w;
    return {x: p.x - (b.x + b.w / 2) * k, y: p.y - (b.y + b.h) * k * CRATER_FLAT, k, p};
  }
    const craterImg = (c, img, m) => c.drawImage(img, m.x, m.y, img.width * m.k, img.height * m.k * CRATER_FLAT);

  /** Karl's vertical offset in metres: rises before the shot, drops after it. */
  function karlLift(f) {
    const s = f.shots[1], up = ease((f.t - (s.start - .6)) / .9), down = ease((f.t - s.fire - .1) / .5);
    return lerp(-1.3, .3, up * (1 - down));
  }

  function fire(c, f, z, X, w, img, seed) {
    const p = f.project(z, X), flick = reducedMotion ? 0 : Math.sin(f.wt * 7 + seed) * .04 + Math.sin(f.wt * 11.3 + seed) * .03;
    const dw = w * p.m * (1 + flick), dh = dw * img.height / img.width * (1 + flick * 1.5);
    c.drawImage(img, p.x - dw / 2, p.y - dh * .97, dw, dh);
  }

  function crater(c, f, cz) {
    const m = craterMap(f, cz), karl = karlLift(f);
    contact(c, f, cz - .3, 0, 7.6);
    craterImg(c, art.craterBowl, m);
    craterImg(c, art.craterLip, m);
    if (karl > -1.25 && f.t < f.shots[1].fire + 1) {
      const kp = f.project(cz + KARL_Z, 0), h = 1.25 * kp.m, w = h * art.karl.width / art.karl.height;
      c.save(); c.beginPath(); c.rect(kp.x - w, -2000, w * 2, kp.y + 2000); c.clip();
      c.drawImage(karlDark, kp.x - w / 2, kp.y + .1 * kp.m - h - karl * kp.m, w, h);
      c.restore();
    }
    if (f.t >= f.hit - .2) groundSprite(c, art.karlDead, {z: cz - 2.1, X: -120, w: 2.1, eye: f.eye, sink: .25});
  }

  function render(comp, f) {
    const dB = since(f, 40), cz = craterZ(f);
    // First layer: the colour pass is still empty, so its erase draw is skipped.
    comp.draw((c, pass) => {
      if (pass === 'colour') return;
      backdrop(c, art.bgB, {horizon: .33, zoom: 1 + dB * .003});
      ground.draw(c, dB, {horizon: HORIZON, top: 590, eye: f.eye / EYE, feather: 80});
    });
    comp.draw(c => {
      clods(c, dB, f.eye, {seed: 7});
      for (const b of BODIES) { const z = b.z0 - dB; if (z > .9 && z < 70 && Math.abs(z - cz) > 2) contact(c, f, z, b.X, 1.9); }
      for (const cr of CRATERS) { const z = cr.z0 - dB; if (z > 1 && z < 70 && !(Math.abs(z - cz) < 9 && Math.abs(cr.X) < 2600)) groundSprite(c, art[cr.k], {z, X: cr.X, w: cr.w, eye: f.eye, sink: .2, flat: CRATER_FLAT}); }
      for (const b of BODIES) { const z = b.z0 - dB; if (z > .9 && z < 70 && Math.abs(z - cz) > 2) groundSprite(c, art[b.key], {z, X: b.X, w: b.w, eye: f.eye, flip: b.flip}); }
    });
    if (cz > 1.2) {
      comp.draw(c => { fire(c, f, cz + 4, 0, 5.2, art.fireL, 1); fire(c, f, cz + 6, -900, 2.4, art.fireS, 2); fire(c, f, cz + 5, 1100, 2.2, art.fireS, 3); }, true);
      comp.draw(c => crater(c, f, cz));
    } else comp.draw(c => groundSprite(c, art.karlDead, {z: Math.max(cz - 2.1, .5), X: -120, w: 2.1, eye: f.eye, sink: .25}));
    comp.draw(c => snow(c, f.wt, {reducedMotion}));
  }

  /** Photo PR-15 on L5 with TX-03 and the FX-11 mud throw (camera-locked plane). */
  function photo(comp, f, bobY) {
    const t = f.t, rise = ease((t - 70.6) / 1.6), gone = ease((t - 74.6) / .6);
    if (rise <= 0) return;
    const img = t < PHOTO_SPLASH + .12 ? art.photo : art.photoMud;
    const w = 560, h = w * img.height / img.width, x = 610, y = lerp(1500, 690, rise) + gone * 500 + bobY * .8;
    comp.draw(c => {
      c.save(); c.translate(x, y); c.rotate(-.13);
      c.drawImage(img, -w / 2, -h / 2, w, h);
      c.font = `italic ${Math.round(w * .052)}px "IM Fell English", Georgia, serif`;
      c.fillStyle = 'rgba(52,40,28,.86)'; c.textAlign = 'center';
      c.globalAlpha = img === art.photo ? 1 : .8;
      c.fillText('Für Karl — komm bald heim', w * .005, h * .36);
      c.restore();
      const u = (t - PHOTO_SPLASH) / .55;
      if (u > 0 && u < 1) {
        const sw = 900 * lerp(.5, 1.1, ease(u)), sh = sw * art.mud.height / art.mud.width;
        c.save(); c.globalAlpha = Math.sin(u * Math.PI) * 1.2;
        c.drawImage(art.mud, x - sw / 2, y - sh * .55 - u * 60, sw, sh);
        c.restore();
      }
    });
  }

  /** Shot 2 target: Karl's head and rifle above the rim. */
  function target(f) {
    const kp = f.project(craterZ(f) + KARL_Z, 0);
    return {x: kp.x, y: kp.y - .62 * kp.m};
  }
  const view = () => ({eye: 1.6, tilt: 0});
  return {render, photo, target, view};
}

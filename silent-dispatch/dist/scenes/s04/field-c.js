/**
 * S4 Field C (1:15–1:45): BG-05 layered plates, burned vehicle with fire, embers,
 * the medic over the wounded man, the wall soldier (Shot 3), the flare and the
 * boy in the foxhole glimpsed for 18 frames.
 */
import {clamp, lerp, ease, surface} from '../kit.js';
import {backdrop} from './backdrop.js';
import {groundSprite, scatterBodies, flareShadow, contact} from './figures.js';
import {createRunGround} from '../runground.js';
import {HORIZON, EYE} from './camera.js';
import {snow, embers, clods} from './particles.js';
import {BODY_KEYS} from './assets.js';

const MEDIC = {z0: 29, X: -1500}, WALL = {z0: 38, X: -500}, FOX = {z0: 26, X: 1300}, CAR = {z0: 44, X: 1500};
const M = 362; // px per metre at z0, for sideways distances

/**
 * Bodies kept clear of the medic group, foxhole, wall and vehicle, and at least
 * 2 m from each other, so no two sprites heap into one pile.
 */
function spreadBodies() {
  const keep = [], clear = [[MEDIC, 8, 3400], [FOX, 5, 1700], [CAR, 4, 2200]];
  for (const b of scatterBodies(BODY_KEYS, 22, 23, {near: 4, far: 40, side: 2900})) {
    if (clear.some(([o, dz, dx]) => Math.abs(b.z0 - o.z0) < dz && Math.abs(b.X - o.X) < dx)) continue;
    if (b.z0 > WALL.z0 - 6 && Math.abs(b.X - WALL.X) < 2200) continue;
    if (keep.some(k => (k.z0 - b.z0) ** 2 + ((k.X - b.X) / M) ** 2 < 4)) continue;
    keep.push(b);
  }
  return keep.slice(0, 14);
}
const BODIES = spreadBodies();
export const FLARE = {rise: 86, hang: 87, fade: 101, dead: 103.8};

/** Orange side light clipped to the boy's alpha, prepared once (coloured pass). */
function sideLight(img) {
  const s = surface(img.width, img.height), c = s.getContext('2d');
  // Light only the head and shoulders, flare side; the sandbags stay grey.
  const g = c.createLinearGradient(img.width * .3, 0, img.width * .62, 0);
  g.addColorStop(0, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,120,30,0)');
  c.fillStyle = g; c.fillRect(0, 0, img.width, img.height * .62);
  c.globalCompositeOperation = 'destination-in'; c.drawImage(img, 0, 0);
  return s;
}

/** Flare light level 0..1 for scene time t. */
export function flareLevel(t) {
  return clamp((t - FLARE.rise - .2) / .8) * (1 - clamp((t - FLARE.fade) / (FLARE.dead - FLARE.fade)));
}

/** Flare screen position (pre-camera) and heading. */
export function flarePos(t) {
  const up = ease((t - FLARE.rise) / (FLARE.hang - FLARE.rise)), drift = clamp((t - FLARE.hang) / (FLARE.dead - FLARE.hang));
  return {x: lerp(1360, 1180, up) - drift * 330, y: lerp(560, 150, up) + drift * 210, rising: t < FLARE.hang};
}

export function createFieldC(art, reducedMotion) {
  const boyGlow = sideLight(art.boy);
  const since = (f, ref) => f.d - f.plan.at(ref).d;
  const z = (f, z0) => z0 - since(f, 75);
  // Streaming frozen mud and snow from the near rows of the L4 ground plate.
  const ground = createRunGround(art.bgCground, {sy: 640, sh: 384, fog: '150,152,156', blur: 2.4});

  /** Wall soldier: crouched on the wall, drops behind it, rises to aim, drops after the shot. */
  function soldier(c, f, wz, light) {
    const s = f.shots[2], hide = ease((f.t - (s.start - .5)) / .35), rise = ease((f.t - s.start) / .7);
    const fall = ease((f.t - s.fire - .1) / .45), aiming = f.t >= s.start;
    const lift = aiming ? lerp(-1.9, 0, rise) - fall * 2 : -hide * 1.4;
    if (fall >= 1) return;
    const img = aiming ? art.wallAim : art.wallCrouch;
    const opts = {z: wz + .4, X: WALL.X - 220, h: aiming ? 1.75 : 1.15, eye: f.eye, lift: 1.05 + lift, flip: !aiming};
    const p = f.project(wz + .4, WALL.X), top = p.y - 1.05 * p.m;
    c.save(); c.beginPath(); c.rect(-4000, -4000, 12000, top + 4000 + .15 * p.m); c.clip();
    flareShadow(c, img, groundSprite(c, img, {...opts, dry: true}), flarePos(f.t).x, light * .5);
    groundSprite(c, img, opts);
    c.restore();
  }

  /** Medic rig: body plus separated head; looks up and nods once after Shot 3. */
  function medic(c, f, mz, light) {
    const s = f.shots[2], up = ease((f.t - s.fire - 2) / .6) * (1 - ease((f.t - s.fire - 5.5) / .8));
    const nod = Math.sin(clamp((f.t - s.fire - 3) / .55) * Math.PI) * .2;
    const breathe = reducedMotion ? 0 : Math.sin(f.wt * 2) * .006;
    // One wounded man lying just beyond the medic, on his left (the side his arms reach to), so the medic kneels over him.
    const pz = mz + .3, pX = MEDIC.X - 600;
    contact(c, f, pz, pX, 2.0);
    const pt = groundSprite(c, art.patient, {z: pz, X: pX, w: 1.9, eye: f.eye, dry: true});
    flareShadow(c, art.patient, pt, flarePos(f.t).x, light);
    groundSprite(c, art.patient, {z: pz, X: pX, w: 1.9, eye: f.eye});
    contact(c, f, mz, MEDIC.X, 1.1);
    const body = groundSprite(c, art.medicBody, {z: mz, X: MEDIC.X, h: 1.2 * (1 + breathe), eye: f.eye, dry: true});
    flareShadow(c, art.medicBody, body, flarePos(f.t).x, light);
    groundSprite(c, art.medicBody, {z: mz, X: MEDIC.X, h: 1.2 * (1 + breathe), eye: f.eye});
    const k = body.h / 1178, hk = k * .42;
    c.save(); c.translate(body.x + (506 - 23) * k, body.y + (150 - 19) * k);
    c.rotate(lerp(.32, -.04, up) + nod);
    c.drawImage(art.medicHead, -691 * hk, -1079 * hk, art.medicHead.width * hk, art.medicHead.height * hk);
    c.restore();
  }

  /** Boy in the foxhole: visible for 18 frames after the long muzzle flash. */
  function foxhole(c, f, fz, coloured) {
    const at = Math.max(f.shots[2].fire + 4.6, 100.4), u = (f.t - at) / (18 / 24);
    if (!coloured) { contact(c, f, fz + .2, FOX.X, 3.2); groundSprite(c, art.foxBowl, {z: fz + .5, X: FOX.X, w: 2.6, eye: f.eye, sink: .25, flat: .7}); }
    if (u > 0 && u < 1) {
      const show = ease(clamp(u / .2)) * (1 - ease(clamp((u - .8) / .2)));
      const opts = {z: fz + .3, X: FOX.X - 40, h: .95, eye: f.eye, sink: lerp(.55, .08, show)};
      if (coloured) { const b = groundSprite(c, art.boy, {...opts, dry: true}); c.drawImage(boyGlow, b.x, b.y, b.w, b.h); }
      else groundSprite(c, art.boy, opts);
    }
    if (!coloured) groundSprite(c, art.foxRim, {z: fz, X: FOX.X, w: 2.8, eye: f.eye, sink: .2});
  }

  /** One scattered body with its contact and flare shadows. */
  function body(c, f, b, bz, fx, light) {
    contact(c, f, bz, b.X, 1.9);
    const box = groundSprite(c, art[b.key], {z: bz, X: b.X, w: b.w, eye: f.eye, flip: b.flip, dry: true});
    flareShadow(c, art[b.key], box, fx, light * .7);
    groundSprite(c, art[b.key], {z: bz, X: b.X, w: b.w, eye: f.eye, flip: b.flip});
  }

  /** Smoke half hiding the foxhole. */
  function fogSmoke(c, f, fz) {
    const sp = f.project(fz + .6, FOX.X), sw = 4.2 * sp.m;
    c.save(); c.globalAlpha = .55;
    c.drawImage(art.smoke2, sp.x - sw * .55 + Math.sin(f.wt * .3) * 30, sp.y - sw * .3, sw, sw * art.smoke2.height / art.smoke2.width);
    c.restore();
  }

  function fireOn(c, f, cz) {
    const p = f.project(cz, CAR.X + 80), flick = reducedMotion ? 0 : Math.sin(f.wt * 8) * .05;
    const w = 2.6 * p.m * (1 + flick), h = w * art.fireM.height / art.fireM.width;
    c.drawImage(art.fireM, p.x - w / 2, p.y - h - .5 * p.m, w, h);
  }

  function drawFlare(c, f) {
    if (f.t < FLARE.rise || f.t > FLARE.dead) return;
    const p = flarePos(f.t), a = 1 - clamp((f.t - FLARE.fade) / (FLARE.dead - FLARE.fade)), w = p.rising ? 420 : 300;
    c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.rising ? -2.2 : .95);
    c.drawImage(art.flare, -w * .8, -w * .62, w, w * art.flare.height / art.flare.width);
    c.restore();
  }

  function render(comp, f) {
    const dC = since(f, 75), light = flareLevel(f.t), fx = flarePos(f.t).x;
    // First layer: the colour pass is still empty, so its erase draw is skipped.
    comp.draw((c, pass) => {
      if (pass === 'colour') return;
      backdrop(c, art.bgCsky, {horizon: .9, zoom: 1});
      backdrop(c, art.bgCfar, {horizon: .5, zoom: 1 + dC * .004});
      ground.draw(c, dC, {horizon: HORIZON, top: HORIZON + 14, eye: f.eye / EYE, feather: 50});
    });
    comp.draw(c => drawFlare(c, f), true);
    const cz = z(f, CAR.z0), wz = z(f, WALL.z0), mz = z(f, MEDIC.z0), fz = z(f, FOX.z0);
    comp.draw(c => {
      contact(c, f, cz, CAR.X, 4.8);
      flareShadow(c, art.vehicle, groundSprite(c, art.vehicle, {z: cz, X: CAR.X, w: 4.2, eye: f.eye, sink: .04, dry: true}), fx, light);
      groundSprite(c, art.vehicle, {z: cz, X: CAR.X, w: 4.2, eye: f.eye, sink: .04});
    });
    comp.draw(c => fireOn(c, f, cz), true);
    comp.draw(c => {
      clods(c, dC, f.eye, {seed: 13});
      // Painter's order far to near so bodies never overlap the wall or the medic group.
      const items = [[wz, () => { soldier(c, f, wz, light); contact(c, f, wz, WALL.X, 6.8); groundSprite(c, art.wall, {z: wz, X: WALL.X, w: 6.5, eye: f.eye}); }],
        [mz, () => medic(c, f, mz, light)], [fz, () => { foxhole(c, f, fz, false); fogSmoke(c, f, fz); }]];
      for (const b of BODIES) {
        const bz = b.z0 - dC;
        if (bz >= .9) items.push([bz, () => body(c, f, b, bz, fx, light)]);
      }
      items.sort((a, b) => b[0] - a[0]).forEach(([, draw]) => draw());
    });
    comp.draw(c => foxhole(c, f, fz, true), true);
    comp.draw(c => embers(c, f.wt, {reducedMotion}), true);
    comp.draw(c => snow(c, f.wt, {density: .7, reducedMotion}));
  }

  /** Shot 3 target: the soldier's head and shoulders against the flare-lit sky. */
  function target(f) {
    const p = f.project(z(f, WALL.z0) + .4, WALL.X - 220);
    return {x: p.x, y: p.y - (1.05 + 1.45) * p.m};
  }

  /** Camera dips 20 px once as Tommy nods back to the medic. */
  function view(f) {
    const u = (f.t - f.shots[2].fire - 3.8) / .6;
    return {eye: 1.6, tilt: u > 0 && u < 1 ? -20 * Math.sin(u * Math.PI) : 0};
  }

  /** Positions for Scene 5 continuity. */
  const layout = f => ({foxhole: {z: z(f, FOX.z0), X: FOX.X}, medic: {z: z(f, MEDIC.z0), X: MEDIC.X}, vehicle: {z: z(f, CAR.z0), X: CAR.X}});
  return {render, target, view, layout};
}

/**
 * S4 Field A (0:00–0:40): BG-03, GIs running and falling, SP-03 at the fence post,
 * the MG burst with tracers and crows, Shot 1 at the barn window, and the pass
 * beneath SP-04 slumped over the sill.
 */
import {clamp, lerp, ease, progress} from '../kit.js';
import {backdrop} from './backdrop.js';
import {groundSprite, runner, scatterBodies, bounds, contact} from './figures.js';
import {snow, crows, perchedCrows, tracers, clods, puff} from './particles.js';
import {BODY_KEYS} from './assets.js';
import {createRunGround} from '../runground.js';
import {HORIZON, EYE} from './camera.js';

const MG_START = 12.3, DROP = 12.6;
// Window opening and MG muzzle inside PR-21 v1, source px.
const WINDOW = {x: 976, y: 300, w: 168, h: 164};
const RIDGE = {x0: 690, y0: 280, x1: 1060, y1: 78};
const GIS = [
  {v: 1, X: -1150, z: 8.5, fall: null},
  {v: 2, X: 1350, z: 11, fall: null},
  {v: 3, X: -260, z: 20, fall: null},
  {v: 2, X: 760, z: 15, fall: 3.2},
  {v: 1, X: -1900, z: 24, fall: 8.6},
];
const BODIES = scatterBodies(BODY_KEYS, 11, 3, {near: 9, far: 125, side: 2400});
const POSTS = Array.from({length: 9}, (_, i) => ({z0: 6 + i * 13, X: (i % 2 ? 1 : -1) * (1700 + (i % 3) * 260), key: `post${1 + i % 3}`}));

export function createFieldA(art, reducedMotion) {
  // Streaming snowy-mud plane from the plate's near rows (blurred and mirrored once).
  const ground = createRunGround(art.bgA, {sy: 640, sh: 384, fog: '168,172,178'});
  /** Distance travelled since scene time ref. */
  const since = (f, ref) => f.d - f.plan.at(ref).d;
  const barnZ = f => 40 - since(f, f.shots[0].start);

  /** Barn screen box and window rect (pre-camera). */
  function barnBox(c, f, draw) {
    const z = Math.max(barnZ(f), .6), b = bounds(art.barn);
    const box = draw ? groundSprite(c, art.barn, {z, X: 700, h: 8.3, eye: f.eye})
      : (() => { const p = f.project(z, 700), k = 8.3 * p.m / b.h; return {x: p.x - b.w * k / 2, y: p.y - b.h * k, w: b.w * k, h: b.h * k}; })();
    const k = box.h / b.h, win = {x: box.x + (WINDOW.x - b.x) * k, y: box.y + (WINDOW.y - b.y) * k, w: WINDOW.w * k, h: WINDOW.h * k};
    return {box, win, k, b};
  }

  const mgFiring = (f, wt) => {
    const w0 = f.plan.at(MG_START).wt, w1 = f.plan.at(f.shots[0].fire).wt;
    return wt >= w0 && wt < w1 && ((wt - w0) % 2.05) < 1.35;
  };

  function gunner(c, f, win) {
    const F = f.shots[0].fire, drop = clamp((f.t - F - .08) / .45);
    if (drop >= 1) return;
    c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
    c.fillStyle = 'rgba(255,170,90,.18)'; c.fillRect(win.x, win.y, win.w, win.h);
    const w = win.w * 1.15, h = w * art.gunner.height / art.gunner.width;
    c.drawImage(art.gunner, win.x + win.w / 2 - w / 2, win.y + win.h - h * .86 + ease(drop) * h * .9, w, h);
    c.restore();
  }

  function slumped(c, f, win) {
    const z = barnZ(f), show = clamp((14 - z) / 1.2) * clamp((z - 4.2) / 1.2);
    if (show <= 0 || f.t < f.shots[0].fire + 1) return;
    const w = win.w * 1.25, h = w * art.gunnerSlumped.height / art.gunnerSlumped.width;
    c.save(); c.globalAlpha *= show;
    c.drawImage(art.gunnerSlumped, win.x + win.w / 2 - w / 2, win.y + win.h - h * .62, w, h);
    c.restore();
  }

  function mgFlash(f) {
    if (!mgFiring(f, f.wt)) return 0;
    if (reducedMotion) return .55;
    return Math.floor(f.wt * 24) % 3 === 0 ? 1 : .25;
  }

  function drawGI(c, f, g, i) {
    const pinnedFrom = DROP + i * .12, rise = f.shots[0].fire + 2.6 + i * .15;
    if (g.fall !== null && f.t >= g.fall) {
      const z = g.z - since(f, g.fall), u = (f.t - g.fall) / .45;
      if (z < .8) return;
      if (u < 1) groundSprite(c, art[`gi${g.v}Fall`], {z, X: g.X, h: 1.75, eye: f.eye, r: ease(u) * .5, sink: ease(u) * .15});
      else groundSprite(c, art[g.v === 1 ? 'deUs1' : 'deUs3'], {z, X: g.X, w: 1.8, eye: f.eye, flip: g.v === 2});
      puff(c, art.smoke2, f.project(z, g.X).x, f.project(z, g.X).y, 2.4 * f.project(z, g.X).m, (u - .55) / .9);
      return;
    }
    const prone = g.fall === null && f.t >= pinnedFrom && f.t < rise;
    const zDrop = g.z - since(f, pinnedFrom), phase = f.plan.at(f.t).wt * 2.9 + i * 1.3;
    if (prone) groundSprite(c, art[`gi${g.v}Prone`], {z: zDrop, X: g.X, w: 1.9, eye: f.eye});
    else if (f.t >= rise) runner(c, art, g.v, {z: Math.min(zDrop + (f.t - rise) * .6, g.z), X: g.X, eye: f.eye, phase});
    else runner(c, art, g.v, {z: g.z + Math.sin(f.wt * .4 + i) * .4, X: g.X, eye: f.eye, phase});
    for (const at of [pinnedFrom, rise]) {
      const p = f.project(f.t >= rise ? zDrop : zDrop, g.X);
      puff(c, art.smoke2, p.x, p.y, 2.2 * p.m, (f.t - at + .25) / .7);
    }
  }

  function render(comp, f) {
    const dA = f.d;
    // First layer: the colour pass is still empty, so its erase draw is skipped.
    comp.draw((c, pass) => {
      if (pass === 'colour') return;
      backdrop(c, art.bgA, {horizon: .405, zoom: 1 + dA * .0022});
      ground.draw(c, dA, {horizon: HORIZON, top: 560, eye: f.eye / EYE, feather: 70});
    });
    comp.draw(c => {
      const {box, win} = barnBox(c, f, true);
      gunner(c, f, win); slumped(c, f, win);
      const k = box.h / bounds(art.barn).h, b = bounds(art.barn);
      const land = (f.t - f.shots[0].fire - 3) / 2.5;
      if (land > 0) perchedCrows(c, art.crows, {x0: box.x + (RIDGE.x0 - b.x) * k, y0: box.y + (RIDGE.y0 - b.y) * k, x1: box.x + (RIDGE.x1 - b.x) * k, y1: box.y + (RIDGE.y1 - b.y) * k, size: 70 * k * 3, u: land});
    });
    comp.draw(c => crows(c, art.crows, f.wt - f.plan.at(MG_START).wt, {reducedMotion}));
    comp.draw(c => {
      clods(c, dA, f.eye, {seed: 2});
      for (const b of BODIES) { const z = b.z0 - dA; if (z > .7 && z < 60) contact(c, f, z, b.X, 1.9); }
      for (const b of BODIES) { const z = b.z0 - dA; if (z > .7 && z < 60) groundSprite(c, art[b.key], {z, X: b.X, w: b.w, eye: f.eye, flip: b.flip}); }
      const zw = 7 - since(f, 5);
      if (zw > .5 && zw < 40) {
        contact(c, f, zw + .3, -1700, .5); contact(c, f, zw, -1250, 1.2);
        groundSprite(c, art.post1, {z: zw + .3, X: -1700, h: 1.5, eye: f.eye});
        groundSprite(c, art.wounded, {z: zw, X: -1250, h: 1.2 * (1 + Math.sin(f.wt * 2.4) * .01), eye: f.eye});
      }
      GIS.map((g, i) => [g, i, g.fall !== null && f.t >= g.fall ? g.z - since(f, g.fall) : g.z])
        .sort((a, b) => b[2] - a[2]).forEach(([g, i, z]) => { contact(c, f, z, g.X, .9); drawGI(c, f, g, i); });
      for (const p of POSTS) { const z = p.z0 - dA; if (z > .5 && z < 40) contact(c, f, z, p.X, .5); }
      for (const p of POSTS) { const z = p.z0 - dA; if (z > .5 && z < 40) groundSprite(c, art[p.key], {z, X: p.X, h: 1.4, eye: f.eye}); }
    });
    const flash = mgFlash(f);
    if (flash > 0 || f.t >= MG_START) comp.draw(c => {
      const {win} = barnBox(c, f, false), mx = win.x + win.w * .5, my = win.y + win.h * .62;
      if (flash > 0) {
        const s = win.w * (1.1 + flash * .9);
        c.save(); c.globalAlpha = flash; c.globalCompositeOperation = 'lighter';
        for (const fl of [1, -1]) { c.save(); c.translate(mx, my); c.scale(fl, 1); c.drawImage(art.mgFlash, -s * .75, -s * .33, s, s * .66); c.restore(); }
        c.restore();
      }
      tracers(c, f.wt, {x: mx, y: my}, wt => mgFiring(f, wt));
    }, true);
    comp.draw(c => snow(c, f.wt, {reducedMotion}));
  }

  /** Shot 1 target: the window. */
  function target(f) {
    const {win} = barnBox(null, f, false);
    return {x: win.x + win.w / 2, y: win.y + win.h * .55};
  }

  /** Eye height (pinned crouch during the MG) and upward tilt under the window. */
  function view(f) {
    const pinned = progress(f.t, 12.5, 13.3) * (1 - progress(f.t, f.shots[0].lower + 1.6, f.shots[0].lower + 2.6));
    const z = f.t > f.shots[0].fire ? barnZ(f) : 99;
    const tilt = clamp((16 - z) / 6) * clamp((z - 2.5) / 2.5) * 260;
    return {eye: lerp(1.6, 1.0, pinned), tilt};
  }
  return {render, target, view};
}

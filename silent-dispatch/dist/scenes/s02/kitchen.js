/**
 * S2 set dressing in panorama (world) space: graded BG-01, roof beam and motes,
 * ash inside and outside, table ash, the burial group (SP-13 + PR-24) and smoke.
 * All motion is a pure function of scene time.
 */
import {surface, hash, clamp, lerp} from '../kit.js';
import {PANO_W, PANO_H, PANO_SCALE} from './camera.js';

/**
 * Pre-grade BG-01 once: warm lamplight inside, blue-grey outside. The exterior
 * mask follows the broken brick edge so the boundary stays sharp.
 */
export function buildGradedPanorama(pano, mask) {
  const w = pano.width, h = pano.height;
  const warm = surface(w, h), cold = surface(w, h);
  const wc = warm.getContext('2d'), cc = cold.getContext('2d');
  wc.filter = 'saturate(1.04) brightness(.96)'; wc.drawImage(pano, 0, 0); wc.filter = 'none';
  wc.globalCompositeOperation = 'soft-light'; wc.fillStyle = 'rgba(255,168,92,.5)'; wc.fillRect(0, 0, w, h);
  cc.filter = 'saturate(.28) brightness(.9) contrast(.96)'; cc.drawImage(pano, 0, 0); cc.filter = 'none';
  cc.fillStyle = 'rgba(112,130,152,.32)'; cc.fillRect(0, 0, w, h);
  cc.globalCompositeOperation = 'destination-in'; cc.drawImage(mask, 0, 0, w, h);
  wc.globalCompositeOperation = 'source-over'; wc.drawImage(cold, 0, 0);
  cold.width = 0;
  return warm;
}

/** Pre-grade one sprite into a cold canvas (exterior colour script). */
export function coldSprite(image, scale = 1) {
  const canvas = surface(Math.round(image.width * scale), Math.round(image.height * scale));
  const c = canvas.getContext('2d');
  c.filter = 'saturate(.35) brightness(.82) contrast(.95)';
  c.drawImage(image, 0, 0, canvas.width, canvas.height); c.filter = 'none';
  c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(108,126,148,.3)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Light shaft through the missing roof (the Scene 1 "window") with turning motes. */
export function drawBeam(c, t, reducedMotion) {
  c.save();
  const beam = c.createLinearGradient(1100, 0, 2100, 1300);
  beam.addColorStop(0, 'rgba(255,226,165,.2)'); beam.addColorStop(.65, 'rgba(255,226,165,.06)');
  beam.addColorStop(1, 'rgba(255,226,165,0)');
  c.fillStyle = beam; c.beginPath();
  c.moveTo(990, 0); c.lineTo(1700, 0); c.lineTo(2560, 1300); c.lineTo(1480, 1300); c.closePath(); c.fill();
  for (let i = 0; i < 70; i++) {
    const phase = reducedMotion ? 0 : t;
    const v = (i * 89 + phase * (8 + i % 5 * 3)) % 1300;
    const x = lerp(1000 + hash(i) * 690, 1500 + hash(i) * 1050, v / 1300) + Math.sin(phase * .4 + i) * 12;
    c.fillStyle = `rgba(252,236,190,${.12 + (i % 5) * .03})`;
    c.beginPath(); c.arc(x, v, 1.4 + i % 3, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

/**
 * Falling ash in a world rectangle: small angular flakes, deterministic per index.
 * colour is an "r,g,b" string; speed scales the fall (slower under reduced motion).
 */
export function drawAsh(c, t, {x, y, w, h, count, colour, seed = 0, speed = 1, size = 1}) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let i = 0; i < count; i++) {
    const k = i + seed * 1000;
    const fall = (28 + hash(k + 2) * 38) * speed;
    const fy = y + ((hash(k + 1) * h + t * fall) % h);
    const fx = x + hash(k) * w + Math.sin(t * .7 * speed + k) * 18;
    const r = (3 + hash(k + 3) * 4) * size, a = t * (.6 + hash(k + 4)) * speed + k;
    c.fillStyle = `rgba(${colour},${.45 + hash(k + 5) * .4})`;
    c.beginPath();
    c.moveTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r);
    c.lineTo(fx + Math.cos(a + 2.3) * r * .7, fy + Math.sin(a + 2.3) * r * .7);
    c.lineTo(fx + Math.cos(a + 4.1) * r * .9, fy + Math.sin(a + 4.1) * r * .9);
    c.closePath(); c.fill();
  }
  c.restore();
}

// Tablecloth top surface (BG-01 source px x panorama scale): TL, TR, BL, BR.
const CLOTH = [[842, 418], [1238, 413], [836, 478], [1195, 483]].map(([px, py]) => [px * PANO_SCALE, py * PANO_SCALE]);

/** Ash settling on the set table: grey specks accumulate across the scene. */
export function drawTableAsh(c, t) {
  const n = Math.floor(60 + 160 * clamp(t / 40));
  c.save();
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3 + 11), v = hash(i * 7 + 5);
    const top = [lerp(CLOTH[0][0], CLOTH[1][0], u), lerp(CLOTH[0][1], CLOTH[1][1], u)];
    const bottom = [lerp(CLOTH[2][0], CLOTH[3][0], u), lerp(CLOTH[2][1], CLOTH[3][1], u)];
    const px = lerp(top[0], bottom[0], v), py = lerp(top[1], bottom[1], v);
    c.fillStyle = `rgba(92,88,82,${.35 + hash(i) * .35})`;
    c.fillRect(px, py, 2 + hash(i + 1) * 4, 1.5 + hash(i + 2) * 2);
  }
  c.restore();
}

/**
 * Build the static burial plate (three PR-24 markers) and the SP-13 rig, all cold-graded.
 * Returns {plate, body, head} canvases sized in the plate's local units.
 */
export function buildBurial(art) {
  const plate = surface(1400, 800), p = plate.getContext('2d');
  [[560, art.marker1], [840, art.marker2], [1120, art.marker3]].forEach(([x, image]) => {
    p.drawImage(coldSprite(image, .42), x - 215, 760 - 1519 * .42);
  });
  return {plate, body: coldSprite(art.gi, .45), head: coldSprite(art.giHead, .45 * .42)};
}

// Burial site: plate ground line sits on the field 40 m beyond the wall gap.
const BURIAL = {x: 2915, y: 856, scale: .25};

/** SP-13 kneels beside the first marker, head lowered; only a slow body sway moves. */
export function drawBurial(c, t, burial, reducedMotion) {
  const sway = reducedMotion ? 0 : Math.sin(t * Math.PI * 2 / 5.5) * .014;
  c.save(); c.translate(BURIAL.x, BURIAL.y); c.scale(BURIAL.scale, BURIAL.scale);
  c.translate(0, -760);
  // Soft cold contact shadow keeps the group on the ground plane.
  c.fillStyle = 'rgba(40,46,54,.35)'; c.beginPath(); c.ellipse(640, 760, 620, 26, 0, 0, Math.PI * 2); c.fill();
  c.drawImage(burial.plate, 0, 0);
  const bodyX = 40, bodyY = 760 - 1536 * .45;
  c.save(); c.translate(bodyX + 230, 760); c.rotate(sway); c.translate(-bodyX - 230, -760);
  c.drawImage(burial.body, bodyX, bodyY);
  // Head pivot sits on the neck base; lowered about 30 degrees toward the marker.
  c.translate(bodyX + 627 * .45, bodyY + 200 * .45);
  c.rotate(.52 + sway * 1.5);
  const hs = .45 * .42;
  c.drawImage(burial.head, -628 * hs, -1000 * hs);
  c.restore(); c.restore();
}

/** Distant smoke columns beyond the gap: FX-07 drifts and breathes slowly. */
export function drawSmoke(c, t, smoke, reducedMotion) {
  const m = reducedMotion ? .3 : 1;
  [[3700, 660, 300, 0], [2760, 650, 190, 2]].forEach(([x, y, w, s]) => {
    const breathe = 1 + Math.sin(t * .35 * m + s) * .04;
    c.save(); c.globalAlpha = .42; c.translate(x + Math.sin(t * .2 * m + s) * 14, y);
    c.scale(breathe, breathe);
    c.drawImage(smoke, -w / 2, -w * 1.5, w, w * 1.5);
    c.restore();
  });
}

/** Draw the graded panorama into world space. */
export function drawPanorama(c, graded) {
  c.drawImage(graded, 0, 0, PANO_W, PANO_H);
}

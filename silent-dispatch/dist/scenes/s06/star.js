/**
 * FX-27 crayon star draw and FX-22 colour drain for Scene 6, plus the TX-05 handwriting layer.
 * Pure drawing helpers: every function is deterministic in its time argument.
 * Usage: const star = prepareStar(starImage); const hand = prepareHandwriting(letterImage);
 *        drawStarBeat(ctx, t, {star, hand, reducedMotion});
 */
import {W, clamp, progress, lerp, hash, surface} from '../kit.js';

// Source-pixel geometry of FX-27_crayon-star_v1.png (1317 x 1194): outer tips and inner corners.
const TIPS = [[668, 95], [1236, 497], [1066, 1080], [338, 1078], [70, 505]];
const INNER = [[808, 470], [884, 738], [690, 878], [470, 730], [522, 468]];
const CENTRE = [680, 660];
// TX-05 crop on annies-letter-v1.png: "Please be careful." in Annie's pencil hand.
const HAND_CROP = {sx: 196, sy: 826, sw: 820, sh: 150};

// Beat timing, local seconds (script 0:36–0:42).
export const STAR = {start: 36, stroke: .4, writeA: 37.2, writeB: 39.0, drainA: 40.2, drainB: 41.5, fadeA: 41.3, fadeB: 42};
const STAR_X = 960, STAR_Y = 430, STAR_WIDTH = 420, HAND_Y = 690, HAND_WIDTH = 660;

/**
 * Clean the star art once: drop stray red specks from the source matte and build a grey twin.
 * Returns {colour, grey, mask, work} canvases at source size.
 */
export function prepareStar(image) {
  const colour = surface(image.width, image.height), c = colour.getContext('2d', {willReadFrequently: true});
  c.drawImage(image, 0, 0);
  const pixels = c.getImageData(0, 0, colour.width, colour.height), d = pixels.data;
  for (let i = 0; i < d.length; i += 4) if (d[i] > d[i + 1] * 1.6) d[i + 3] = 0;
  c.putImageData(pixels, 0, 0);
  // Paper tooth: a fixed speckle of wax gaps, never re-rolled between frames.
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 2600; i++) {
    c.fillStyle = `rgba(0,0,0,${.25 + hash(i * 3.1) * .5})`;
    c.fillRect(hash(i) * colour.width, hash(i + .5) * colour.height, 2 + hash(i * 7) * 4, 1 + hash(i * 11) * 2);
  }
  const grey = surface(image.width, image.height), g = grey.getContext('2d');
  g.filter = 'grayscale(1) brightness(.85)'; g.drawImage(colour, 0, 0); g.filter = 'none';
  return {colour, grey, mask: surface(image.width, image.height), work: surface(image.width, image.height)};
}

/**
 * Lift Annie's pencil strokes off the cream paper into a light-on-black alpha layer.
 * Darkness relative to the paper becomes alpha, so the exact source handwriting is reused.
 */
export function prepareHandwriting(letter) {
  const {sx, sy, sw, sh} = HAND_CROP;
  const ink = surface(sw, sh), c = ink.getContext('2d', {willReadFrequently: true});
  c.drawImage(letter, sx, sy, sw, sh, 0, 0, sw, sh);
  const pixels = c.getImageData(0, 0, sw, sh), d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
    d[i + 3] = Math.round(clamp((196 - lum) / 80) * 255);
    d[i] = 214; d[i + 1] = 208; d[i + 2] = 196;
  }
  c.putImageData(pixels, 0, 0);
  return {ink, work: surface(sw, sh)};
}

/** Trace the stroke path into the reveal mask up to distance n (0..5 strokes, fractional). */
function traceStrokes(m, n) {
  m.lineCap = m.lineJoin = 'round'; m.lineWidth = 150; m.strokeStyle = '#fff';
  for (let s = 0; s < 5 && n > 0; s++) {
    const a = TIPS[s], b = INNER[s], e = TIPS[(s + 1) % 5], k = clamp(n - s);
    m.beginPath(); m.moveTo(a[0], a[1]);
    if (k <= .5) m.lineTo(lerp(a[0], b[0], k * 2), lerp(a[1], b[1], k * 2));
    else { m.lineTo(b[0], b[1]); m.lineTo(lerp(b[0], e[0], k * 2 - 1), lerp(b[1], e[1], k * 2 - 1)); }
    m.stroke();
  }
}

/** Irregular fluid boundary around the star centre; ripple seed drifts with the drain. */
function fluidBlob(m, radius, seed) {
  m.beginPath();
  for (let i = 0; i <= 90; i++) {
    const angle = i / 90 * Math.PI * 2;
    const ripple = 1 + .16 * Math.sin(angle * 5 + seed) + .07 * Math.sin(angle * 11 - seed * 1.7);
    const x = CENTRE[0] + Math.cos(angle) * radius * ripple, y = CENTRE[1] + Math.sin(angle) * radius * ripple;
    if (i) m.lineTo(x, y); else m.moveTo(x, y);
  }
  m.closePath(); m.fill();
}

/** Composite source canvas through the mask on the work canvas; returns the work canvas. */
function masked(star, source) {
  const w = star.work.getContext('2d');
  w.globalCompositeOperation = 'source-over'; w.clearRect(0, 0, star.work.width, star.work.height);
  w.drawImage(star.mask, 0, 0);
  w.globalCompositeOperation = 'source-in'; w.drawImage(source, 0, 0);
  w.globalCompositeOperation = 'source-over';
  return star.work;
}

/** Yellow beads that run from each tip toward the centre during the drain (FX-22). */
function drainBeads(ctx, p, scale) {
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.translate(STAR_X - CENTRE[0] * scale, STAR_Y - CENTRE[1] * scale); ctx.scale(scale, scale);
  for (let i = 0; i < 10; i++) {
    const from = i % 2 ? INNER[i >> 1] : TIPS[i >> 1], lag = hash(i + 4) * .25;
    const k = clamp((p - lag) / (1 - lag));
    const x = lerp(from[0], CENTRE[0], k * k), y = lerp(from[1], CENTRE[1], k * k);
    ctx.fillStyle = `rgba(226,176,48,${.9 * Math.sin(Math.PI * k)})`;
    ctx.beginPath(); ctx.ellipse(x, y, 46 * (1 - k * .5), 30 * (1 - k * .5), Math.atan2(CENTRE[1] - from[1], CENTRE[0] - from[0]), 0, Math.PI * 2); ctx.fill();
  }
  // The collected colour pools at the centre, then soaks away.
  ctx.fillStyle = `rgba(222,170,40,${.6 * Math.sin(Math.PI * p) * p})`;
  ctx.beginPath(); ctx.arc(CENTRE[0], CENTRE[1], 70 * p, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Draw the star layer (drawn strokes, colour drain, grey remnant) for local time t. */
function drawStar(ctx, t, star, reducedMotion) {
  const m = star.mask.getContext('2d'), scale = STAR_WIDTH / star.colour.width;
  const h = star.colour.height * scale, x = STAR_X - STAR_WIDTH / 2, y = STAR_Y - h * CENTRE[1] / star.colour.height;
  const drawn = (t - STAR.start) / STAR.stroke, drain = clamp((t - STAR.drainA) / (STAR.drainB - STAR.drainA));
  const fade = 1 - progress(t, STAR.fadeA, STAR.fadeB);
  m.clearRect(0, 0, star.mask.width, star.mask.height);
  if (reducedMotion) m.fillRect(0, 0, star.mask.width, star.mask.height); else traceStrokes(m, drawn);
  const base = reducedMotion ? progress(t, STAR.start, STAR.start + 2) : 1;
  ctx.save();
  if (drain > 0) {
    ctx.globalAlpha = base * .3 * fade; ctx.drawImage(masked(star, star.grey), x, y, STAR_WIDTH, h);
  }
  ctx.globalAlpha = base;
  if (drain < 1) {
    m.globalCompositeOperation = 'destination-in'; m.fillStyle = '#fff';
    if (drain > 0) {
      if (reducedMotion) { m.globalAlpha = 1 - drain; m.fillRect(0, 0, star.mask.width, star.mask.height); m.globalAlpha = 1; }
      else fluidBlob(m, lerp(700, 0, drain), drain * 4);
    }
    m.globalCompositeOperation = 'source-over';
    ctx.drawImage(masked(star, star.colour), x, y, STAR_WIDTH, h);
  }
  ctx.restore();
  if (!reducedMotion) drainBeads(ctx, drain, scale);
}

/** Draw TX-05: a soft write-on edge travels left to right, then fades with the grey star. */
function drawHandwriting(ctx, t, hand, reducedMotion) {
  const w = hand.work.getContext('2d'), {width: sw, height: sh} = hand.ink;
  const reveal = reducedMotion ? 1 : clamp((t - STAR.writeA) / (STAR.writeB - STAR.writeA));
  const alpha = (reducedMotion ? progress(t, STAR.writeA, STAR.writeB) : 1) * (1 - progress(t, STAR.fadeA, STAR.fadeB));
  if (reveal <= 0 || alpha <= 0) return;
  w.clearRect(0, 0, sw, sh); w.drawImage(hand.ink, 0, 0);
  const edge = reveal * (sw + 60), ramp = w.createLinearGradient(edge - 60, 0, edge, 0);
  ramp.addColorStop(0, '#fff'); ramp.addColorStop(1, 'rgba(255,255,255,0)');
  w.globalCompositeOperation = 'destination-in'; w.fillStyle = ramp; w.fillRect(0, 0, sw, sh);
  w.globalCompositeOperation = 'source-over';
  const h = HAND_WIDTH * sh / sw;
  ctx.save(); ctx.globalAlpha = alpha * .9;
  ctx.drawImage(hand.work, (W - HAND_WIDTH) / 2, HAND_Y - h / 2, HAND_WIDTH, h);
  ctx.restore();
}

/** FX-27 beat entry point: draws nothing outside 0:36–0:42. */
export function drawStarBeat(ctx, t, {star, hand, reducedMotion = false}) {
  if (t < STAR.start || t >= STAR.fadeB) return;
  drawStar(ctx, t, star, reducedMotion);
  drawHandwriting(ctx, t, hand, reducedMotion);
}

/**
 * S4 L8 screen FX and L9 text: in-scene T-SMOKE wipes, the hit flash, flare light,
 * vignette and TX-07 subtitles. Drawn on the output context after grading.
 */
import {W, H, clamp, lerp, ease, vignette} from '../kit.js';

/**
 * T-SMOKE centred on time at: FX-08 crosses left to right over 1 s, opaque for
 * the middle 6 frames. Returns true while the frame is fully covered.
 */
export function smokeWipe(ctx, img, t, at, reducedMotion) {
  const u = (t - (at - .5)) / 1;
  if (u <= 0 || u >= 1) return false;
  const cover = 6 / 24 / 2, mid = Math.abs(u - .5) < cover;
  ctx.save();
  if (reducedMotion) {
    ctx.globalAlpha = clamp(1 - Math.abs(u - .5) * 2.4);
    ctx.fillStyle = '#9fa19c'; ctx.fillRect(0, 0, W, H);
    ctx.restore(); return mid;
  }
  // Leading edge enters from the left; trailing edge leaves to the right.
  const entering = u < .5, edge = entering ? ease(u / (.5 - cover)) : ease((u - .5 - cover) / (.5 - cover));
  const x = lerp(-.25, 1.25, clamp(edge)) * W;
  ctx.fillStyle = '#9fa19c';
  if (mid) ctx.fillRect(0, 0, W, H);
  else if (entering) ctx.fillRect(0, 0, x, H);
  else ctx.fillRect(x, 0, W - x, H);
  const bw = W * .75, bh = bw * img.height / img.width;
  for (let i = 0; i < 4; i++) {
    const y = -bh * .25 + i * H * .3, wob = Math.sin(i * 2.1 + u * 5) * 60;
    ctx.drawImage(img, x - bw / 2 + wob, y, bw, bh);
  }
  ctx.restore();
  return mid;
}

/** Hit flash: L8 red at 20% for one frame (a slower soft pulse in reduced motion). */
export function hitFlash(ctx, t, hit, reducedMotion) {
  const span = reducedMotion ? .5 : 1 / 24;
  if (t < hit || t > hit + span) return;
  ctx.save();
  ctx.globalAlpha = reducedMotion ? .12 * Math.sin((t - hit) / span * Math.PI) : .2;
  ctx.fillStyle = '#c0141a'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Flare light: the grey world turns orange. k 0..1 intensity, (fx, fy) the flare.
 * Multiply carries the orange into shadows, screen lifts the light pool.
 */
export function flareLight(ctx, k, fx, fy) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .55 * k;
  ctx.fillStyle = '#ffae5a'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .55 * k;
  const g = ctx.createRadialGradient(fx, fy, 10, fx, fy, W * .8);
  g.addColorStop(0, 'rgba(255,190,100,.9)'); g.addColorStop(.4, 'rgba(255,120,40,.35)'); g.addColorStop(1, 'rgba(120,40,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Cold lens vignette for the field. */
export function fieldVignette(ctx, strength = .5) {
  vignette(ctx, strength, '12,13,14');
}

/** TX-07 subtitle line, centred low; a, opacity 0..1; italic for off-screen voices. */
export function subtitle(ctx, text, a, {italic = false} = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `${italic ? 'italic ' : ''}44px "IM Fell English", Georgia, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineJoin = 'round';
  ctx.strokeText(text, W / 2, H - 70);
  ctx.fillStyle = '#f2efe6'; ctx.fillText(text, W / 2, H - 70);
  ctx.restore();
}

/** Opacity of a subtitle shown over [a, b] with 0.3 s fades. */
export const cue = (t, a, b) => clamp(Math.min((t - a) / .3, (b - t) / .3));

/**
 * S5 0:15–0:30 — SP-07 close face over the lens, the letter he now holds (grip outside
 * the crop), the star kept in colour while everything else drains, FX-15 iris, black.
 */
import {W, H, clamp, lerp, progress} from '../kit.js';

const MEDIC = {x: 760, y: 560, w: 1500, r: -.42};
const LETTER = {x: 1270, y: 830, w: 600, r: .1};
const STAR = {fx: .725, fy: .255};

/** Medic pose: slides in over the lens, settles, then a slight head tilt toward the letter. */
function medicPose(t, reducedMotion) {
  const enter = progress(t, 15, 16.3), tilt = progress(t, 16.9, 17.8);
  const drift = reducedMotion ? 0 : 1;
  return {
    x: MEDIC.x - (1 - enter) * 620 * drift, y: MEDIC.y - (1 - enter) * 420 * drift,
    a: reducedMotion ? enter : 1, r: MEDIC.r - (1 - enter) * .08 + tilt * .07,
  };
}

/** Held letter pose: rises from below the frame edge so his grip is never in shot. */
export function letterPose(t) {
  const rise = progress(t, 17.9, 19);
  return {x: LETTER.x, y: lerp(H + 520, LETTER.y, rise), w: LETTER.w, r: LETTER.r, visible: t >= 17.9};
}

/** Screen position of the star centre on the held letter. */
export function starCentre(art, pose) {
  const h = pose.w * art.letterRun.height / art.letterRun.width;
  const lx = (STAR.fx - .5) * pose.w, ly = (STAR.fy - .5) * h;
  const cos = Math.cos(pose.r), sin = Math.sin(pose.r);
  return {x: pose.x + lx * cos - ly * sin, y: pose.y + lx * sin + ly * cos};
}

/** Draw an image centred on a pose (x, y, w, r). */
function placed(c, img, pose) {
  const h = pose.w * img.height / img.width;
  c.save(); c.translate(pose.x, pose.y); c.rotate(pose.r);
  c.drawImage(img, -pose.w / 2, -h / 2, pose.w, h); c.restore();
}

/** True once the medic's body covers the ground letter, which then leaves through the cover. */
export const groundLetterGone = t => t >= 16.1;

/** Draw medic and, after the concealed pickup, the crayon-run letter below his face. */
export function drawMedic(c, art, t, reducedMotion) {
  if (t < 15) return;
  const m = medicPose(t, reducedMotion);
  c.save(); c.globalAlpha = m.a;
  c.shadowColor = 'rgba(10,10,8,.4)'; c.shadowBlur = 40;
  placed(c, art.medic, {x: m.x, y: m.y, w: MEDIC.w, r: m.r});
  c.restore();
  const pose = letterPose(t);
  if (pose.visible) {
    c.save(); c.shadowColor = 'rgba(10,10,8,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
    placed(c, art.letterRun, pose); c.restore();
  }
}

/** Re-draw the wax star in full colour above the drained frame (0:20 onward). */
export function drawStar(ctx, art, prep, t) {
  const pose = letterPose(t);
  ctx.save(); ctx.globalAlpha = progress(t, 19.5, 20.5);
  placed(ctx, prep.star, pose); ctx.restore();
}

/**
 * FX-15 iris: closes from the edges to the star (0:20–0:23), holds the star for two
 * full seconds, then shuts; black to 0:30.
 */
export function drawIris(ctx, art, t) {
  if (t < 20) return;
  const centre = starCentre(art, letterPose(t));
  const far = Math.hypot(W, H);
  const radius = t < 23 ? lerp(far, 140, progress(t, 20, 23)) : lerp(140, 0, clamp((t - 25) / .4));
  ctx.save(); ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  if (radius > .5) ctx.arc(centre.x, centre.y, radius, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  // Soft lens edge on the iris rim.
  if (radius > .5 && radius < far) {
    const g = ctx.createRadialGradient(centre.x, centre.y, radius * .7, centre.x, centre.y, radius);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(centre.x, centre.y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

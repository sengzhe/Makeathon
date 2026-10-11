/**
 * S4 L7 foreground: HD-K1 low carry, HD-11 raise, HD-K2 sight hold, HD-13 fire
 * (FX-01, recoil, PR-12 casing), HD-14 lower, and the HD-K6 sleeve with the
 * FX-23 ink bloom. No hands are drawn; gripping stays outside the crop.
 */
import {W, H, clamp, lerp, ease, surface} from '../kit.js';
import {SIGHT_X, SIGHT_Y} from './camera.js';

// HD-K1 pivot: the stock's lower-right corner, placed beyond the frame corner.
const CARRY = {width: 1450, px: W + 170, py: H + 470, rot: -3};

/** Low carry rifle. lift 0..1 raises it toward the eye line (HD-11/HD-14). */
export function drawCarry(c, img, {x = 0, y = 0, roll = 0, lift = 0}) {
  const k = CARRY.width / img.width, h = img.height * k;
  c.save();
  c.translate(CARRY.px + x - lift * 420, CARRY.py + y - lift * 520);
  c.rotate((CARRY.rot - lift * 9) * Math.PI / 180 + roll);
  c.scale(1 + lift * .5, 1 + lift * .5);
  c.drawImage(img, -CARRY.width, -h, CARRY.width, h);
  c.restore();
}

/** HD-K2 sight picture with the front-post tip at (SIGHT_X, SIGHT_Y) + offset. */
export function drawSight(c, img, {x = 0, y = 0, roll = 0}) {
  const k = W / img.width;
  c.save();
  c.translate(SIGHT_X + x, SIGHT_Y + y); c.rotate(roll);
  c.drawImage(img, -770 * k, -374 * k, W, img.height * k);
  c.restore();
  // Peripheral darkening outside the rear ring keeps the eye on the post.
  const g = c.createRadialGradient(SIGHT_X + x, SIGHT_Y + y - 40, 260, SIGHT_X + x, SIGHT_Y + y, 1150);
  g.addColorStop(0, 'rgba(10,10,9,0)'); g.addColorStop(1, 'rgba(10,10,9,.5)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

/**
 * HD-13 muzzle flash at the front post: mirrored FX-01 pair plus a T-MUZZLE glow
 * filling about 60% of the frame. k = 0..1 intensity.
 */
export function drawMuzzle(c, img, k, {x = 0, y = 0} = {}) {
  if (k <= 0) return;
  const cx = SIGHT_X + x, cy = SIGHT_Y + y - 20, w = 980 * (.8 + .2 * k), h = w * img.height / img.width;
  c.save(); c.globalAlpha *= k; c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(cx, cy, 20, cx, cy, W * .45);
  g.addColorStop(0, 'rgba(255,240,190,.95)'); g.addColorStop(.35, 'rgba(255,170,60,.55)'); g.addColorStop(1, 'rgba(255,120,30,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.translate(cx, cy);
  for (const flip of [1, -1]) {
    c.save(); c.scale(flip, 1); c.drawImage(img, -w * .62, -h / 2, w, h); c.restore();
  }
  c.restore();
}

/** PR-12 casing ejected right of the receiver over 10 playback frames, u 0..1. */
export function drawCasing(c, img, u) {
  if (u <= 0 || u >= 1) return;
  const x = 1220 + 620 * u, y = 700 - 420 * u + 980 * u * u, size = 150 - 40 * u;
  c.save(); c.translate(x, y); c.rotate(u * 11);
  c.drawImage(img, 0, 53, 1400, 920, -size / 2, -size * .33, size, size * .66);
  c.restore();
}

/** Recoil curve: 40 px kick and 2 degree roll returning over 6 frames. */
export function recoil(t, fire, reducedMotion) {
  const u = (t - fire) / (6 / 24);
  if (u < 0 || u > 1) return {y: 0, roll: 0};
  const k = (1 - u) * (1 - u) * (reducedMotion ? .3 : 1);
  return {y: -40 * k, roll: -2 * Math.PI / 180 * k};
}

/**
 * Sleeve strip HD-K6 with the FX-23 bloom. Builds two layers per call: the grey
 * sleeve and the blood clipped to the sleeve's alpha. bloom 0..1 (0 = clean).
 */
export function createSleeve(art) {
  const sw = 900, sh = Math.round(sw * art.sleeve.height / art.sleeve.width);
  const blood = surface(sw, sh), bc = blood.getContext('2d');
  let lastBloom = -1;
  function stain(bloom) {
    if (Math.abs(bloom - lastBloom) < .002) return blood;
    lastBloom = bloom; bc.clearRect(0, 0, sw, sh);
    if (bloom <= 0) return blood;
    bc.globalCompositeOperation = 'source-over';
    const cx = sw * .52, cy = sh * .5, stage = (img, size, a) => {
      if (a <= 0) return;
      bc.globalAlpha = a; const w = sw * size, h = w * img.height / img.width;
      bc.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    };
    stage(art.blood1, lerp(.5, 1.3, ease(bloom / .3)), 1 - clamp((bloom - .3) / .3));
    stage(art.blood2, lerp(.55, 1.05, ease((bloom - .2) / .5)), clamp((bloom - .2) / .3) * (1 - clamp((bloom - .7) / .3) * .6));
    stage(art.blood3, lerp(.8, 1.1, ease((bloom - .55) / .45)), clamp((bloom - .55) / .35));
    // Clip the bloom to the sleeve's alpha so ink stays inside the fabric.
    bc.globalAlpha = 1; bc.globalCompositeOperation = 'destination-in';
    bc.drawImage(art.sleeve, 0, 0, sw, sh);
    bc.globalCompositeOperation = 'source-over';
    return blood;
  }
  /**
   * Draw the sleeve across the lower-left corner, cuff exiting the bottom edge.
   * reveal 0..1 slides it into frame. part 'sleeve' (graded) or 'blood' (coloured).
   */
  function draw(c, part, {reveal, bloom, x = 0, y = 0}) {
    if (reveal <= 0) return;
    c.save();
    c.translate(-60 + x, H + 40 + (1 - reveal) * 520 + y); c.rotate(.98);
    c.translate(-sw * .12, -sh * .78);
    if (part === 'sleeve') c.drawImage(art.sleeve, 0, 0, sw, sh);
    else if (bloom > 0) c.drawImage(stain(bloom), 0, 0);
    c.restore();
  }
  return {draw, dispose() { blood.width = 0; }};
}

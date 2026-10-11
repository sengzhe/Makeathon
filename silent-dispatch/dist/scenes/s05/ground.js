/**
 * S5 0:02.5–0:15 — BG-06 at mud level, frame rotated 70°: snow toward the lens,
 * the frozen grass blade, the boy at the foxhole, and the letter half out of the pocket
 * with the FX-26 crayon run. Colour grading is applied by the caller.
 */
import {W, H, clamp, lerp, progress, hash} from '../kit.js';

export const THETA = -70 * Math.PI / 180;
// Upright local frame that covers the rotated screen (W·|cos| + H·|sin| by W·|sin| + H·|cos|).
const LW = W * Math.abs(Math.cos(THETA)) + H * Math.abs(Math.sin(THETA));
const LH = W * Math.abs(Math.sin(THETA)) + H * Math.abs(Math.cos(THETA));
const HORIZON = -LH * .13;
// Letter pose on screen: flap top-centre, rotation, and display width.
const POCKET = {x: 1390, y: 935, r: -.3, flapScale: 1.55, letterW: 700};
// Crayon streams in letter fractions: [FX-26 column, x, start y, landing time].
const STREAMS = [[0, .25, .41, 7.2], [2, .46, .47, 7.9], [1, .35, .42, 8.6], [3, .52, .52, 9.3]];
const COLUMNS = [[148, 39, 69, 1140], [373, 216, 92, 1038], [646, 53, 77, 1111], [842, 161, 84, 1080]];

/** Apply the 70° ground-level camera around the frame centre. */
function worldFrame(c) {
  c.translate(W / 2, H / 2); c.rotate(THETA);
}

/** BG-06 plate with the sky extended above its top edge so the rotation never shows a border. */
function plate(c, art) {
  const p = art.plate, k = (LH / 2 - HORIZON) * 1.04 / (p.height * .58);
  const pw = p.width * k, ph = p.height * k, top = HORIZON - p.height * .42 * k;
  const sky = c.createLinearGradient(0, -LH / 2, 0, top + 200);
  sky.addColorStop(0, '#9fb0c2'); sky.addColorStop(1, '#b9c4cf');
  c.fillStyle = sky; c.fillRect(-LW / 2 - 20, -LH / 2 - 20, LW + 40, top + LH / 2 + 220);
  c.drawImage(p, -pw / 2, top, pw, ph);
  const seam = c.createLinearGradient(0, top, 0, top + 160);
  seam.addColorStop(0, '#a9b8c7'); seam.addColorStop(1, 'rgba(185,196,207,0)');
  c.fillStyle = seam; c.fillRect(-pw / 2, top, pw, 160);
}

/**
 * SP-09 boy behind the PR-22 rim: rises into view, holds a frightened face with a small
 * shoulder tremor, then lowers into cover. Clipped above the rim base so he never shows below it.
 */
function boy(c, art, t, reducedMotion) {
  if (t < 9.4 || t > 14.2) return;
  const x = 120, base = HORIZON + 230, scale = .42, sink = 70;
  const up = progress(t, 9.4, 10.4) * (1 - progress(t, 13.1, 14.1));
  const tremor = reducedMotion ? 0 : Math.sin(t * 31) * 1.6 + Math.sin(t * 17) * 1.1;
  const bw = art.boyBody.width * scale, bh = art.boyBody.height * scale;
  const rimW = 880, rimH = rimW * art.rim.height / art.rim.width;
  c.save();
  c.beginPath(); c.rect(x - rimW, base - 600, rimW * 2, 600 + rimH * .2); c.clip();
  c.translate(x, base + (1 - up) * 300);
  c.save(); c.translate(tremor, 0);
  c.drawImage(art.boyBody, -bw * .5, -bh * .62 + sink, bw, bh);
  c.restore();
  const hw = art.boyHead.width * scale * .6, hh = hw * art.boyHead.height / art.boyHead.width;
  c.save(); c.translate(tremor * .4, -bh * .34 + sink); c.rotate(reducedMotion ? 0 : Math.sin(t * 23) * .008);
  c.drawImage(art.boyHead, -hw * .51, -hh * .94, hw, hh);
  c.restore(); c.restore();
  c.drawImage(art.rim, x - rimW / 2, base - rimH * .45, rimW, rimH);
}

/** Frozen grass blade at the lens (BG-06 L5), with a slow wind lean. */
function blade(c, prep, t, reducedMotion) {
  const b = prep.blade, h = 1900, w = h * b.width / b.height;
  c.save(); c.translate(-420, LH / 2 + 60); c.rotate(-.2 + (reducedMotion ? 0 : Math.sin(t * .9) * .025));
  c.drawImage(b, -w * .2, -h * .98, w, h);
  c.restore();
}

/** Draw the rotated world: plate, boy and blade. */
export function drawGroundWorld(c, art, prep, t, reducedMotion) {
  c.save(); worldFrame(c);
  plate(c, art);
  boy(c, art, t, reducedMotion);
  blade(c, prep, t, reducedMotion);
  c.restore();
}

/** Snow drifting toward the lens from a far point, growing as it nears; deterministic. */
export function drawLensSnow(c, t, reducedMotion) {
  const vx = 760, vy = 430, speed = reducedMotion ? .5 : 1;
  for (let i = 0; i < 70; i++) {
    const life = ((t * speed * (.22 + hash(i) * .12) + hash(i + 11)) % 1);
    const angle = hash(i + 3) * Math.PI * 2, reach = life * life * 1500;
    const x = vx + Math.cos(angle) * reach, y = vy + Math.sin(angle) * reach * .7 + life * 120;
    c.fillStyle = `rgba(245,247,250,${.85 * Math.min(1, life * 5)})`;
    c.beginPath(); c.arc(x, y, 1.5 + life * life * 16, 0, Math.PI * 2); c.fill();
  }
}

/** Letter-local position of a fraction (fx, fy) of the PR-02 sheet, relative to the flap top. */
function letterPoint(art, fx, fy) {
  const lw = POCKET.letterW, lh = lw * art.letter.height / art.letter.width;
  return {x: (fx - .5) * lw, y: (fy - .62) * lh};
}

/** One FX-26 stream growing down the paper and over the jacket, after its snowflake melts. */
function stream(c, art, [col, fx, fy, land], t) {
  const grow = progress(t, land + .35, land + 4.2);
  const [sx, sy, sw, sh] = COLUMNS[col], p = letterPoint(art, fx, fy);
  // Snowflake falls onto the drawing, then becomes a clear droplet.
  const fall = clamp((t - land + .8) / .8);
  if (fall > 0 && fall < 1) {
    c.fillStyle = 'rgba(248,250,252,.9)';
    c.beginPath(); c.arc(p.x - (1 - fall) * 90, p.y - (1 - fall) * 260, 7, 0, Math.PI * 2); c.fill();
  }
  if (t >= land) {
    c.fillStyle = 'rgba(225,235,240,.45)'; c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(p.x, p.y - 4, 9, 7, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  if (grow <= 0) return;
  const length = 330, width = length * sw / sh;
  c.save(); c.beginPath(); c.rect(p.x - 40, p.y - 4, 80, length * grow); c.clip();
  c.globalAlpha = .9; c.drawImage(art.streams, sx, sy, sw, sh, p.x - width / 2, p.y - 4, width, length);
  c.restore();
}

/**
 * Foreground L5: PR-14 pocket at the frame corner with PR-02 half out, in a held pose.
 * The big PR-02 master covers the small letter in the jacket image; the flap crop is
 * redrawn over the paper so it reads as tucked in. Streams run from 0:07 to 0:14.
 */
export function drawPocketLetter(c, art, t) {
  const j = art.chestOut, s = POCKET.flapScale;
  const fx = j.width * .31, fy = j.height * .615;
  const lw = POCKET.letterW, lh = lw * art.letter.height / art.letter.width;
  c.save(); c.translate(POCKET.x, POCKET.y); c.rotate(POCKET.r);
  c.drawImage(j, j.width * .02, j.height * .3, j.width * .8, j.height * .7,
    (j.width * .02 - fx) * s, (j.height * .3 - fy) * s, j.width * .8 * s, j.height * .7 * s);
  c.save(); c.beginPath(); c.rect(-lw, -lh, lw * 2, lh + 30); c.clip();
  c.shadowColor = 'rgba(20,16,10,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.drawImage(art.letter, -lw / 2, -lh * .62, lw, lh);
  c.restore();
  // Flap crop: starts just below the small letter so no paper pixels are duplicated.
  const ax = j.width * .155, ay = j.height * .625, aw = j.width * .31, ah = j.height * .25;
  c.drawImage(j, ax, ay, aw, ah, (ax - fx) * s, (ay - fy) * s, aw * s, ah * s);
  for (const spec of STREAMS) stream(c, art, spec, t);
  c.restore();
}

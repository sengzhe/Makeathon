/**
 * S3 foreground props and inserts: crate group (HD-09 cup spill, concealed helmet
 * removal), shattered photo on the floor, HD-06 pocket insert, HD-K1 low rifle (HD-10).
 * No routine handling is drawn; pickups happen behind the dust puff.
 */
import {W, H, lerp, progress} from '../kit.js';
import {runMotion} from './common.js';

/** Draw an image by its centre-bottom point with width w and rotation r. */
function item(c, img, x, bottom, w, r = 0) {
  const h = w * img.height / img.width;
  c.save(); c.translate(x, bottom); c.rotate(r); c.drawImage(img, -w / 2, -h, w, h); c.restore();
}

/** Crate centre and top on screen for the current pan (L5, factor 2). */
function crateAnchor(cam) {
  return {cx: -1360 - cam.p * 2, top: 600 + cam.rise * 1.6};
}

/** The cup in its current state: upright with ash mark, tipped pour, then spilled. */
function cup(c, t, art, cx, top) {
  if (t < 3.5) {
    const jolt = progress(t, 3.38, 3.5) * .28;
    item(c, art.cupUp, cx + 300, top + 270, 240, jolt);
    c.save(); c.translate(cx + 300, top + 270); c.rotate(jolt);
    c.fillStyle = 'rgba(78,76,72,.8)'; c.beginPath(); c.ellipse(-38, -196, 13, 5, -.2, 0, Math.PI * 2); c.fill();
    c.restore();
    return;
  }
  if (t < 3.9) {
    const s = 620 / art.cupTip.width, x = cx + 330 - 1150 * s, y = top + 190 - 300 * s;
    const pour = progress(t, 3.5, 3.85), w = art.cupTip.width * s;
    c.save(); c.beginPath(); c.rect(x + w * (1 - lerp(.35, 1, pour)), y - 40, w * 1.2, art.cupTip.height * s + 80); c.clip();
    c.drawImage(art.cupTip, x, y, w, art.cupTip.height * s);
    c.restore();
    return;
  }
  const s = 600 / art.cupSpill.width;
  c.drawImage(art.cupSpill, cx + 180 - 1000 * s, top + 245 - 560 * s, 600, art.cupSpill.height * s);
}

/**
 * Crate with ration tin, helmet and cup. pass 'colour' redraws only the coffee so
 * its brown can drain to grey after the global drain (3.5–4.3 s).
 */
export function crateGroup(c, t, art, cam, pass = 'world') {
  const {cx, top} = crateAnchor(cam);
  if (cx < -900 || cx > W + 900) return;
  if (pass === 'colour') {
    const a = 1 - progress(t, 3.6, 4.3);
    if (t >= 3.5 && a > 0) { c.save(); c.globalAlpha = a; cup(c, t, art, cx, top); c.restore(); }
    return;
  }
  contactShadow(c, cx, top);
  c.drawImage(art.crate, cx - 700, top, 1400, 1400 * art.crate.height / art.crate.width);
  item(c, art.ration, cx - 420, top + 300, 240, -.03);
  if (t < 3.9) item(c, art.helmet, cx - 110, top + 290, 400, .04);
  cup(c, t, art, cx, top);
}

/** Floor patch and soft contact shadow so the crate sits on the room floor. */
function contactShadow(c, cx, top) {
  c.save();
  c.fillStyle = '#2b1f15'; c.fillRect(cx - 1100, top + 200, 2200, 1200);
  // The gradient reaches zero inside the filled rect, so no straight edge shows.
  const g = c.createRadialGradient(cx, top + 470, 60, cx, top + 470, 680);
  g.addColorStop(0, 'rgba(8,5,3,.7)'); g.addColorStop(1, 'rgba(8,5,3,0)');
  c.fillStyle = g; c.fillRect(cx - 1100, top - 260, 2200, 1600);
  c.restore();
}

/** Dust and pan coverage (FX-30) that hides the off-screen equipment pickup. */
export function crateDust(c, t, art, cam) {
  const a = progress(t, 3.6, 3.85) * (1 - progress(t, 3.95, 4.4));
  if (a <= 0) return;
  const {cx, top} = crateAnchor(cam), w = 1900, h = w * art.dust.height / art.dust.width;
  c.save(); c.globalAlpha = a * .92;
  c.drawImage(art.dust, cx - w / 2 - 80, top - h * .15, w, h);
  c.drawImage(art.dust, cx - w / 2 + 160, top - h * .45, w * .9, h * .9);
  c.restore();
}

/** PR-08 lying face down, glass shattered, on the floor near the doorway (L5). */
export function floorPhoto(c, art, cam) {
  const x = -2268 - cam.p * 1.8;
  if (x < -600 || x > W + 600) return;
  item(c, art.photo, x, 1060 + cam.rise * 1.6, 560, .08);
}

/**
 * HD-06 pocket insert (brief, 4.15–4.75 s): HD-K4 flat-press left hand held over
 * the dusty PR-14 pocket. One fixed contact state; only a slight whole-layer settle.
 */
export function pocketInsert(c, t, art, reducedMotion) {
  const chest = art.chest, letter = art.letter, hand = art.press;
  c.fillStyle = '#37382a'; c.fillRect(0, 0, W, H);
  c.save(); c.translate(W, 0); c.scale(-1, 1);
  c.drawImage(chest, chest.width * .10, chest.height * .35, chest.width * .64, chest.height * .60, 0, -100, W, 1350);
  c.save(); c.translate(620, 385); c.rotate(-.025);
  c.drawImage(letter, letter.width * .57, letter.height * .08, letter.width * .28, letter.height * .12, -145, -45, 290, 94);
  c.restore();
  c.drawImage(chest, chest.width * .15, chest.height * .60, chest.width * .28, chest.height * .23, 150, 462, 840, 518);
  c.restore();
  const settle = reducedMotion ? 0 : (1 - progress(t, 4.15, 4.4)) * 12;
  const w = 760, h = w * hand.height / hand.width;
  c.save(); c.translate(1330, 360 + settle); c.rotate(-.12);
  c.shadowColor = 'rgba(10,8,5,.45)'; c.shadowBlur = 24; c.shadowOffsetY = 14;
  c.drawImage(hand, -w / 2, 0, w, h);
  c.restore();
}

/**
 * HD-K1 low rifle entering from the lower-right edge (L7). Bob is 1.3× the world
 * with a 2-frame lag; enter 0..1 slides it up from below the frame.
 */
export function rifle(c, t, art, runStart, reducedMotion, enter = 1) {
  if (enter <= 0) return;
  const m = runMotion(t, runStart, reducedMotion, 1.3, 2 / 24);
  const w = 880, h = w * art.rifle.height / art.rifle.width;
  c.save(); c.translate(W + 60 + m.x, H + 90 + m.y + (1 - enter) * 520); c.rotate(m.roll * 1.3 - .02);
  c.drawImage(art.rifle, -w, -h, w, h);
  c.restore();
}

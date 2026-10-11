/**
 * S2 props: the Scene 1 crate group (HD-08 cup insert, ash mark), the wall props
 * (PR-08, PR-09, PR-10, PR-23) and their authored detail layers. No hands appear.
 */
import {surface, progress, lerp, hash, drawSprite} from '../kit.js';

/** S1 warmRoom placement (top-left anchor, width, rotation) reused for the match cut. */
function placed(c, image, x, y, width, rotation = 0) {
  c.save(); c.translate(x, y); c.rotate(rotation);
  c.drawImage(image, 0, 0, width, width * image.height / image.width);
  c.restore();
}

const CUP = {x: 1265, y: 540, w: 330, r: .015};
const RIM = {x: 1003, y: 300}; // Damp rim point in PR-05 source pixels.

/** Rim point in foreground (Scene 1) screen coordinates. */
function rimPoint() {
  const s = CUP.w / 1367, cos = Math.cos(CUP.r), sin = Math.sin(CUP.r);
  return {x: CUP.x + (RIM.x * cos - RIM.y * sin) * s, y: CUP.y + (RIM.x * sin + RIM.y * cos) * s};
}

/**
 * Crate, ration, helmet and cup in Scene 1 coordinates; a single ash flake lands on the
 * cup rim at 0:02 and fades into a grey mark over 8 frames. The mark persists.
 */
export function drawCrateGroup(c, t, art, reducedMotion) {
  placed(c, art.crate, -250, 395, 2370);
  placed(c, art.helmet, 1490, 440, 420, .06);
  placed(c, art.ration, 360, 410, 265, -.025);
  placed(c, art.cup, CUP.x, CUP.y, CUP.w, CUP.r);
  const rim = rimPoint();
  if (t >= 2) {
    const grow = progress(t, 2, 2 + 8 / 24);
    c.save(); c.translate(rim.x, rim.y); c.rotate(1.35); c.scale(2.1, 2.4);
    c.fillStyle = `rgba(50,48,46,${.9 * grow})`;
    c.beginPath(); c.moveTo(-9 * grow, -1); c.lineTo(-2, -3.5 * grow); c.lineTo(8 * grow, -1.5);
    c.lineTo(5 * grow, 2.5 * grow); c.lineTo(-4, 3 * grow); c.closePath(); c.fill();
    c.restore();
  }
  if (t >= .8 && t < 2 + 8 / 24) drawFallingFlake(c, t, rim);
  drawSteam(c, t, reducedMotion);
}

/** The single grey flake drifting onto the rim; it fades as the mark appears. */
function drawFallingFlake(c, t, rim) {
  const fall = progress(t, .8, 2);
  const x = lerp(rim.x - 70, rim.x, fall) + Math.sin(t * 4) * 10 * (1 - fall);
  const y = lerp(rim.y - 420, rim.y - 2, fall);
  const fade = 1 - progress(t, 2, 2 + 8 / 24);
  c.save(); c.translate(x, y); c.rotate(t * 2.2 * (1 - fall)); c.scale(1.6, 1.6);
  c.fillStyle = `rgba(118,114,108,${.9 * fade})`;
  c.beginPath(); c.moveTo(-7, -2); c.lineTo(1, -6); c.lineTo(7, 1); c.lineTo(-1, 5); c.closePath(); c.fill();
  c.restore();
}

/** FX-12 steam as Scene 1 draws it; it passes close to the lens during the push. */
function drawSteam(c, t, reducedMotion) {
  c.save(); c.strokeStyle = 'rgba(241,232,209,.16)'; c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const phase = reducedMotion ? i * .7 : t * .55 + i * .8;
    const x = 1390 + i * 9, y = 610;
    c.beginPath(); c.moveTo(x, y);
    c.bezierCurveTo(x - 24 + Math.sin(phase) * 15, y - 65, x + 30, y - 120, x + Math.sin(phase + 1) * 35, y - 205 - i * 8);
    c.stroke();
  }
  c.restore();
}

/** Pencil mark style shared by the authored photo and calendar layers. */
function pencil(c, width = 6) {
  c.strokeStyle = 'rgba(58,54,50,.82)'; c.fillStyle = 'rgba(58,54,50,.85)';
  c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round';
}

/** PR-08 with authored layers: "1943" under the circled father, and cracked glass. */
export function buildPhotoCard(photo) {
  const card = surface(photo.width, photo.height), c = card.getContext('2d');
  c.drawImage(photo, 0, 0);
  c.save(); c.translate(880, 625); c.rotate(.08); pencil(c); c.fillStyle = 'rgba(46,42,38,.9)';
  c.font = 'italic 600 78px "Segoe Print","Bradley Hand","Comic Sans MS",cursive';
  c.textAlign = 'center'; c.fillText('1943', 0, 0); c.restore();
  // Glass cracks radiate from one impact point, clipped to the glazing.
  c.save(); c.beginPath(); c.moveTo(324, 149); c.lineTo(1088, 210); c.lineTo(1028, 1068); c.lineTo(258, 1013);
  c.closePath(); c.clip();
  const ox = 470, oy = 360;
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * Math.PI * 2 + hash(i) * .4;
    c.beginPath(); c.moveTo(ox, oy);
    let x = ox, y = oy;
    for (let j = 1; j <= 5; j++) {
      const len = 70 + hash(i * 9 + j) * 130, turn = (hash(i * 13 + j) - .5) * .5;
      x += Math.cos(a + turn) * len; y += Math.sin(a + turn) * len; c.lineTo(x, y);
    }
    c.strokeStyle = 'rgba(30,28,26,.28)'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = 'rgba(244,242,236,.62)'; c.lineWidth = 2.5; c.stroke();
  }
  c.strokeStyle = 'rgba(244,242,236,.45)'; c.lineWidth = 2.5;
  c.beginPath(); c.arc(ox, oy, 62, .3, 2.6); c.stroke();
  c.beginPath(); c.arc(ox, oy, 150, 3.4, 5.4); c.stroke();
  c.restore();
  return card;
}

// PR-10 grid corners (TL, TR, BL, BR) and header box centre in source pixels.
const GRID = [[260, 502], [983, 535], [275, 1155], [1034, 1144]];
const bilinear = (u, v) => [0, 1].map(k => lerp(lerp(GRID[0][k], GRID[1][k], u), lerp(GRID[2][k], GRID[3][k], u), v));

/** PR-10 with authored layers: NOVEMBER 1944, day numbers, days 1-9 crossed in pencil. */
export function buildCalendarCard(calendar) {
  const card = surface(calendar.width, calendar.height), c = card.getContext('2d');
  c.drawImage(calendar, 0, 0);
  c.save(); c.translate(618, 380); c.rotate(.03);
  c.fillStyle = '#4a4034'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '700 74px Georgia,"Times New Roman",serif'; c.fillText('NOVEMBER 1944', 0, 0); c.restore();
  // 1 November 1944 fell on a Wednesday; weeks start on Sunday.
  c.font = '600 44px Georgia,serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = '#51483b';
  for (let day = 1; day <= 30; day++) {
    const slot = day + 2, col = slot % 7, row = Math.floor(slot / 7);
    const [x, y] = bilinear(col / 7 + .012, row / 5 + .02);
    c.fillText(String(day), x, y);
    if (day <= 9) {
      const [x0, y0] = bilinear(col / 7 + .02, row / 5 + .03), [x1, y1] = bilinear((col + 1) / 7 - .02, (row + 1) / 5 - .03);
      pencil(c, 7 + hash(day) * 2);
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.moveTo(x1 - 4, y0 + 3); c.lineTo(x0 + 3, y1 - 2); c.stroke();
    }
  }
  return card;
}

/** Wall props in panorama space: centre (x, y), width w, optional rotation. */
export const WALL_PROPS = {
  photo: {x: 652, y: 420, w: 135, focusH: 560},
  calendar: {x: 1856, y: 470, w: 185, focusH: 620},
  horse: {x: 700, y: 1080, w: 720, focusH: 420},
};

/** Draw a wall prop, adding the faint warm rim glow when it can be hovered. */
export function drawWallProp(c, image, spec, glow = 0) {
  if (glow > 0) {
    c.save(); c.shadowColor = `rgba(255,198,120,${.75 * glow})`; c.shadowBlur = 26;
    drawSprite(c, image, spec.x, spec.y, spec.w); c.restore();
  }
  drawSprite(c, image, spec.x, spec.y, spec.w);
}

/** PR-23 lace curtain on the wall that ends in broken brick at the gap edge. */
export function drawCurtain(c, curtain) {
  c.save(); c.globalAlpha = .96;
  drawSprite(c, curtain, 2200, 470, 300, {r: -.01});
  c.restore();
}

/** The one snowflake that lands on the horse's back during its focus hold (source px). */
export function drawHorseFlake(c, k) {
  const x = lerp(520, 600, k), y = lerp(-220, 345, k);
  c.save(); c.translate(x, y); c.strokeStyle = 'rgba(250,250,248,.95)'; c.lineWidth = 7; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + k * .6;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); c.stroke();
  }
  c.restore();
}

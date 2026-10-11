/**
 * S2 interaction: hover 1 s on a glowing object plays its 3 s focus detail once;
 * holding the cursor on the wall gap for 2 s (from 0:24) meets the scene goal.
 * Trigger times are stored in scene time so seeking stays consistent.
 */
import {W, H, clamp, progress, lerp} from '../kit.js';

const HOVER = 1, HOLD = 3, GAZE = 2;
/** A pointer at exactly (0, 0) is the player's "no pointer" value; ignore it. */
const present = pointer => pointer && !(pointer.x === 0 && pointer.y === 0);

export function createFocus() {
  const items = {};
  let gaze = 0, goal = null;
  const item = id => (items[id] ||= {hover: 0, start: null});
  /** Forget triggers that lie in the future after a backwards seek. */
  function rewind(time) {
    for (const entry of Object.values(items)) if (entry.start !== null && time < entry.start) Object.assign(entry, {start: null, hover: 0});
    if (goal !== null && time < goal) {goal = null; gaze = 0;}
  }
  /** Active focus {id, start, from} or null. */
  function active(time) {
    for (const [id, entry] of Object.entries(items)) if (entry.start !== null && time - entry.start < HOLD + .4) return {id, ...entry};
    return null;
  }
  /**
   * Advance hover timers. targets: [{id, rect:{x,y,w,h}, from}] for glowing objects in view.
   * point is the pointer in canvas pixels; returns the active focus, if any.
   */
  function update(time, delta, pointer, point, targets) {
    rewind(time);
    const current = active(time);
    for (const target of targets) {
      const entry = item(target.id), r = target.rect;
      const inside = present(pointer) && point.x > r.x && point.x < r.x + r.w && point.y > r.y && point.y < r.y + r.h;
      if (entry.start !== null || current) continue;
      entry.hover = inside ? entry.hover + delta : 0;
      if (entry.hover >= HOVER) Object.assign(entry, {start: time, from: target.from});
    }
    return active(time);
  }
  /** Accumulate gaze on the gap from 0:24; returns the goal time once met. */
  function updateGaze(time, delta, pointer, point, gapLeft) {
    if (goal !== null) return goal;
    const onGap = time >= 24 && present(pointer) && point.x > gapLeft && point.y < H * .82;
    gaze = onGap ? gaze + delta : 0;
    if (gaze >= GAZE) goal = time;
    return goal;
  }
  const used = id => items[id]?.start != null;
  return {update, updateGaze, used};
}

/**
 * Compose the focus treatment: the frame blurs and darkens 20%, the object grows from
 * its in-world size (focus.from) to a readable size over 12 frames, holds, then returns.
 * drawObject(c, cx, cy, width) paints the object card.
 */
export function drawFocus(ctx, frame, time, focus, spec, drawObject, reducedMotion) {
  const k = progress(time, focus.start, focus.start + .5) * (1 - progress(time, focus.start + HOLD, focus.start + HOLD + .4));
  ctx.filter = reducedMotion ? `brightness(${1 - .2 * k})` : `blur(${(6 * k).toFixed(2)}px) brightness(${1 - .2 * k})`;
  ctx.drawImage(frame, 0, 0); ctx.filter = 'none';
  if (k <= 0) return;
  const from = focus.from, aspect = from.h / from.w;
  const targetW = Math.max(from.w * 1.3, spec.focusH / aspect);
  const cx = lerp(from.x, lerp(from.x, W / 2, .55), k), cy = lerp(from.y, clamp(lerp(from.y, H / 2, .55), 300, 780), k);
  ctx.save(); ctx.shadowColor = `rgba(255,198,120,${.5 * k})`; ctx.shadowBlur = 40;
  drawObject(ctx, cx, cy, lerp(from.w, targetW, k), time - focus.start);
  ctx.restore();
}

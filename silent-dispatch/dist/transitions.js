// Seconds at 24 fps. Set swaps happen only when covered is true.
const timings = {
  cut: { duration: 0, swapAt: 0, color: '#000' },
  black: { duration: .6, swapAt: .3, start: .25, end: .35, color: '#000' },
  flash: { duration: 12 / 24, swapAt: 0, start: 0, end: 4 / 24, color: '#fff' },
  smoke: { duration: 1, swapAt: .5, start: 9 / 24, end: 15 / 24, color: '#a8aaa4' },
  paper: { duration: 14 / 24, swapAt: 7 / 24, start: 6 / 24, end: 8 / 24, color: '#d8cbae' },
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const seconds = value => value === Infinity ? Infinity : Number.isFinite(value) ? Math.max(0, value) : 0;

/** Stateless: callers own time, scene swaps, rendering order and cancellation. */
export function transitionFrame(kind, elapsed, { reducedMotion = false } = {}) {
  const timing = timings[kind];
  if (!timing) throw new RangeError(`Unknown transition: ${kind}`);
  const { duration, swapAt, start, end, color } = timing;
  const time = clamp(seconds(elapsed), 0, duration);
  const done = time >= duration;
  const covered = kind === 'cut' || (time >= start && time < end);
  const progress = duration ? time / duration : 1;
  let opacity = 0;
  if (duration && !done) {
    opacity = time < start ? time / start : time < end ? 1 : (duration - time) / (duration - end);
    if (!reducedMotion && (kind === 'smoke' || kind === 'paper')) opacity = time > 0 ? 1 : 0;
  }
  return { duration, swapAt, covered, opacity, color, progress, done, reducedMotion: Boolean(reducedMotion) };
}

/** Only ordinary advance input. A scene owns aiming, hover goals and card actions. */
export function canAdvance(sceneId, time) {
  return sceneId === 's0' || (sceneId === 's1' && seconds(time) >= 42) || (sceneId === 's2' && seconds(time) >= 24);
}

/** Paint above the scene. Restore canvas state; do not clear the scene below. */
export function drawTransition(ctx, kind, frame, width, height) {
  if (!ctx || !frame.opacity || frame.done || width <= 0 || height <= 0) return;
  ctx.save();
  ctx.globalAlpha = frame.opacity;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = frame.color;
  const spatial = !frame.reducedMotion && (kind === 'smoke' || kind === 'paper');
  if (!spatial || frame.covered) {
    // An unconditional opaque rectangle guarantees that covered really hides a swap.
    ctx.fillRect(0, 0, width, height);
  } else {
    const timing = timings[kind];
    const time = frame.progress * timing.duration;
    const entering = time < timing.start;
    const travel = entering ? time / timing.start : (time - timing.end) / (timing.duration - timing.end);
    const edge = (-.15 + 1.3 * travel) * width;
    const side = entering ? 0 : width;
    ctx.beginPath();
    ctx.moveTo(side, 0);
    for (let i = 0; i <= 16; i++) {
      const y = i / 16 * height;
      const offset = kind === 'paper' ? (i / 16 - .5) * width * .08
        : width * (.045 * Math.sin(i * 1.7 + frame.progress * 5) + .025 * Math.cos(i * .8));
      ctx.lineTo(edge + offset, y);
    }
    ctx.lineTo(side, height);
    ctx.closePath();
    ctx.clip();
    ctx.fillRect(0, 0, width, height);
  }
  if (spatial && kind === 'smoke') {
    // Broad overlapping billows are deterministic, reusable and require no image assets.
    for (let i = 0; i < 10; i++) {
      const x = ((i * .31 + frame.progress * .24) % 1.5 - .25) * width;
      const y = (.15 + (i % 4) * .25) * height;
      const radius = width * (.16 + (i % 3) * .03);
      ctx.globalAlpha = .12;
      ctx.fillStyle = i % 2 ? '#e0e0d8' : '#4f5550';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // T-PAPER's shared fallback is a matte wipe. Scene 1 can overlay its newspaper crop.
  ctx.restore();
}

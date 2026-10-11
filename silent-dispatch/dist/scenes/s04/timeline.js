/**
 * S4 timeline: beat constants, the three shot sequences and the integrated run.
 * Everything is a pure function of scene time t and the recorded fire times, so
 * seeking always reproduces the same frame.
 */
import {clamp, lerp, progress} from '../kit.js';

export const DURATION = 105;
export const FPS = 24;
export const frames = n => n / FPS;
export const SMOKE = [40, 75];
export const SET_START = {A: 0, B: 40, C: 75};

// Per-shot staging. hold = sight hold after the shot, before HD-14 lowers the rifle.
export const SHOTS = [
  {start: 20, hold: 1.6, flash: 2, zoom: 2.7, tremor: 0},
  {start: 55, hold: 3.4, flash: 2, zoom: 2.8, tremor: 0},
  {start: 90, hold: 1.2, flash: 4, zoom: 2.6, tremor: 1},
];
export const SLOW_IN = 12 / FPS, RAISE = frames(8), DRIFT = frames(20), AUTO = 6, LOWER = frames(8);

/** Fire time for shot i: the viewer's click if recorded, else the 6 s auto-fire. */
export function fireTime(i, clicks) {
  return clicks[i] ?? SHOTS[i].start + AUTO;
}

/** Click acceptance window [open, close) for shot i: from sight-up to auto-fire. */
export function clickWindow(i) {
  const s = SHOTS[i].start;
  return [s + SLOW_IN + RAISE, s + AUTO];
}

/**
 * Phase times of one shot sequence. Returns {start, raise, sight, settled, fire,
 * lower, carry} where lower is the start of HD-14 and carry its end.
 */
export function shotTimes(i, clicks) {
  const shot = SHOTS[i], start = shot.start, fire = fireTime(i, clicks);
  const raise = start + SLOW_IN, sight = raise + RAISE, lower = fire + shot.hold;
  return {start, raise, sight, settled: sight + DRIFT, fire, lower, carry: lower + LOWER};
}

/** Index of the shot whose sequence covers t (start..carry), or -1. */
export function activeShot(t, clicks) {
  for (let i = 0; i < SHOTS.length; i++) {
    const p = shotTimes(i, clicks);
    if (t >= p.start && t < p.carry + .05) return i;
  }
  return -1;
}

/** 1 while running freely, easing to 0 inside a shot (forward speed and slow motion). */
export function aimRelease(t, clicks) {
  let f = 1;
  for (let i = 0; i < SHOTS.length; i++) {
    const p = shotTimes(i, clicks);
    if (t >= p.start && t < p.lower + .6) f = Math.min(f, 1 - progress(t, p.start, p.raise) + progress(t, p.lower - .5, p.lower));
  }
  return clamp(f);
}

/** Moment Tommy is hit: during the HD-14 lowering after Shot 2. */
export const hitTime = clicks => shotTimes(1, clicks).lower + .15;

/**
 * Base forward speed in m/s before the aim release is applied. Set-specific values
 * keep the scripted distances: barn at 40 m for Shot 1, crater at 20 m for Shot 2.
 */
function baseSpeed(t, plan) {
  if (t < 40) {
    if (t < 12) return 6;
    if (t < plan.resumeA) return lerp(6, .45, progress(t, 12, 13.2));
    return plan.vA;
  }
  if (t < 75) {
    if (t < plan.resumeB) return 2.2;
    if (t < 71.5) return plan.vB;
    return lerp(plan.vB, .55, progress(t, 71.5, 72.4));
  }
  return t < plan.resumeC ? .5 : .9;
}

/** Fixed-step integration of world time, distance and footstep phase. */
function integrate(plan, clicks) {
  const dt = 1 / 120, n = Math.ceil(DURATION / dt) + 2;
  const wt = new Float32Array(n), dist = new Float32Array(n), steps = new Float32Array(n);
  for (let k = 1; k < n; k++) {
    const t = (k - .5) * dt, release = aimRelease(t, clicks);
    const scale = lerp(.3, 1, release), v = baseSpeed(t, plan) * release;
    wt[k] = wt[k - 1] + scale * dt;
    dist[k] = dist[k - 1] + v * dt;
    steps[k] = steps[k - 1] + 2.8 * scale * clamp(v / 1.2) * dt;
  }
  return {dt, wt, dist, steps};
}

/**
 * Build the run plan for the recorded clicks. Usage: const plan = buildPlan(clicks);
 * plan.at(t) returns {wt, d, step} by linear interpolation.
 */
export function buildPlan(clicks) {
  const resume = i => shotTimes(i, clicks).lower;
  const plan = {resumeA: resume(0), resumeB: resume(1), resumeC: resume(2), vA: 4, vB: 3};
  plan.vA = 37 / Math.max(4, 39.4 - plan.resumeA - .3);
  plan.vB = 18.4 / Math.max(4, 71.5 - plan.resumeB - .3);
  const table = integrate(plan, clicks);
  plan.at = t => {
    const x = clamp(t, 0, DURATION) / table.dt, k = Math.floor(x), f = x - k;
    const read = arr => lerp(arr[k], arr[Math.min(k + 1, arr.length - 1)], f);
    return {wt: read(table.wt), d: read(table.dist), step: read(table.steps)};
  };
  plan.clicks = clicks;
  return plan;
}

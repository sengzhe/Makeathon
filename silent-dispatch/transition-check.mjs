import assert from 'node:assert/strict';
import { transitionFrame, canAdvance, drawTransition } from './dist/transitions.js';

assert.equal(canAdvance('s1', 41.999), false);
assert.equal(canAdvance('s1', 42), true);
assert.equal(canAdvance('s1', NaN), false);
assert.equal(canAdvance('s1', -1), false);
assert.equal(canAdvance('s0', 0), true);
assert.equal(canAdvance('s2', 0), true);
for (const id of ['s3', 's4', 's5', 's6', 'unknown']) assert.equal(canAdvance(id, 999), false);
assert.equal(transitionFrame('cut', 0).done, true);
assert.equal(transitionFrame('cut', 0).covered, true);
assert.throws(() => transitionFrame('unknown', 0), RangeError);

for (const reducedMotion of [false, true]) {
  for (const [kind, expected] of Object.entries({ cut: 0, black: .3, flash: 0, smoke: .5, paper: 7 / 24 })) {
    const { swapAt } = transitionFrame(kind, 0, { reducedMotion });
    assert.equal(swapAt, expected);
    assert.equal(transitionFrame(kind, swapAt, { reducedMotion }).covered, true);
  }
  const flash = Array.from({ length: 13 }, (_, i) => transitionFrame('flash', i / 24, { reducedMotion }));
  assert.equal(flash.filter(frame => frame.covered).length, 4);
  assert.equal(flash[4].opacity, 1);
  assert.ok(Math.abs(flash[8].opacity - .5) < 1e-10);
  assert.equal(flash[12].done, true);
  const smoke = Array.from({ length: 25 }, (_, i) => transitionFrame('smoke', i / 24, { reducedMotion }));
  assert.equal(smoke.filter(frame => frame.covered).length, 6);
  assert.equal(smoke[24].opacity, 0);

  for (const kind of ['black', 'flash', 'smoke', 'paper']) {
    const middle = kind === 'flash' ? 2 / 24 : transitionFrame(kind, 0).duration / 2;
    const frame = transitionFrame(kind, middle, { reducedMotion });
    assert.equal(frame.covered, true);
    assert.equal(frame.opacity, 1);
    const rects = [];
    let depth = 0;
    const ctx = {
      save() { depth++; }, restore() { depth--; },
      fillRect(...bounds) { rects.push({ alpha: this.globalAlpha, bounds }); },
      beginPath() {}, arc() {}, fill() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    };
    drawTransition(ctx, kind, frame, 1920, 1080);
    assert.deepEqual(rects[0], { alpha: 1, bounds: [0, 0, 1920, 1080] });
    assert.equal(depth, 0);
    for (const elapsed of [-1, NaN, .01, middle, 999, Infinity]) {
      const sample = transitionFrame(kind, elapsed, { reducedMotion });
      assert.ok(sample.opacity >= 0 && sample.opacity <= 1);
      assert.ok(sample.progress >= 0 && sample.progress <= 1);
      drawTransition(ctx, kind, sample, 1920, 1080);
      assert.equal(depth, 0);
    }
    assert.equal(transitionFrame(kind, Infinity).done, true);
  }
}
console.log('PASS: advance gates, authored flash/smoke timing, opaque swap coverage, reduced motion and canvas state balance.');

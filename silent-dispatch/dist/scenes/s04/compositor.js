/**
 * Selective-colour compositor for S4 (script: 10% saturation, only fire orange and
 * blood red keep colour). Every draw runs twice: into the world canvas, and into a
 * colour canvas where coloured items paint and all other items erase what they
 * cover. The world is graded grey, then the colour canvas restores the hues with
 * correct occlusion.
 * Usage: comp.begin(matrix); comp.draw(fn); comp.draw(fn, true); comp.finish(ctx);
 */
import {W, H, surface} from '../kit.js';

export function createCompositor() {
  const world = surface(), colour = surface();
  const wc = world.getContext('2d'), cc = colour.getContext('2d');
  let matrix = new DOMMatrix();

  /** Clear both passes and set the camera matrix used by subsequent draws. */
  function begin(m) {
    for (const c of [wc, cc]) {c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);}
    matrix = m || new DOMMatrix();
  }
  /** Change the transform for later draws (e.g. identity for the camera-locked L7). */
  function setMatrix(m) { matrix = m || new DOMMatrix(); }

  /** Draw fn(ctx) into both passes; coloured items keep their hue after grading. */
  function draw(fn, coloured = false) {
    for (const [c, pass] of [[wc, 'world'], [cc, 'colour']]) {
      c.save(); c.setTransform(matrix);
      if (pass === 'colour' && !coloured) c.globalCompositeOperation = 'destination-out';
      fn(c, pass);
      c.restore();
    }
  }

  /** Composite: grey-graded world, then the preserved colour on top. */
  function finish(ctx, saturation = .1) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = `saturate(${saturation}) contrast(1.04)`;
    ctx.drawImage(world, 0, 0); ctx.filter = 'none';
    ctx.drawImage(colour, 0, 0);
    ctx.restore();
  }

  function dispose() { world.width = colour.width = 0; }
  return {begin, setMatrix, draw, finish, dispose, get matrix() { return matrix; }};
}

/**
 * S5 The Grenade — local 0:00–0:30, production script Scene 5 and HD-15.
 * 0:00 grenade lands two steps ahead · 0:00.5 slow motion 0.1 and the final reach ·
 * 0:02 T-FLASH (hands and rifle never return) · 0:02.5 BG-06 at mud level, rotated 70° ·
 * 0:05–0:10 natural colour returns · 0:07–0:14 crayon run · 0:10–0:14 the boy ·
 * 0:15–0:20 the medic and the letter · 0:20–0:25 iris to the star · 0:25–0:30 black.
 * Clicks do nothing in this scene; the player's canAdvance already refuses s5.
 * No AU assets exist yet; sound cues are left to the player when they do.
 */
import {W, H, lerp, progress, surface, loadArt, vignette} from './kit.js';
import {assets, prepare} from './s05/prep.js';
import {drawRunWorld, drawReach} from './s05/run.js';
import {drawGroundWorld, drawLensSnow, drawPocketLetter} from './s05/ground.js';
import {drawMedic, drawStar, drawIris, groundLetterGone} from './s05/medic.js';

export {assets};
const DURATION = 30, FLASH = 2, FLASH_HOLD = FLASH + 4 / 24, FLASH_END = FLASH_HOLD + 8 / 24;

/** White T-FLASH opacity; reduced motion swaps the hard 4-frame hit for a slow swell. */
function flashAlpha(t, reducedMotion) {
  if (reducedMotion) return t < FLASH ? progress(t, 1.6, FLASH) : 1 - progress(t, 2.3, 3.1);
  if (t < FLASH) return 0;
  return t < FLASH_HOLD ? 1 : 1 - progress(t, FLASH_HOLD, FLASH_END);
}

/** Saturation for the ground shot: grey, soft return to daylight colour, then drained for the star. */
function groundSaturation(t) {
  return lerp(.12, 1, progress(t, 5, 10)) * (1 - progress(t, 20, 22.5));
}

export async function mountScene({root, assetBase, reducedMotion = false, signal, handoff}) {
  const art = await loadArt(assets, assetBase, signal);
  const prep = prepare(art, reducedMotion);
  const canvas = surface(), frame = surface(), fore = surface();
  const ctx = canvas.getContext('2d'), c = frame.getContext('2d'), f = fore.getContext('2d');
  if (!ctx || !c || !f) throw new Error('Scene 5 requires Canvas 2D');
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'The grenade. A grenade lands ahead; Tommy reaches for the letter in his pocket. White. From the ground, colour returns, the crayon runs, a frightened boy in a foxhole, and a medic holding the letter with its yellow star.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;';
  root.append(canvas);
  let disposed = false, lastTime = 0;

  /** 0:00–0:02 run, grenade and HD-15, grey grade with red kept in the sleeve stain. */
  function runShot(t) {
    c.clearRect(0, 0, W, H);
    drawRunWorld(c, art, t, reducedMotion);
    ctx.filter = 'saturate(.12) contrast(.96)'; ctx.drawImage(frame, 0, 0); ctx.filter = 'none';
    drawReach(ctx, art, prep, t, reducedMotion);
  }

  /** Foreground letter with a rack focus in from the blur of the fall (held sharp when reduced). */
  function pocketLayer(t) {
    if (groundLetterGone(t)) return;
    if (reducedMotion) { drawPocketLetter(c, art, t); return; }
    const blur = lerp(10, 0, progress(t, 3.4, 5.6));
    if (blur < .2) { drawPocketLetter(c, art, t); return; }
    f.clearRect(0, 0, W, H); drawPocketLetter(f, art, t);
    c.filter = `blur(${blur.toFixed(2)}px)`; c.drawImage(fore, 0, 0); c.filter = 'none';
  }

  /** 0:02+ ground view through to the medic, graded as one frame. */
  function groundShot(t) {
    c.clearRect(0, 0, W, H);
    drawGroundWorld(c, art, prep, t, reducedMotion);
    pocketLayer(t);
    drawMedic(c, art, t, reducedMotion);
    drawLensSnow(c, t, reducedMotion);
    const bright = 1 + .45 * (1 - progress(t, FLASH_HOLD, 3.4));
    ctx.filter = `saturate(${groundSaturation(t).toFixed(3)}) brightness(${bright.toFixed(3)})`;
    ctx.drawImage(frame, 0, 0); ctx.filter = 'none';
    if (t >= 19.5) drawStar(ctx, art, prep, t);
  }

  function render({time = 0} = {}) {
    if (disposed || signal?.aborted) return;
    const t = Math.max(0, Math.min(DURATION, time)); lastTime = t;
    ctx.clearRect(0, 0, W, H);
    if (t >= 25.5) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
    if (t < FLASH) runShot(t); else groundShot(t);
    vignette(ctx, t < FLASH ? .5 : .38, '12,12,14');
    const white = flashAlpha(t, reducedMotion);
    if (white > 0) { ctx.fillStyle = `rgba(255,255,255,${white})`; ctx.fillRect(0, 0, W, H); }
    drawIris(ctx, art, t);
  }

  return {
    render,
    // Clicks are deliberately inert for the whole scene: control is taken away.
    onAction: () => 'handled',
    getHandoff: () => ({...handoff, location: 'black', tommy: 'killed', letter: 'held-by-medic', star: 'yellow', boy: 'alive', sceneTime: lastTime}),
    dispose() { disposed = true; canvas.remove(); frame.width = 0; fore.width = 0; },
  };
}

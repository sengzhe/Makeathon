/**
 * S4 The Field — local 0:00–1:45. Three shots (click or auto-fire 6 s after each
 * window opens), Tommy's wound, the flare and the boy in the foxhole.
 * The player owns the clock; clicks are stored as times so seeking reproduces them.
 * Modules: s04/timeline (beats, run integration), camera, compositor (selective
 * colour), field-a/b/c (sets), foreground + rifle (L7), screen (L8/L9), director.
 */
import {loadArt, surface} from './kit.js';
import {assets} from './s04/assets.js';
import {DURATION, SHOTS, buildPlan, clickWindow} from './s04/timeline.js';
import {createCompositor} from './s04/compositor.js';
import {createFieldA} from './s04/field-a.js';
import {createFieldB} from './s04/field-b.js';
import {createFieldC} from './s04/field-c.js';
import {createSleeve} from './s04/rifle.js';
import {createDirector} from './s04/director.js';
import {speedAt} from './s04/camera.js';

export {assets};

export async function mountScene({root, assetBase, reducedMotion = false, signal, handoff}) {
  const art = await loadArt(assets, assetBase, signal);
  await document.fonts?.load('italic 40px "IM Fell English"').catch(() => {});
  const canvas = surface(), ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Scene 4 requires Canvas 2D');
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'The Field. Running through grey farmland under fire; three shots; a wound; a flare.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#0b0c0c;';
  root.append(canvas);
  const comp = createCompositor(), sleeve = createSleeve(art);
  const sets = {A: createFieldA(art, reducedMotion), B: createFieldB(art, reducedMotion), C: createFieldC(art, reducedMotion)};
  const director = createDirector({art, comp, sets, sleeve, reducedMotion});
  const clicks = [null, null, null];
  let plan = buildPlan(clicks), disposed = false, last = null;

  /** Forget a recorded click when the reviewer seeks back before its window. */
  function resetFutureClicks(t) {
    let changed = false;
    SHOTS.forEach((shot, i) => { if (clicks[i] !== null && t < shot.start) { clicks[i] = null; changed = true; } });
    if (changed) plan = buildPlan(clicks);
  }

  function render({time = 0} = {}) {
    if (disposed || signal?.aborted) return;
    const t = Math.max(0, Math.min(DURATION, time));
    resetFutureClicks(t);
    last = director.render(ctx, t, plan, clicks);
  }

  /** A click inside an open aim window fires that shot at the click time. */
  function onAction({time}) {
    for (let i = 0; i < SHOTS.length; i++) {
      const [open, close] = clickWindow(i);
      if (clicks[i] === null && time >= open && time < close) {
        clicks[i] = time; plan = buildPlan(clicks); return 'handled';
      }
    }
    return 'handled';
  }

  return {
    render,
    onAction,
    // Scene 5 continues the injured run in BG-05 with the grey grade.
    getHandoff: () => ({
      ...handoff, location: 'field-c', palette: 'grey', injured: true, sleeveStain: 'full', letter: 'secured',
      runSpeed: last ? speedAt(plan, last.t) : 1, stepPhase: last?.step ?? 0,
      layout: last ? sets.C.layout(last) : null, shotTimes: last?.shots.map(s => s.fire) ?? [], sceneTime: last?.t ?? 0,
    }),
    dispose() { disposed = true; canvas.remove(); comp.dispose(); sleeve.dispose(); },
  };
}

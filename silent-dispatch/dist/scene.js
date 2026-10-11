import {scenes} from './scene-registry.js';
import {transitionFrame, drawTransition, canAdvance} from './transitions.js';

// One clock and input owner. Scene modules render; only this player advances.
export async function playScene(stage, {reducedMotion = false, review = false, initialScene = 0} = {}) {
  const lifetime = new AbortController();
  const assetBase = new URL('./assets/film/', import.meta.url).href;
  const state = {};
  let current, currentAbort, nextModule, frame, previous;
  let index = Math.max(0, Math.min(scenes.length - 1, Math.trunc(Number(initialScene) || 0)));
  let time = 0, paused = false, busy = true, ended = false, transition = null;
  let generation = 0, pendingAdvance = false;
  const pointer = {x:0, y:0};
  let finish;
  const completed = new Promise(resolve => {finish = resolve;});
  stage.replaceChildren(); stage.classList.add('film-player');
  stage.innerHTML = `<div class="film-viewport"><div class="film-host"></div><canvas class="film-transition" width="1920" height="1080" aria-hidden="true"></canvas></div>
    <p class="film-message" role="status" aria-live="polite">Loading the scene…</p>
    <div class="film-controls"><button type="button" data-action="pause">Pause</button><span class="film-time"></span><button type="button" data-action="exit">Return to newspaper</button></div>`;
  const viewport = stage.querySelector('.film-viewport'), host = stage.querySelector('.film-host');
  const overlay = stage.querySelector('canvas'), ctx = overlay.getContext('2d');
  const message = stage.querySelector('.film-message'), pause = stage.querySelector('[data-action="pause"]');
  const clock = stage.querySelector('.film-time');
  let select, seek, transitionSelect;
  if (review) {
    const tools = document.createElement('div'); tools.className = 'film-review';
    tools.innerHTML = `<label>Scene <select aria-label="Review scene"></select></label><label class="film-seek-label">Time <input aria-label="Scene time" type="range" min="0" value="0" step="0.05"></label><label>Transition <select aria-label="Transition preview"><option value="script">Script</option><option>cut</option><option>black</option><option>smoke</option><option>flash</option><option>paper</option></select></label><button type="button" data-action="next">Next scene</button>`;
    stage.append(tools);
    [select, transitionSelect] = tools.querySelectorAll('select'); seek = tools.querySelector('input');
    for (const scene of scenes) select.add(new Option(`${scene.id} · ${scene.title}`, scene.id));
    select.addEventListener('change', () => jump(Number(select.value)), {signal:lifetime.signal});
    seek.addEventListener('input', () => {
      if (busy) return;
      time = Number(seek.value); transition = null; pendingAdvance = false;
      ctx.clearRect(0, 0, 1920, 1080); setPaused(true); render(0);
    }, {signal:lifetime.signal});
  }
  function setPaused(value) {
    paused = value; pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-pressed', String(paused)); previous = undefined;
  }
  function stop() { if (!ended) {ended = true; currentAbort?.abort(); finish();} }
  function reportError(error) {
    console.error('Scene load failed:', error); busy = false; setPaused(true);
    message.hidden = false; message.replaceChildren(document.createTextNode('This scene could not load. '));
    const retry = document.createElement('button'); retry.textContent = 'Retry';
    retry.addEventListener('click', () => jump(index), {signal:lifetime.signal}); message.append(retry);
  }
  function preload() {
    nextModule = null;
    const expected = index + 1;
    if (!scenes[expected]) return;
    // Import is speculative. The next scene's assets decode under opaque coverage.
    scenes[expected].load().then(module => {if (index + 1 === expected) nextModule = module;}, () => {});
  }
  async function mount(target, module, handoff) {
    const ticket = ++generation;
    busy = true; currentAbort?.abort();
    const controller = new AbortController(); currentAbort = controller;
    message.hidden = false; message.textContent = 'Loading the scene…';
    const root = document.createElement('div'); root.className = 'film-scene'; root.dataset.scene = String(target);
    let scene;
    try {
      module ||= await scenes[target].load();
      scene = await module.mountScene({root, assetBase, reducedMotion, signal:controller.signal, handoff, state});
      if (ticket !== generation || ended) {scene.dispose?.(); return;}
      if (typeof scene.render !== 'function') throw new Error(`Scene ${target} must return render()`);
      current?.dispose?.(); current = scene; host.replaceChildren(root); index = target; time = 0;
      busy = false; previous = undefined; stage.dataset.scene = String(index); message.hidden = true;
      if (review) {select.value = String(index); seek.max = String(scenes[index].duration);}
      render(0); preload();
    } catch (error) {
      scene?.dispose?.(); root.remove();
      if (ticket !== generation || ended || controller.signal.aborted) return;
      index = target; reportError(error);
    }
  }
  async function jump(target) {
    transition = null; pendingAdvance = false; setPaused(true);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1920, 1080);
    await mount(target, null, null); ctx.clearRect(0, 0, 1920, 1080);
  }
  function transitionKind() {return review && transitionSelect.value !== 'script' ? transitionSelect.value : scenes[index].transition;}
  function beginTransition(manual = false) {
    if (transition || busy || ended) return;
    if (!scenes[index + 1]) {stop(); return;}
    transition = {kind:transitionKind(), elapsed:0, swapped:false, manual};
  }
  async function swap() {
    if (!transition || transition.swapped || busy) return;
    transition.swapped = true;
    const handoff = current?.getHandoff?.() ?? null;
    // Keep coverage opaque during decoding. Neither scene clock runs while loading.
    ctx.fillStyle = transitionFrame(transition.kind, 0).color;
    ctx.fillRect(0, 0, 1920, 1080);
    await mount(index + 1, nextModule, handoff);
  }
  function render(delta) {
    if (!current || busy) return;
    current.render({time, delta, pointer, state}); stage.dataset.time = time.toFixed(3);
    const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    clock.textContent = `${scenes[index].title} · ${format(time)} / ${format(scenes[index].duration)}`;
    if (seek) seek.value = String(time);
  }
  function tick(now) {
    if (ended) return;
    const delta = previous === undefined ? 0 : Math.min((now - previous) / 1000, .1); previous = now;
    if (!paused && !busy) {
      time = Math.min(scenes[index].duration, time + delta);
      if (!transition) {
        const spec = transitionFrame(transitionKind(), 0, {reducedMotion});
        if (pendingAdvance || time >= scenes[index].duration - spec.swapAt) beginTransition(pendingAdvance);
      }
      if (transition) {
        transition.elapsed += delta;
        const info = transitionFrame(transition.kind, transition.elapsed, {reducedMotion});
        if (!transition.swapped && transition.elapsed >= info.swapAt && (transition.manual || time >= scenes[index].duration)) {
          pendingAdvance = false; void swap();
        }
        if (!busy) {
          ctx.clearRect(0, 0, 1920, 1080);
          drawTransition(ctx, transition.kind, info, 1920, 1080);
          if (info.done && transition.swapped) {transition = null; ctx.clearRect(0, 0, 1920, 1080);}
        }
      }
      try {render(delta);} catch (error) {reportError(error);}
    }
    frame = requestAnimationFrame(tick);
  }
  function action() {
    if (busy || paused || transition || ended) return;
    const result = current?.onAction?.({time, pointer, state});
    if (canAdvance(`s${index}`, time) && result !== 'handled') pendingAdvance = true;
  }
  stage.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button?.dataset.action === 'exit') stop();
    else if (button?.dataset.action === 'pause') setPaused(!paused);
    else if (button?.dataset.action === 'next' && review && !busy) {setPaused(false); pendingAdvance = true;}
    else if (event.target.closest('.film-viewport')) action();
  }, {signal:lifetime.signal});
  viewport.addEventListener('pointermove', event => {
    const rect = viewport.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
  }, {signal:lifetime.signal});
  viewport.addEventListener('pointerleave', () => {pointer.x = pointer.y = 0;}, {signal:lifetime.signal});
  stage.addEventListener('scene-stop', stop, {signal:lifetime.signal});
  window.addEventListener('keydown', event => {
    if (['INPUT','SELECT','BUTTON'].includes(event.target.tagName)) return;
    if (event.key === ' ') {event.preventDefault(); setPaused(!paused);}
    if (event.key === 'Enter') action();
    if (event.key === 'Escape') stop();
  }, {signal:lifetime.signal});
  document.addEventListener('visibilitychange', () => {if (document.hidden) setPaused(true);}, {signal:lifetime.signal});
  try {await mount(index); frame = requestAnimationFrame(tick); await completed;}
  finally {
    ended = true; generation++; cancelAnimationFrame(frame); lifetime.abort(); currentAbort?.abort(); current?.dispose?.();
    stage.replaceChildren(); stage.classList.remove('film-player'); delete stage.dataset.scene; delete stage.dataset.time;
  }
}

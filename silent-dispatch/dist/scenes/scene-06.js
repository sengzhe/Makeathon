/**
 * S6 Black — local 0:00–0:45, production script Scene 6 (TX-04 cards, FX-27 star, TX-05, TX-06).
 * Silent throughout. Cards follow fixed timers; a click skips to the current card's fade-out
 * only after it has held 3 s. Seeking resets any skip so review frames stay deterministic.
 * TX-05 reuses Annie's own pencil pixels from the letter art, lifted onto black.
 * TX-06 is drawn only: the player ends the film at 0:45 and owns the actual replay control.
 */
import {W, H, clamp, progress, loadArt, surface} from './kit.js';
import {prepareStar, prepareHandwriting, drawStarBeat} from './s06/star.js';

export const assets = {
  star: 'effects/FX-27_crayon-star_v1.png',
  letter: 'annies-letter-v1.png',
};
const DURATION = 45, FADE = 1, CLICK_HOLD = 3;
const SERIF = '"IM Fell English", Georgia, serif';
const CARD_PX = 40;
// TX-04 exact wording; [start, end] in local seconds, holds of 4 s, 4 s, 4 s, 5 s, 5 s.
const CARDS = [
  {start: 3, end: 9, text: 'Private Thomas Hale was 19. He did not come home for Christmas.'},
  {start: 9, end: 15, text: 'Neither did the man in the window. Or Karl. Or the man on the wall.'},
  {start: 15, end: 21, text: 'The boy in the foxhole lived. He never spoke about that morning.'},
  {start: 21, end: 28, text: 'An estimated 70 to 85 million people died in the Second World War.'},
  {start: 28, end: 35, text: 'Every one of them had someone waiting for them to come home.'},
];
const REPLAY_AT = 44.3;

/** Break a card at sentence ends so each sentence sits on its own centred line. */
function cardLines(text) {
  return text.match(/[^.]+\.(\s|$)/g)?.map(line => line.trim()) ?? [text];
}

/** Card index active at local time t, or -1 between cards. */
function cardAt(t) {
  return CARDS.findIndex(card => t >= card.start && t < card.end);
}

export async function mountScene({root, assetBase, reducedMotion = false, signal, handoff}) {
  const [art] = await Promise.all([
    loadArt(assets, assetBase, signal),
    document.fonts?.load(`${CARD_PX}px ${SERIF}`).catch(() => null),
  ]);
  if (signal?.aborted) throw new DOMException('Scene cancelled', 'AbortError');
  const canvas = surface(), ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Scene 6 requires Canvas 2D');
  const star = prepareStar(art.star), hand = prepareHandwriting(art.letter);
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'Black. Closing cards, then Annie’s yellow star and her words, Please be careful.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;';
  // Canvas text is invisible to assistive technology; mirror each card into a polite live region.
  const live = document.createElement('p');
  live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
  root.append(canvas, live);
  let disposed = false, skip = 0, lastRaw = 0, lastLocal = 0, spoken = -1;

  /** Local scene time: player time plus any card skips; seeks discard skips. */
  function localTime(time) {
    if (time < lastRaw - 1e-3 || time - lastRaw > .5) skip = 0;
    lastRaw = time;
    return clamp(time + skip, 0, DURATION);
  }
  /** Draw one TX-04 card with 1 s fades at both ends. */
  function drawCard(t, card) {
    const alpha = Math.min(progress(t, card.start, card.start + FADE), 1 - progress(t, card.end - FADE, card.end));
    if (alpha <= 0) return;
    const lines = cardLines(card.text), lead = CARD_PX * 1.7;
    ctx.save();
    ctx.globalAlpha = alpha; ctx.fillStyle = '#f3f0e8';
    ctx.font = `${CARD_PX}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(CARD_PX * .05).toFixed(1)}px`;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, H / 2 + (i - (lines.length - 1) / 2) * lead));
    ctx.restore();
  }
  /** TX-06: a small, dim word at bottom centre; nothing else on screen. */
  function drawReplay(t) {
    const alpha = .38 * progress(t, REPLAY_AT, REPLAY_AT + .7);
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#d8d3c6';
    ctx.font = `22px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    ctx.fillText('Replay', W / 2, H - 70);
    ctx.restore();
  }
  /** Keep the live region in step with the visible card. */
  function announce(index) {
    if (index === spoken) return;
    spoken = index; live.textContent = index >= 0 ? CARDS[index].text : '';
  }
  function render({time = 0} = {}) {
    if (disposed || signal?.aborted) return;
    const t = localTime(time); lastLocal = t;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const index = cardAt(t);
    if (index >= 0) drawCard(t, CARDS[index]);
    announce(index);
    drawStarBeat(ctx, t, {star, hand, reducedMotion});
    drawReplay(t);
  }
  /** Click: after a card has held 3 s, jump to its fade-out. Never asks the player to advance. */
  function onAction({time = 0} = {}) {
    const t = localTime(time), card = CARDS[cardAt(t)];
    if (card && t >= card.start + FADE + CLICK_HOLD && t < card.end - FADE) skip += card.end - FADE - t;
    return 'handled';
  }
  return {
    render,
    onAction,
    getHandoff: () => ({...handoff, ending: 'complete', sceneTime: lastLocal}),
    dispose() { disposed = true; canvas.remove(); live.remove(); },
  };
}

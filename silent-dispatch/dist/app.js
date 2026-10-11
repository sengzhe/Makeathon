import { playScene } from './scene.js';
import { hauntWords } from './ink.js';
const newspaper = document.querySelector('#newspaper');
const dialog = document.querySelector('#scene');
const enter = document.querySelector('#enter-scene');
const toggle = document.querySelector('#motion-toggle');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = preference.matches;
let playing = false;
let surpriseTimer;
const activeSurprises = new Map();
function updateMotion() {
  document.body.classList.toggle('motion-off', motionOff);
  toggle.textContent = `Ambient motion: ${motionOff ? 'off' : 'on'}`;
  toggle.setAttribute('aria-pressed', String(motionOff));
  stopSurprise();
  scheduleSurprise();
}
toggle.addEventListener('click', () => { motionOff = !motionOff; updateMotion(); });
preference.addEventListener('change', () => { motionOff = preference.matches; updateMotion(); });
// Stagger up to three shadows across different visible paragraphs.
function scheduleSurprise(delay = 3300 + Math.random()*1700) {
  clearTimeout(surpriseTimer);
  if (motionOff || playing || document.hidden) return;
  surpriseTimer = setTimeout(() => {
    const paragraphs = [...document.querySelectorAll('.column p:not(.italic), .center-story p, .lower-news p')];
    const visible = paragraphs.filter(p => {
      const r = p.getBoundingClientRect();
      return !activeSurprises.has(p) && r.bottom>40 && r.top<innerHeight-40;
    });
    if (visible.length && activeSurprises.size < 3) {
      const paragraph = visible[Math.floor(Math.random()*visible.length)];
      const surprise = hauntWords(paragraph, newspaper);
      if (surprise) {
        activeSurprises.set(paragraph, surprise);
        surprise.finished.then(() => {
          if (activeSurprises.get(paragraph) === surprise) activeSurprises.delete(paragraph);
        });
      }
    }
    scheduleSurprise();
  }, delay);
}
function stopSurprise() {
  clearTimeout(surpriseTimer);
  for (const surprise of activeSurprises.values()) surprise.cancel();
  activeSurprises.clear();
}
document.addEventListener('visibilitychange', () => {
  stopSurprise();
  if (!document.hidden) scheduleSurprise();
});
window.addEventListener('resize', () => { stopSurprise(); scheduleSurprise(); });
// Normal playback owns the screen until its Promise resolves.
dialog.addEventListener('cancel', event => event.preventDefault());
enter.addEventListener('click', async () => {
  if (playing) return;
  playing = true; stopSurprise();
  enter.disabled = true; newspaper.inert = true;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.showModal();
  try {
    await playScene(document.querySelector('#scene-stage'), { reducedMotion: motionOff || preference.matches });
    document.querySelector('#announcement').textContent = 'The moment has passed. You are back at the newspaper.';
  } catch (error) {
    console.error('Scene could not finish:',error);
    document.querySelector('#announcement').textContent = 'The scene could not finish. You are back at the newspaper; you can try again.';
  } finally {
    dialog.close(); newspaper.inert = false; enter.disabled = false; playing = false;
    document.body.style.overflow = overflow;
    enter.focus({preventScroll:true}); scheduleSurprise();
  }
});
updateMotion();

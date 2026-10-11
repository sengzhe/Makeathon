/**
 * S4 frame assembly: picks the field set, builds the camera (run bob, aim view,
 * recoil shake, hit jolt), composites L0–L7 through the selective-colour pass,
 * then adds L8 screen FX and L9 subtitles.
 * Usage: const frame = createDirector(env); frame.render(ctx, t);
 */
import {clamp} from '../kit.js';
import {project, speedAt, bob, bobAmp, shake, cameraMatrix} from './camera.js';
import {SHOTS, SMOKE, shotTimes, hitTime} from './timeline.js';
import {drawForeground, aimView, sleeveReveal, lastFire} from './foreground.js';
import {flareLevel, flarePos} from './field-c.js';
import {smokeWipe, hitFlash, flareLight, fieldVignette, subtitle, cue} from './screen.js';

/** Subtitle cues (TX-07); off-screen voices in italics. Times may depend on shots. */
function subtitles(ctx, t, f) {
  subtitle(ctx, 'Mom… Mom…', cue(t, 4.4, 7.4), {italic: true});
  const gun = f.shots[0].fire + 2;
  subtitle(ctx, 'Gun’s down! MOVE!', cue(t, gun, gun + 2.2), {italic: true});
  subtitle(ctx, 'For Karl — come home soon', cue(t, 72.3, 74.9));
}

export function createDirector({art, comp, sets, sleeve, reducedMotion}) {
  /** Shared per-frame world state handed to the set renderers. */
  function frameState(t, plan, clicks) {
    const s = plan.at(t), shots = SHOTS.map((_, i) => shotTimes(i, clicks));
    const f = {t, wt: s.wt, d: s.d, step: s.step, plan, clicks, shots, hit: hitTime(clicks), eye: 1.6};
    f.project = (z, X) => project(z, X, f.eye);
    return f;
  }
  const setFor = t => (t < SMOKE[0] ? sets.A : t < SMOKE[1] ? sets.B : sets.C);

  /** Camera matrix for L0–L6 and the lagged L7 bob. */
  function camera(f, set, view) {
    const t = f.t, injured = t >= f.hit, amp = bobAmp(speedAt(f.plan, t), reducedMotion);
    const head = bob(f.step, amp, injured), lag = bob(f.plan.at(t - 2 / 24).step, amp, injured, 1.3);
    const fire = lastFire(t, f.clicks), motion = reducedMotion ? 0 : 1;
    const kick = shake(t, fire, 4 / 24, 6 * motion, 3);
    const jolt = motion * 20 * clamp(1 - (t - f.hit) / .3) * (t >= f.hit ? 1 : 0);
    const aim = aimView(t, f.wt, f.clicks, set.target(f), reducedMotion);
    const matrix = cameraMatrix({bobX: head.x + kick.x + jolt, bobY: head.y + kick.y, roll: head.roll, tilt: view.tilt, aim});
    return {matrix, lag};
  }

  /** Render the full frame at scene time t into the output context. */
  function render(ctx, t, plan, clicks) {
    const f = frameState(t, plan, clicks), set = setFor(t), view = set.view(f);
    f.eye = view.eye;
    const {matrix, lag} = camera(f, set, view);
    comp.begin(matrix);
    set.render(comp, f);
    comp.setMatrix(new DOMMatrix());
    if (set === sets.B) sets.B.photo(comp, f, lag.y);
    const st = drawForeground(comp, art, t, clicks, lag, reducedMotion);
    const reveal = sleeveReveal(t, f.hit, st), bloom = clamp((t - f.hit) / 2);
    const sleeveAt = {reveal, bloom: t >= f.hit ? bloom : 0, x: lag.x, y: lag.y};
    comp.draw(c => sleeve.draw(c, 'sleeve', sleeveAt));
    comp.draw(c => sleeve.draw(c, 'blood', sleeveAt), true);
    comp.finish(ctx);
    const light = t >= SMOKE[1] ? flareLevel(t) : 0;
    if (light > 0) { const p = matrix.transformPoint(flarePos(t)); flareLight(ctx, light, p.x, p.y); }
    hitFlash(ctx, t, f.hit, reducedMotion);
    fieldVignette(ctx, st.mode === 'sight' ? .3 : .5);
    for (const at of SMOKE) smokeWipe(ctx, art.smokeWipe, t, at, reducedMotion);
    subtitles(ctx, t, f);
    return f;
  }
  return {render};
}

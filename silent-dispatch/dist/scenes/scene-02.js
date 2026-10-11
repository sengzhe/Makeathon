/**
 * S2 The House — local 0:00–0:40, production script Scene 2 (HD-08, no hands).
 * 0:00–0:04 Scene 1's crate/cup framing; push to the rim; one ash flake marks it at 0:02.
 * 0:04–0:24 scripted head turn over BG-01: rise, 8 degree roof tilt (0:06–0:08.5), left to
 *           the photo and horse, right past the calendar and curtain to the wall gap.
 * 0:24–0:40 hold on the gap: SP-13 kneels at three PR-24 markers; goal = gaze 2 s.
 * Interior keeps the warm grade; everything through the roof and wall gap is blue-grey.
 * The player owns time, input and transitions. No audio assets exist yet (AU-02/05/06/19).
 */
import {W, H, clamp, progress, loadArt, surface, vignette, drawSprite} from './kit.js';
import {createCamera, pointerToCanvas, L3, L5, START_PAN, GAP_PAN} from './s02/camera.js';
import {buildGradedPanorama, buildBurial, drawPanorama, drawBeam, drawAsh, drawTableAsh, drawBurial, drawSmoke} from './s02/kitchen.js';
import {drawCrateGroup, buildPhotoCard, buildCalendarCard, WALL_PROPS, drawWallProp, drawCurtain, drawHorseFlake} from './s02/props.js';
import {createFocus, drawFocus} from './s02/focus.js';

export const assets = {
  pano: 'backgrounds/BG-01_kitchen-panorama_color_v1.png',
  mask: 'scene-02/BG-01_kitchen-panorama_exterior-mask_v1.png',
  crate: 'props/PR-04_crate_v1.png',
  helmet: 'props/PR-07_m1_helmet_upside_down_v1.png',
  ration: 'scene-01/PR-03-ration-tin-spoon-v1.png',
  cup: 'props/PR-05_tin_cup_upright_v1.png',
  photo: 'props/PR-08_family_photo_intact_v1.png',
  horse: 'props/PR-09_wooden_horse_v1.png',
  calendar: 'props/PR-10_calendar_intact_v1.png',
  curtain: 'props/PR-23_lace_curtain_v1.png',
  marker1: 'props/PR-24_grave_marker_01_v1.png',
  marker2: 'props/PR-24_grave_marker_02_v1.png',
  marker3: 'props/PR-24_grave_marker_03_v1.png',
  gi: 'characters/SP-13_humming-gi_rig-body_v1.png',
  giHead: 'characters/SP-13_humming-gi_rig-head_v1.png',
  smoke: 'effects/FX-07_smoke-loop-01_v1.png',
};
const DURATION = 40, GAP_EDGE = 2470;

export async function mountScene({root, assetBase, reducedMotion = false, signal, handoff}) {
  const art = await loadArt(assets, assetBase, signal);
  const canvas = surface(), frame = surface();
  const ctx = canvas.getContext('2d'), c = frame.getContext('2d');
  if (!ctx || !c) throw new Error('Scene 2 requires Canvas 2D');
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'The house. A tin cup on a crate, then a ruined kitchen: a family photo, a broken toy horse, a calendar stopped in November 1944, and a soldier kneeling at three graves beyond the broken wall.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#080807;';
  root.append(canvas);
  const graded = buildGradedPanorama(art.pano, art.mask), burial = buildBurial(art);
  const cards = {photo: buildPhotoCard(art.photo), calendar: buildCalendarCard(art.calendar), horse: art.horse};
  const cam = createCamera({reducedMotion}), focus = createFocus();
  let disposed = false, lastTime = 0, goalTime = null;

  /** Glow strength for hoverable objects: on while panning (0:04–0:24), until used. */
  const glow = (t, id) => focus.used(id) ? 0
    : progress(t, 4, 4.6) * (1 - progress(t, 23.4, 24)) * (reducedMotion ? .85 : .75 + .25 * Math.sin(t * 2.1));

  /** Draw a hoverable object card centred at (x, y); the horse keeps its landed flake. */
  function drawObject(target, id, x, y, w, elapsed = -1) {
    drawSprite(target, cards[id], x, y, w);
    if (id !== 'horse' || elapsed < .6) return;
    const s = w / art.horse.width;
    target.save(); target.translate(x - w / 2, y - s * art.horse.height / 2); target.scale(s, s);
    drawHorseFlake(target, progress(elapsed, .6, 2)); target.restore();
  }
  /** Panorama layer (L3): set, exterior, wall props, beam and ash. */
  function drawWorld(t) {
    const speed = reducedMotion ? .5 : 1;
    cam.layer(c, L3);
    drawPanorama(c, graded);
    drawSmoke(c, t, art.smoke, reducedMotion);
    drawAsh(c, t, {x: GAP_EDGE, y: 0, w: 1730, h: 1000, count: 80, colour: '206,210,216', seed: 1, speed});
    drawBurial(c, t, burial, reducedMotion);
    drawCurtain(c, art.curtain);
    for (const id of ['photo', 'calendar', 'horse']) {
      const spec = WALL_PROPS[id], g = glow(t, id);
      if (g > 0) drawWallProp(c, cards[id], spec, g);
      else drawObject(c, id, spec.x, spec.y, spec.w, focus.used(id) ? Infinity : -1);
    }
    drawBeam(c, t, reducedMotion);
    drawAsh(c, t, {x: 980, y: 0, w: 1400, h: 960, count: 46, colour: '118,112,104', seed: 2, speed});
    drawTableAsh(c, t);
  }
  /** Hover targets: glowing objects currently inside the frame, in screen pixels. */
  function targets(t) {
    return Object.entries(WALL_PROPS).filter(([id]) => glow(t, id) > .2).map(([id, spec]) => {
      const p = cam.toScreen(spec.x, spec.y), w = spec.w * p.s, h = w * cards[id].height / cards[id].width;
      return {id, from: {x: p.x, y: p.y, w, h}, rect: {x: p.x - w / 2 - 24, y: p.y - h / 2 - 24, w: w + 48, h: h + 48}};
    }).filter(({rect}) => rect.x + rect.w > 0 && rect.x < W && rect.y + rect.h > 0 && rect.y < H);
  }
  function render({time = 0, delta = 0, pointer = {x: 0, y: 0}, state} = {}) {
    if (disposed || signal?.aborted) return;
    const t = clamp(time, 0, DURATION); lastTime = t;
    cam.update(t, delta, pointer);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    drawWorld(t);
    // HD-08 crate group (L5) leaves through the bottom edge as the head rises.
    if (t < 9 || cam.state.y > 250) {cam.layer(c, L5, {origin: 'fg'}); drawCrateGroup(c, t, art, reducedMotion);}
    c.setTransform(1, 0, 0, 1, 0, 0);
    vignette(c, .42);
    const point = pointerToCanvas(pointer, canvas);
    const active = focus.update(t, delta, pointer, point, targets(t));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (active) drawFocus(ctx, frame, t, active, WALL_PROPS[active.id], (target, x, y, w, e) => drawObject(target, active.id, x, y, w, e), reducedMotion);
    else ctx.drawImage(frame, 0, 0);
    goalTime = focus.updateGaze(t, delta, pointer, point, cam.toScreen(GAP_EDGE, 0).x);
    // Goal met: the humming carries 1 s, then the player may advance (shared hook, see report).
    if (state && goalTime !== null) {state.s2GoalTime = goalTime; if (t >= goalTime + 1) state.requestAdvance = true;}
  }
  return {
    render,
    // Scene 3 opens in the same kitchen, facing the gap, cup still upright with its ash mark.
    getHandoff: () => ({...handoff, location: 'kitchen-gap', palette: 'warm-interior-cold-exterior',
      panX: cam.state.p, panStart: START_PAN, panGap: GAP_PAN, cameraY: cam.state.y, cup: 'upright',
      cupAshMark: lastTime >= 2, photo: 'on-wall', calendar: 'on-nail', burial: 'sp13-kneeling',
      gazeGoal: goalTime !== null, sceneTime: lastTime}),
    dispose() {disposed = true; canvas.remove(); frame.width = 0; graded.width = 0;},
  };
}

/**
 * S3 The Mortar — local 0:00–0:20, production script Scene 3 (HD-06, HD-09, HD-10).
 * 0:00 gap view, SP-13 looks up · 0:00.8 T-FLASH · 0:01.0–1.4 frozen debris ·
 * 0:01.4–2.5 burst, 30 px shake, FX-22 drain to 15% · 0:02.5 smoke rolls in ·
 * 0:03 whip pan to the crate, cup spills, pickup behind dust · 0:04 rise and pocket
 * insert · 0:05 whip pan to the doorway, low rifle, photo face down · 0:05.5 run,
 * doorway dark 4 frames · 0:06 yard · 0:08–11 collapse dust · 0:12.4 a GI falls ·
 * 0:18 smoke builds for the player's T-SMOKE. Clicks are ignored (no onAction).
 * No audio assets exist yet; sound cues are carried only by timing.
 */
import {W, H, clamp, lerp, progress, surface, loadArt, vignette} from './kit.js';
import {present, whipSmear, veil, feather} from './s03/common.js';
import {kitchenCamera, applyCamera, kitchenWorld, doorwayDark} from './s03/kitchen.js';
import {blastGlow, blastPoint, flashOverlay, debris, calendar, glint, ash, plaster, smokeIn, muffle} from './s03/blast.js';
import {crateGroup, crateDust, floorPhoto, pocketInsert, rifle} from './s03/props.js';
import {yardCamera, yardWorld, yardGlow, yardOverlay} from './s03/yard.js';

export const assets = {
  sky: 'backgrounds/BG-01_kitchen_L0-sky_v1.png',
  field: 'backgrounds/BG-01_kitchen_L1-L2-field-smoke_v1.png',
  walls: 'backgrounds/BG-01_kitchen_L3-walls_v2.png',
  heap: 'backgrounds/BG-01_kitchen_L5-brick-heap_v1.png',
  yard: 'backgrounds/BG-02_farmyard_v2.png',
  gi: 'characters/SP-13_humming-gi_rig-body_v1.png',
  head: 'characters/SP-13_humming-gi_rig-head_v1.png',
  gi1: 'characters/SP-01_us-rifleman-01_run_v2.png',
  gi2: 'characters/SP-01_us-rifleman-02_run_v1.png',
  fall: 'characters/SP-01_us-rifleman-01_fall_v1.png',
  body: 'characters/SP-10_body-us-03_v1.png',
  sgtBody: 'characters/SP-02_sergeant_rig-body_v1.png',
  sgtArm: 'characters/SP-02_sergeant_rig-arm_v1.png',
  marker: 'props/PR-24_grave_marker_01_v1.png',
  calendar: 'props/PR-10_calendar_torn_v1.png',
  crate: 'props/PR-04_crate_v1.png',
  ration: 'scene-01/PR-03-ration-tin-spoon-v1.png',
  helmet: 'props/PR-07_m1_helmet_upside_down_v1.png',
  cupUp: 'props/PR-05_tin_cup_upright_v1.png',
  cupTip: 'props/PR-05_tin_cup_tipped_v1.png',
  cupSpill: 'props/PR-05_tin_cup_spilled_v1.png',
  photo: 'props/PR-08_family_photo_shattered_v1.png',
  chest: 'props/PR-14_jacket-chest_dusty_v1.png',
  letter: 'annies-letter-v1.png',
  press: 'hands/HD-K4_hand-left-flat-press_v2.png',
  post1: 'props/PR-17_fence_post_01_v1.png',
  post2: 'props/PR-17_fence_post_02_v1.png',
  cart: 'props/PR-25_broken_cart_v1.png',
  crater: 'props/PR-20_crater_bowl_01_v1.png',
  rifle: 'hands/HD-K1_rifle-carry_v1.png',
  flash: 'effects/FX-04_mortar-flash_v1.png',
  plaster: 'effects/FX-05_plaster-rain_v1.png',
  column: 'effects/FX-07_smoke-loop-01_v1.png',
  smoke: 'effects/FX-08_smoke-wipe_v1.png',
  fire: 'effects/FX-09_fire-medium_v1.png',
  splash: 'effects/FX-11_mud-splash_v1.png',
  debris: 'effects/FX-21_frozen-debris-cluster_v1.png',
  dust: 'effects/FX-28_dust-surge_v1.png',
};
const DURATION = 20, DRAIN = .15;

export async function mountScene({root, assetBase, reducedMotion = false, signal, handoff}) {
  const art = await loadArt(assets, assetBase, signal);
  for (const key of ['smoke', 'dust', 'column']) art[key] = feather(art[key]);
  const canvas = surface(), world = surface(), fore = surface(), mask = surface(), scratch = surface();
  const ctx = canvas.getContext('2d'), wc = world.getContext('2d'), fc = fore.getContext('2d');
  if (!ctx || !wc || !fc) throw new Error('Scene 3 requires Canvas 2D');
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-label', 'The Mortar. A shell lands outside the broken kitchen wall; Tommy runs out into the farmyard.');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#080807;';
  root.append(canvas);
  let disposed = false, lastTime = 0;

  /** Saturation and the shrinking colour blob of the FX-22 drain at time t. */
  function drainState(t, cam) {
    if (t < 1.4) return {sat: 1, keep: null};
    if (t >= 2.5) return {sat: DRAIN, keep: null};
    const b = blastPoint(cam);
    return {sat: DRAIN, keep: {x: b.x + cam.sx, y: b.y + cam.sy, r: lerp(2300, 0, progress(t, 1.4, 2.5)), seed: t * 3}};
  }

  /** Foreground L6–L7 for the kitchen: smoke, plaster, dust, frozen debris, rifle. */
  function kitchenFore(t, cam) {
    fc.clearRect(0, 0, W, H);
    fc.save(); applyCamera(fc, cam);
    smokeIn(fc, t, art, cam); plaster(fc, t, art, cam); crateDust(fc, t, art, cam);
    fc.restore();
    ash(fc, t, cam, reducedMotion); calendar(fc, t, art); debris(fc, t, art, reducedMotion); glint(fc, t);
    if (t >= 4.75) rifle(fc, t, art, 5.5, reducedMotion, progress(t, 4.75, 5.15));
  }

  /** Screen-space whip-pan smear amount (FX-30) for the two pans. */
  function whip(t) {
    if (reducedMotion) return 0;
    const pan = (a) => (t > a && t < a + .4 ? Math.sin((t - a) / .4 * Math.PI) * 110 : 0);
    return pan(3) + pan(5);
  }

  /** Kitchen frame 0:00–0:06, including the pocket insert cut. */
  function kitchenFrame(t) {
    const cam = kitchenCamera(t, reducedMotion);
    wc.clearRect(0, 0, W, H); ctx.clearRect(0, 0, W, H);
    if (t >= 4.15 && t < 4.75) {
      pocketInsert(wc, t, art, reducedMotion);
      present(ctx, world, mask, DRAIN); vignette(ctx, .45, '10,10,8');
      return;
    }
    wc.save(); applyCamera(wc, cam);
    kitchenWorld(wc, t, art, cam); floorPhoto(wc, art, cam); crateGroup(wc, t, art, cam);
    wc.restore();
    const {sat, keep} = drainState(t, cam);
    present(ctx, world, mask, sat, keep);
    ctx.save(); applyCamera(ctx, cam);
    blastGlow(ctx, t, art, cam, reducedMotion); crateGroup(ctx, t, art, cam, 'colour');
    ctx.restore();
    kitchenFore(t, cam);
    present(ctx, fore, mask, t < 1.4 ? 1 : lerp(1, DRAIN, progress(t, 1.4, 2.5)));
    whipSmear(ctx, scratch, whip(t));
    muffle(ctx, t); vignette(ctx, .42, '14,10,6');
    flashOverlay(ctx, t, reducedMotion);
    veil(ctx, '#050505', doorwayDark(t));
  }

  /** Yard frame 0:06–0:20. */
  function yardFrame(t) {
    const cam = yardCamera(t, reducedMotion);
    wc.clearRect(0, 0, W, H); ctx.clearRect(0, 0, W, H); fc.clearRect(0, 0, W, H);
    wc.save(); applyCamera(wc, cam); yardWorld(wc, t, art); wc.restore();
    present(ctx, world, mask, DRAIN);
    ctx.save(); applyCamera(ctx, cam); yardGlow(ctx, t, art, reducedMotion); ctx.restore();
    rifle(fc, t, art, 5.5, reducedMotion);
    fc.save(); applyCamera(fc, cam); yardOverlay(fc, t, art); fc.restore();
    present(ctx, fore, mask, DRAIN);
    vignette(ctx, .4, '12,12,10');
    veil(ctx, '#050505', 1 - progress(t, 6, 6.16));
  }

  function render({time = 0} = {}) {
    if (disposed || signal?.aborted) return;
    const t = clamp(time, 0, DURATION); lastTime = t;
    if (t < 6) kitchenFrame(t); else yardFrame(t);
  }

  return {
    render,
    // Scene 4 opens on Field A mid-run: drained palette, low rifle, letter secured.
    getHandoff: () => ({...handoff, location: 'field-a', palette: 'drained', saturation: DRAIN, carry: 'low-rifle',
      running: true, speed: 6, letter: 'secured', leftPalm: 'bandaged', cup: 'spilled', sceneTime: lastTime}),
    dispose() { disposed = true; canvas.remove(); for (const s of [world, fore, mask, scratch]) s.width = 0; },
  };
}

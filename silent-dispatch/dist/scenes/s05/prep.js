/**
 * S5 asset map and one-off preparation (grades, blur, star isolation).
 * Everything here runs once at mount, so per-frame work stays to transforms and blits.
 */
import {surface} from '../kit.js';

/** Highest-version masters only; nothing from production/superseded. */
export const assets = {
  field: 'backgrounds/BG-05_field-c_color_v1.png',
  plate: 'backgrounds/BG-06_ground_plate-no-blade_v1.png',
  rifle: 'hands/HD-K1_rifle-carry_v1.png',
  hand: 'hands/HD-K4_hand-left-flat-press_v2.png',
  stain: 'effects/FX-23_sleeve-blood_03-full_v1.png',
  chest: 'props/PR-14_jacket-chest_secured_v1.png',
  chestOut: 'props/PR-14_jacket-chest_letter-half-out_v2.png',
  letter: 'props/PR-02_annies-letter_open-blank-text_v1.png',
  letterRun: 'props/PR-02_annies-letter_crayon-run_v1.png',
  streams: 'effects/FX-26_crayon-run-streams_v1.png',
  grenadeAir: 'props/PR-13_stick_grenade_tumble_source_v1.png',
  grenade: 'props/PR-13_stick_grenade_landed_v1.png',
  splash: 'effects/FX-11_mud-splash_v1.png',
  medic: 'characters/SP-07_medic_closeup-face_v2.png',
};

/**
 * Copy an image into a canvas through a CSS filter string.
 * @param img source image; @param filter canvas filter; @param scale output size factor.
 * @returns canvas holding the graded copy.
 */
export function graded(img, filter = 'none', scale = 1) {
  const canvas = surface(Math.round(img.width * scale), Math.round(img.height * scale));
  const c = canvas.getContext('2d');
  c.filter = filter; c.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * HD-K4 contact hand with the FX-23 stain bled into the jacket sleeve only.
 * The hand keeps a muted outdoor grade; the stain keeps its red (selective colour).
 */
function stainedHand(art) {
  const canvas = graded(art.hand, 'saturate(.42) brightness(.9)');
  const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  const sleeve = surface(w, h), s = sleeve.getContext('2d');
  s.drawImage(art.hand, 0, 0);
  // Below the knit cuff only: the bandaged palm stays clean of the forearm wound.
  s.globalCompositeOperation = 'source-in';
  s.beginPath(); s.moveTo(0, h * .66); s.lineTo(w * .62, h * .74); s.lineTo(w, h); s.lineTo(0, h); s.closePath();
  s.save(); s.clip(); s.drawImage(art.stain, -w * .1, h * .64, w * 1.05, w * .95 * art.stain.height / art.stain.width); s.restore();
  s.globalCompositeOperation = 'destination-in';
  s.beginPath(); s.moveTo(0, h * .66); s.lineTo(w * .62, h * .74); s.lineTo(w, h); s.lineTo(0, h); s.closePath(); s.fill();
  c.globalAlpha = .62; c.globalCompositeOperation = 'multiply'; c.filter = 'saturate(.7)'; c.drawImage(sleeve, 0, 0);
  return canvas;
}

/** Yellow wax only, keyed from the crayon-run letter; used to keep the star in colour at the end. */
function starOnly(img) {
  const canvas = graded(img), c = canvas.getContext('2d');
  const pixels = c.getImageData(0, 0, canvas.width, canvas.height), d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    const p = i / 4, x = p % canvas.width / canvas.width, y = Math.floor(p / canvas.width) / canvas.height;
    const yellow = d[i] > 175 && d[i + 1] > 125 && d[i] - d[i + 2] > 95 && x > .55 && y < .42;
    if (!yellow) d[i + 3] = 0;
  }
  c.putImageData(pixels, 0, 0);
  return canvas;
}

/**
 * Prepare graded and derived surfaces once.
 * @returns {object} canvases keyed by role.
 */
export function prepare(art, reducedMotion) {
  return {
    rifle: graded(art.rifle, 'saturate(.25) brightness(.82)'),
    chest: graded(art.chest, 'saturate(.35) brightness(.78)'),
    hand: stainedHand(art),
    star: starOnly(art.letterRun),
  };
}

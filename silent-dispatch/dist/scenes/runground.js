/**
 * Shared 2.5D run ground: a perspective ground plane that streams toward the
 * camera with distance travelled, built from a crop of an existing plate.
 * Usage: const g = createRunGround(img, {sy, sh}); g.draw(ctx, distance, {horizon, fog});
 * Deterministic in distance, so review seeking reproduces frames.
 */
import {W, H, surface} from './kit.js';

const Z0 = 5, Y0 = 1010, BAND = 3, METRES_PER_TILE = 6;

/**
 * Build a vertically seamless texture from the source rows [sy, sy+sh) of img:
 * the crop followed by its mirror, repeated three times across (mirrored) so far
 * rows never run out of width.
 */
function buildTexture(img, sy, sh) {
  const tw = img.width, tex = surface(tw * 3, sh * 2), c = tex.getContext('2d');
  for (let i = 0; i < 3; i++) {
    c.save(); c.translate(i * tw + (i % 2 ? tw : 0), 0); if (i % 2) c.scale(-1, 1);
    c.drawImage(img, 0, sy, tw, sh, 0, 0, tw, sh);
    c.translate(0, sh * 2); c.scale(1, -1);
    c.drawImage(img, 0, sy, tw, sh, 0, 0, tw, sh);
    c.restore();
  }
  return tex;
}

/**
 * Create a run ground from img. opts.sy/sh pick the source rows (mud near the
 * camera); opts.fog is the haze colour at the horizon.
 */
export function createRunGround(img, {sy = img.height * .62, sh = img.height * .38, fog = '150,150,146'} = {}) {
  const tex = buildTexture(img, Math.round(sy), Math.round(sh));
  const th = tex.height, tw = tex.width, pxPerMetre = th / METRES_PER_TILE;

  /**
   * Draw the ground below horizon for distance travelled d (metres). Each band of
   * BAND rows samples the texture at depth z = Z0*(Y0-horizon)/(y-horizon), so
   * detail grows and streams toward the camera as d increases.
   */
  function draw(c, d, {horizon = 430, fogDepth = 60, top = horizon + 2} = {}) {
    for (let y = Math.max(top, horizon + 2); y < H + 60; y += BAND) {
      const z = Z0 * (Y0 - horizon) / (y + BAND / 2 - horizon);
      const span = Math.min(tw - 4, W * z / Z0 * 1.15);
      const v = (((z + d) * pxPerMetre) % th + th) % th;
      c.drawImage(tex, (tw - span) / 2, Math.min(v, th - 2), span, 1, -60, y, W + 120, BAND + 1);
    }
    // Depth haze from the ground's top edge, so the far seam blends into the plate.
    const y0 = Math.max(top, horizon + 2), g = c.createLinearGradient(0, y0, 0, y0 + 260);
    g.addColorStop(0, `rgba(${fog},.75)`); g.addColorStop(1, `rgba(${fog},0)`);
    c.fillStyle = g; c.fillRect(-60, y0, W + 120, 260);
  }
  return {draw, texture: tex};
}

/** Screen placement of world point (z metres ahead, X px at Z0) on a ground with this horizon. */
export function place(z, X, horizon = 430) {
  const s = Z0 / Math.max(z, .05);
  return {s, x: W / 2 + X * s, y: horizon + (Y0 - horizon) * s};
}

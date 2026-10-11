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
function buildTexture(img, sy, sh, blur) {
  const tw = img.width, tex = surface(tw * 3, sh * 2), c = tex.getContext('2d');
  // One soft blur at build time hides texel blocks when near rows are magnified.
  c.filter = `blur(${blur}px)`; c.imageSmoothingQuality = 'high';
  for (let i = 0; i < 3; i++) {
    c.save(); c.translate(i * tw + (i % 2 ? tw : 0), 0); if (i % 2) c.scale(-1, 1);
    c.drawImage(img, 0, sy, tw, sh, 0, 0, tw, sh);
    c.translate(0, sh * 2); c.scale(1, -1);
    c.drawImage(img, 0, sy, tw, sh, 0, 0, tw, sh);
    c.restore();
  }
  return tex;
}

/** Successively halved copies of tex (levels 0..3) for distance filtering. */
function buildMips(tex) {
  const mips = [tex];
  for (let i = 1; i < 4; i++) {
    const p = mips[i - 1], m = surface(Math.max(1, p.width >> 1), Math.max(1, p.height >> 1)), c = m.getContext('2d');
    c.imageSmoothingQuality = 'high'; c.drawImage(p, 0, 0, m.width, m.height);
    mips.push(m);
  }
  return mips;
}

/**
 * Create a run ground from img. opts.sy/sh pick the source rows (mud near the
 * camera); opts.fog is the haze colour at the horizon.
 */
export function createRunGround(img, {sy = img.height * .62, sh = img.height * .38, fog = '150,150,146', blur = 1.2} = {}) {
  const tex = buildTexture(img, Math.round(sy), Math.round(sh), blur), mips = buildMips(tex);
  const th = tex.height, tw = tex.width, pxPerMetre = th / METRES_PER_TILE;

  /**
   * Draw the ground below horizon for distance travelled d (metres). Each band of
   * BAND rows samples the texture at depth z = Z0*(Y0-horizon)/(y-horizon), so
   * detail grows and streams toward the camera as d increases.
   */
  function draw(c, d, {horizon = 430, fogDepth = 60, top = horizon + 2, eye = 1, feather = 0} = {}) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    const y0 = Math.max(top, horizon + 2), alpha = c.globalAlpha;
    for (let y = y0; y < H + 60; y += BAND) {
      // Optional soft top edge so the plane blends into the plate above it.
      c.globalAlpha = alpha * (feather > 0 ? Math.min(1, (y - y0) / feather) : 1);
      const z = Z0 * (Y0 - horizon) * eye / (y + BAND / 2 - horizon);
      const span = Math.min(tw - 4, W * z / Z0 * 1.15);
      const v = (((z + d) * pxPerMetre) % th + th) % th;
      // Texels per screen pixel picks a pre-filtered level, so far rows do not shimmer.
      const rate = Math.max(z * z / (Z0 * (Y0 - horizon) * eye) * pxPerMetre, span / (W + 120));
      const lv = Math.max(0, Math.min(3, Math.floor(Math.log2(rate)))), m = mips[lv], k = 1 / (1 << lv);
      c.drawImage(m, (tw - span) / 2 * k, Math.min(v * k, m.height - 1), span * k, 1, -60, y, W + 120, BAND + 1);
    }
    c.globalAlpha = alpha;
    // Depth haze from the ground's top edge, so the far seam blends into the plate.
    const g = c.createLinearGradient(0, y0, 0, y0 + 260);
    g.addColorStop(0, `rgba(${fog},${feather > 0 ? 0 : .75})`);
    if (feather > 0) g.addColorStop(Math.min(.9, feather / 260), `rgba(${fog},.6)`);
    g.addColorStop(1, `rgba(${fog},0)`);
    c.fillStyle = g; c.fillRect(-60, y0, W + 120, 260);
  }
  return {draw, texture: tex};
}

/** Screen placement of world point (z metres ahead, X px at Z0) on a ground with this horizon. */
export function place(z, X, horizon = 430) {
  const s = Z0 / Math.max(z, .05);
  return {s, x: W / 2 + X * s, y: horizon + (Y0 - horizon) * s};
}

/**
 * Shared scene toolkit for scenes 2-6. Pure helpers; no player state.
 * Usage: import {loadArt, surface, progress, lerp, drawSprite} from './kit.js';
 */
export const W = 1920, H = 1080;
export const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
/** Eased 0..1 progress of time t across the window [a, b]. */
export const progress = (t, a, b) => ease((t - a) / (b - a));
export const lerp = (a, b, n) => a + (b - a) * n;
/** Deterministic pseudo-random in [0, 1) for seed i; keeps frames stable when seeking. */
export const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Create an offscreen canvas of the given size. */
export function surface(w = W, h = H) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return canvas;
}

/** Load one image relative to assetBase; rejects with AbortError when signal aborts. */
export function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Scene cancelled', 'AbortError'));
    const image = new Image();
    const cleanup = () => { image.onload = image.onerror = null; signal?.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); image.src = ''; reject(new DOMException('Scene cancelled', 'AbortError')); };
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error(`Asset could not load: ${url}`)); };
    signal?.addEventListener('abort', abort, {once: true});
    image.src = url;
  });
}

/** Load a {key: path} map in parallel; returns {key: HTMLImageElement}. */
export async function loadArt(assets, assetBase, signal) {
  const entries = await Promise.all(Object.entries(assets).map(async ([key, path]) =>
    [key, await loadImage(new URL(path, assetBase).href, signal)]));
  if (signal?.aborted) throw new DOMException('Scene cancelled', 'AbortError');
  return Object.fromEntries(entries);
}

/**
 * Draw an image centred at (x, y) with width w (height keeps aspect), rotation r (radians),
 * opacity a and optional horizontal flip. Optional crop {sx, sy, sw, sh} in source pixels.
 */
export function drawSprite(ctx, img, x, y, w, {r = 0, a = 1, flip = false, crop} = {}) {
  const sx = crop?.sx ?? 0, sy = crop?.sy ?? 0, sw = crop?.sw ?? img.width, sh = crop?.sh ?? img.height;
  const h = w * sh / sw;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(r);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Fill the frame with an image using cover fit, offset by pan (-1..1) and zoom (>=1). */
export function drawCover(ctx, img, {panX = 0, panY = 0, zoom = 1, a = 1} = {}) {
  const s = Math.max(W / img.width, H / img.height) * zoom;
  const w = img.width * s, h = img.height * s;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.drawImage(img, (W - w) / 2 * (1 + panX), (H - h) / 2 * (1 + panY), w, h);
  ctx.restore();
}

/** Radial vignette over the full frame; strength 0..1. */
export function vignette(ctx, strength = .45, color = '20,13,6') {
  const g = ctx.createRadialGradient(W / 2, H * .48, H / 3, W / 2, H / 2, W * .6);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/**
 * S4 backdrop plates (L0–L3): a cover-fit image whose horizon row sits on the
 * ground-plane horizon, zoomed about the vanishing point as the run advances.
 */
import {W, H} from '../kit.js';
import {HORIZON} from './camera.js';

/**
 * Draw img so that source row horizon*height lands on HORIZON. zoom >= 1 grows
 * the plate about the vanishing point; the top rows are stretched upward so a
 * tilted or bobbing camera never exposes an edge.
 */
export function backdrop(c, img, {horizon = .45, zoom = 1, margin = 1.18, a = 1} = {}) {
  const s = Math.max(W / img.width, H / img.height) * margin * zoom;
  const w = img.width * s, h = img.height * s;
  const x = W / 2 - w / 2, y = HORIZON - horizon * h;
  c.save(); c.globalAlpha *= a;
  c.drawImage(img, x, y, w, h);
  if (y > -400) c.drawImage(img, 0, 0, img.width, 3, x, y - 900, w, 902);
  if (y + h < H + 400) c.drawImage(img, 0, img.height - 3, img.width, 3, x, y + h - 2, w, 900);
  c.restore();
}

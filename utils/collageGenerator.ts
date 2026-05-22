/**
 * Collage Generator - exports final collage image
 *
 * Applies per-slot edits (rotation/scale/offset/filter) and collage-wide
 * style (background, gap, corner radius, padding) so the exported image
 * matches the preview.
 */

import { CollageTemplate } from './templates';
import {
  PhotoEdits,
  DEFAULT_EDITS,
  CollageStyle,
  DEFAULT_STYLE,
  editsToCssFilter,
} from './photoEdits';

interface PhotoData {
  file: File;
  previewUrl: string;
}

const EXPORT_WIDTH = 2000;
// Reference width used in the editor preview (Tailwind max-w-md ≈ 448px).
// Style values (gap, padding, radius) are scaled by EXPORT_WIDTH / REFERENCE_WIDTH.
const REFERENCE_WIDTH = 448;

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Draw a rounded-rect path on the given context.
 * Falls back gracefully when CanvasRenderingContext2D.roundRect is unavailable.
 */
function pathRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (typeof (ctx as CanvasRenderingContext2D & { roundRect?: unknown }).roundRect === 'function') {
    (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void })
      .roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * Draw an image into a slot, replicating the CSS pipeline used in the editor:
 *   1. cover-fit the image to slot dimensions
 *   2. translate by (offsetX%, offsetY%) of the slot box
 *   3. scale around the slot center
 *   4. rotate around the slot center
 *   5. apply the CSS filter (presets + brightness/contrast/saturate/blur)
 */
function drawSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  edits: PhotoEdits,
  cornerRadius: number,
) {
  ctx.save();

  // Clip to rounded slot rect.
  ctx.beginPath();
  pathRoundedRect(ctx, x, y, w, h, cornerRadius);
  ctx.clip();

  // Apply CSS filter (supported in modern browsers via ctx.filter).
  const filter = editsToCssFilter(edits);
  if (filter) ctx.filter = filter;

  // Cover sizing for the image at the slot rect.
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;

  // Move to slot center then apply translate → scale → rotate (same order as CSS).
  ctx.translate(x + w / 2, y + h / 2);
  ctx.translate((edits.offsetX / 100) * w, (edits.offsetY / 100) * h);
  ctx.scale(edits.scale, edits.scale);
  ctx.rotate((edits.rotation * Math.PI) / 180);

  ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);

  ctx.restore();
}

/**
 * Generate the final collage image as an object URL.
 */
export async function generateCollage(
  template: CollageTemplate,
  photos: Map<string, PhotoData>,
  slotEdits: Map<string, PhotoEdits> = new Map(),
  collageStyle: CollageStyle = DEFAULT_STYLE,
): Promise<string> {
  const canvasWidth = EXPORT_WIDTH;
  const canvasHeight = EXPORT_WIDTH / template.aspectRatio;

  // Scale editor px values up for the export canvas.
  const pxScale = canvasWidth / REFERENCE_WIDTH;
  const gapPx = collageStyle.gap * pxScale;
  const paddingPx = collageStyle.padding * pxScale;
  const cornerPx = collageStyle.cornerRadius * pxScale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Background fill (entire canvas including padding area).
  ctx.fillStyle = collageStyle.background || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Inner area where slots live, after outer padding.
  const innerX = paddingPx;
  const innerY = paddingPx;
  const innerW = canvasWidth - paddingPx * 2;
  const innerH = canvasHeight - paddingPx * 2;

  for (const slot of template.slots) {
    const photo = photos.get(slot.id);
    if (!photo) continue;

    const edits = slotEdits.get(slot.id) ?? DEFAULT_EDITS;

    const sx = innerX + (slot.x / 100) * innerW + gapPx / 2;
    const sy = innerY + (slot.y / 100) * innerH + gapPx / 2;
    const sw = (slot.width / 100) * innerW - gapPx;
    const sh = (slot.height / 100) * innerH - gapPx;

    if (sw <= 0 || sh <= 0) continue;

    try {
      const img = await loadImage(photo.previewUrl);
      drawSlot(ctx, img, sx, sy, sw, sh, edits, cornerPx);
    } catch (error) {
      console.error('Failed to load image:', error);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(sx, sy, sw, sh);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        reject(new Error('Canvas to Blob failed'));
      }
    }, 'image/jpeg', 0.92);
  });
}

/**
 * Download or share the collage.
 */
export async function saveCollage(
  template: CollageTemplate,
  photos: Map<string, PhotoData>,
  slotEdits: Map<string, PhotoEdits> = new Map(),
  collageStyle: CollageStyle = DEFAULT_STYLE,
): Promise<void> {
  const url = await generateCollage(template, photos, slotEdits, collageStyle);

  if (navigator.share) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'photo-collage.jpg', { type: 'image/jpeg' });
      await navigator.share({
        files: [file],
        title: 'Photo Collage',
      });
      URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.warn('Share failed, falling back to download:', error);
    }
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = 'photo-collage.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

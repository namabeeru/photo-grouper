/**
 * Collage Generator - exports final collage image
 *
 * Applies per-slot edits (rotation/scale/offset/filter) and collage-wide
 * style (background, gap, corner radius, padding) so the exported image
 * matches the preview. Honors an optional output aspect-ratio override.
 */

import { CollageTemplate } from './templates';
import {
  PhotoEdits,
  DEFAULT_EDITS,
  CollageStyle,
  DEFAULT_STYLE,
  editsToCssFilter,
  clampOffsets,
} from './photoEdits';

import { PhotoData } from '@/types/photo';

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
 * Load every distinct photo URL once, in parallel. Returns a lookup the
 * renderer can read synchronously.
 */
async function preloadImages(urls: string[]): Promise<Map<string, HTMLImageElement>> {
  const unique = Array.from(new Set(urls));
  const entries = await Promise.all(
    unique.map(async (url): Promise<[string, HTMLImageElement] | null> => {
      try {
        return [url, await loadImage(url)];
      } catch (e) {
        console.error('Failed to load image:', e);
        return null;
      }
    })
  );
  const map = new Map<string, HTMLImageElement>();
  for (const entry of entries) {
    if (entry) map.set(entry[0], entry[1]);
  }
  return map;
}

function pathRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const c = ctx as CanvasRenderingContext2D & { roundRect?: (x: number, y: number, w: number, h: number, r: number) => void };
  if (typeof c.roundRect === 'function') {
    c.roundRect(x, y, w, h, radius);
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
 * Draw an image into a slot, replicating the editor's CSS pipeline:
 * cover-fit → translate(offset) → scale → rotate, with the offset clamped so
 * the image always covers the slot (never reveals empty space).
 */
function drawSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  edits: PhotoEdits,
  cornerRadius: number,
) {
  ctx.save();

  ctx.beginPath();
  pathRoundedRect(ctx, x, y, w, h, cornerRadius);
  ctx.clip();

  const filter = editsToCssFilter(edits);
  if (filter) ctx.filter = filter;

  const iw = img.width;
  const ih = img.height;
  const imgAspect = iw / ih;

  // Cover sizing for the image at the slot rect.
  const scale = Math.max(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;

  // Clamp offsets to the same bounds used in the editor.
  const { offsetX, offsetY } = clampOffsets(edits, imgAspect, w, h);

  ctx.translate(x + w / 2, y + h / 2);
  ctx.translate((offsetX / 100) * w, (offsetY / 100) * h);
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
  outputAspectRatio: number | null = null,
): Promise<string> {
  const aspect = outputAspectRatio ?? template.aspectRatio;
  const canvasWidth = EXPORT_WIDTH;
  const canvasHeight = Math.round(EXPORT_WIDTH / aspect);

  const pxScale = canvasWidth / REFERENCE_WIDTH;
  const gapPx = collageStyle.gap * pxScale;
  const paddingPx = collageStyle.padding * pxScale;
  const cornerPx = collageStyle.cornerRadius * pxScale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas rendering context unavailable');
  }

  ctx.fillStyle = collageStyle.background || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Preload all photos in parallel before drawing.
  const urls: string[] = [];
  for (const slot of template.slots) {
    const photo = photos.get(slot.id);
    if (photo) urls.push(photo.previewUrl);
  }
  const imageCache = await preloadImages(urls);

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

    const img = imageCache.get(photo.previewUrl);
    if (img) {
      drawSlot(ctx, img, sx, sy, sw, sh, edits, cornerPx);
    } else {
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
  outputAspectRatio: number | null = null,
): Promise<void> {
  const url = await generateCollage(template, photos, slotEdits, collageStyle, outputAspectRatio);

  if (navigator.share && navigator.canShare) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'photo-collage.jpg', { type: 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Photo Collage' });
        URL.revokeObjectURL(url);
        return;
      }
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
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

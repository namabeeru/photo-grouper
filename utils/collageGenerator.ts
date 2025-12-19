/**
 * Collage Generator - exports final collage image
 */

import { CollageTemplate } from './templates';

interface PhotoData {
  file: File;
  previewUrl: string;
}

const EXPORT_WIDTH = 2000;

/**
 * Load an image from URL
 */
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
 * Draw an image with cover behavior
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.width;
  const ih = img.height;

  const scale = Math.max(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;

  const sx = (iw - w / scale) / 2;
  const sy = (ih - h / scale) / 2;
  const sw = w / scale;
  const sh = h / scale;

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Generate final collage image from template and photos
 */
export async function generateCollage(
  template: CollageTemplate,
  photos: Map<string, PhotoData>
): Promise<string> {
  const canvasWidth = EXPORT_WIDTH;
  const canvasHeight = EXPORT_WIDTH / template.aspectRatio;
  const gap = 8; // Gap between photos

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw each slot
  for (const slot of template.slots) {
    const photo = photos.get(slot.id);
    if (!photo) continue;

    const x = (slot.x / 100) * canvasWidth + gap / 2;
    const y = (slot.y / 100) * canvasHeight + gap / 2;
    const w = (slot.width / 100) * canvasWidth - gap;
    const h = (slot.height / 100) * canvasHeight - gap;

    try {
      const img = await loadImage(photo.previewUrl);
      drawImageCover(ctx, img, x, y, w, h);
    } catch (error) {
      console.error('Failed to load image:', error);
      // Draw placeholder
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x, y, w, h);
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
 * Download or share the collage
 */
export async function saveCollage(
  template: CollageTemplate,
  photos: Map<string, PhotoData>
): Promise<void> {
  const url = await generateCollage(template, photos);

  // Try native share on mobile
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

  // Fallback to download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'photo-collage.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

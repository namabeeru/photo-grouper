/**
 * Generates a collage from a list of image URLs.
 * Returns a Promise that resolves to a Blob URL of the generated image.
 */
export async function generateCollage(imageUrls: string[]): Promise<string> {
    if (imageUrls.length === 0) return '';

    const count = imageUrls.length;
    // Calculate grid dimensions
    // For 4 images: sqrt(4) = 2 cols.
    // For 5 images: sqrt(5) ~ 2.23 -> 3 cols.
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    const CANVAS_WIDTH = 2000;
    // Calculate height based on rows/cols ratio assuming square cells
    // If we want square cells, width / cols = cellWidth. 
    // Height = rows * cellWidth.
    const cellWidth = CANVAS_WIDTH / cols;
    const cellHeight = cellWidth; // Make cells square
    const CANVAS_HEIGHT = rows * cellHeight;

    const PADDING = 20; // White border size

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Fill background with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    };

    const images = await Promise.all(imageUrls.map(loadImage));

    images.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = col * cellWidth;
        const y = row * cellHeight;
        const w = cellWidth;
        const h = cellHeight;

        // Apply padding
        const innerX = x + PADDING / 2;
        const innerY = y + PADDING / 2;
        const innerW = w - PADDING;
        const innerH = h - PADDING;

        // Draw Image with "object-cover" behavior
        drawImageProp(ctx, img, innerX, innerY, innerW, innerH);
    });

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(URL.createObjectURL(blob));
            } else {
                reject(new Error('Canvas to Blob failed'));
            }
        }, 'image/jpeg', 0.9);
    });
}

/**
 * Helper to draw an image covering a target area (like CSS object-fit: cover)
 */
function drawImageProp(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    offsetX: number = 0.5,
    offsetY: number = 0.5
) {
    // defaulting offset to center (0.5)
    if (arguments.length < 2) {
        throw new Error('drawImageProp requires context and image');
    }

    const iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih);

    let nw = iw * r, // new prop. width
        nh = ih * r, // new prop. height
        cx: number,
        cy: number,
        cw: number,
        ch: number,
        ar: number = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated

    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

/**
 * Template definitions for Google Photos-style collage layouts
 */

export interface SlotPosition {
    id: string;
    x: number;      // percentage (0-100)
    y: number;      // percentage (0-100)
    width: number;  // percentage (0-100)
    height: number; // percentage (0-100)
}

export interface CollageTemplate {
    id: string;
    name: string;
    slots: SlotPosition[];
    aspectRatio: number; // width / height
}

// Template definitions matching Google Photos styles
export const TEMPLATES: CollageTemplate[] = [
    // 2 photos
    {
        id: '2-horizontal',
        name: '2 Horizontal',
        aspectRatio: 2,
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 100 },
            { id: 's2', x: 50, y: 0, width: 50, height: 100 },
        ],
    },
    {
        id: '2-vertical',
        name: '2 Vertical',
        aspectRatio: 0.75,
        slots: [
            { id: 's1', x: 0, y: 0, width: 100, height: 50 },
            { id: 's2', x: 0, y: 50, width: 100, height: 50 },
        ],
    },
    // 3 photos
    {
        id: '3-left-focus',
        name: '3 Left Focus',
        aspectRatio: 1.5,
        slots: [
            { id: 's1', x: 0, y: 0, width: 60, height: 100 },
            { id: 's2', x: 60, y: 0, width: 40, height: 50 },
            { id: 's3', x: 60, y: 50, width: 40, height: 50 },
        ],
    },
    {
        id: '3-top-focus',
        name: '3 Top Focus',
        aspectRatio: 1,
        slots: [
            { id: 's1', x: 0, y: 0, width: 100, height: 60 },
            { id: 's2', x: 0, y: 60, width: 50, height: 40 },
            { id: 's3', x: 50, y: 60, width: 50, height: 40 },
        ],
    },
    // 4 photos
    {
        id: '4-grid',
        name: '4 Grid',
        aspectRatio: 1,
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 50 },
            { id: 's2', x: 50, y: 0, width: 50, height: 50 },
            { id: 's3', x: 0, y: 50, width: 50, height: 50 },
            { id: 's4', x: 50, y: 50, width: 50, height: 50 },
        ],
    },
    {
        id: '4-left-strip',
        name: '4 Left Strip',
        aspectRatio: 1.2,
        slots: [
            { id: 's1', x: 0, y: 0, width: 70, height: 100 },
            { id: 's2', x: 70, y: 0, width: 30, height: 33.33 },
            { id: 's3', x: 70, y: 33.33, width: 30, height: 33.33 },
            { id: 's4', x: 70, y: 66.66, width: 30, height: 33.34 },
        ],
    },
    // 5 photos
    {
        id: '5-featured',
        name: '5 Featured',
        aspectRatio: 1.2,
        slots: [
            { id: 's1', x: 0, y: 0, width: 60, height: 60 },
            { id: 's2', x: 60, y: 0, width: 40, height: 30 },
            { id: 's3', x: 60, y: 30, width: 40, height: 30 },
            { id: 's4', x: 0, y: 60, width: 30, height: 40 },
            { id: 's5', x: 30, y: 60, width: 70, height: 40 },
        ],
    },
    // 6 photos
    {
        id: '6-grid',
        name: '6 Grid',
        aspectRatio: 1.5,
        slots: [
            { id: 's1', x: 0, y: 0, width: 33.33, height: 50 },
            { id: 's2', x: 33.33, y: 0, width: 33.33, height: 50 },
            { id: 's3', x: 66.66, y: 0, width: 33.34, height: 50 },
            { id: 's4', x: 0, y: 50, width: 33.33, height: 50 },
            { id: 's5', x: 33.33, y: 50, width: 33.33, height: 50 },
            { id: 's6', x: 66.66, y: 50, width: 33.34, height: 50 },
        ],
    },
    {
        id: '6-mosaic',
        name: '6 Mosaic',
        aspectRatio: 1.2,
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 66.66 },
            { id: 's2', x: 50, y: 0, width: 50, height: 33.33 },
            { id: 's3', x: 50, y: 33.33, width: 25, height: 33.33 },
            { id: 's4', x: 75, y: 33.33, width: 25, height: 33.33 },
            { id: 's5', x: 0, y: 66.66, width: 33.33, height: 33.34 },
            { id: 's6', x: 33.33, y: 66.66, width: 66.67, height: 33.34 },
        ],
    },
];

/**
 * Get templates filtered by photo count
 */
export function getTemplatesForPhotoCount(count: number): CollageTemplate[] {
    return TEMPLATES.filter((t) => t.slots.length <= Math.max(count, 2));
}

/**
 * Get the best default template for a given photo count
 */
export function getDefaultTemplate(count: number): CollageTemplate {
    const exact = TEMPLATES.find((t) => t.slots.length === count);
    if (exact) return exact;

    // Find closest match
    const sorted = [...TEMPLATES].sort(
        (a, b) => Math.abs(a.slots.length - count) - Math.abs(b.slots.length - count)
    );
    return sorted[0];
}

/**
 * Template definitions for collage layouts
 * Expanded with more creative options
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
    style?: 'clean' | 'polaroid' | 'rounded' | 'artistic';
}

// Standard gap for white borders
const GAP = 1; // percentage

// Template definitions - organized by photo count
export const TEMPLATES: CollageTemplate[] = [
    // ==================== 2 PHOTOS ====================
    {
        id: '2-side-by-side',
        name: '2 Side by Side',
        aspectRatio: 2,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 100 },
            { id: 's2', x: 50, y: 0, width: 50, height: 100 },
        ],
    },
    {
        id: '2-stacked',
        name: '2 Stacked',
        aspectRatio: 0.8,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 100, height: 50 },
            { id: 's2', x: 0, y: 50, width: 100, height: 50 },
        ],
    },
    {
        id: '2-big-small',
        name: '2 Featured',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 70, height: 100 },
            { id: 's2', x: 70, y: 25, width: 30, height: 50 },
        ],
    },

    // ==================== 3 PHOTOS ====================
    {
        id: '3-left-focus',
        name: '3 Left Focus',
        aspectRatio: 1.5,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 60, height: 100 },
            { id: 's2', x: 60, y: 0, width: 40, height: 50 },
            { id: 's3', x: 60, y: 50, width: 40, height: 50 },
        ],
    },
    {
        id: '3-right-focus',
        name: '3 Right Focus',
        aspectRatio: 1.5,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 40, height: 50 },
            { id: 's2', x: 0, y: 50, width: 40, height: 50 },
            { id: 's3', x: 40, y: 0, width: 60, height: 100 },
        ],
    },
    {
        id: '3-top-focus',
        name: '3 Top Focus',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 100, height: 60 },
            { id: 's2', x: 0, y: 60, width: 50, height: 40 },
            { id: 's3', x: 50, y: 60, width: 50, height: 40 },
        ],
    },
    {
        id: '3-row',
        name: '3 Row',
        aspectRatio: 3,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 33.33, height: 100 },
            { id: 's2', x: 33.33, y: 0, width: 33.33, height: 100 },
            { id: 's3', x: 66.66, y: 0, width: 33.34, height: 100 },
        ],
    },

    // ==================== 4 PHOTOS ====================
    {
        id: '4-grid',
        name: '4 Grid',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 50 },
            { id: 's2', x: 50, y: 0, width: 50, height: 50 },
            { id: 's3', x: 0, y: 50, width: 50, height: 50 },
            { id: 's4', x: 50, y: 50, width: 50, height: 50 },
        ],
    },
    {
        id: '4-big-left',
        name: '4 Big Left',
        aspectRatio: 1.2,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 65, height: 100 },
            { id: 's2', x: 65, y: 0, width: 35, height: 33.33 },
            { id: 's3', x: 65, y: 33.33, width: 35, height: 33.33 },
            { id: 's4', x: 65, y: 66.66, width: 35, height: 33.34 },
        ],
    },
    {
        id: '4-horizontal-strip',
        name: '4 Strip',
        aspectRatio: 4,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 25, height: 100 },
            { id: 's2', x: 25, y: 0, width: 25, height: 100 },
            { id: 's3', x: 50, y: 0, width: 25, height: 100 },
            { id: 's4', x: 75, y: 0, width: 25, height: 100 },
        ],
    },
    {
        id: '4-t-layout',
        name: '4 T Layout',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 100, height: 55 },
            { id: 's2', x: 0, y: 55, width: 33.33, height: 45 },
            { id: 's3', x: 33.33, y: 55, width: 33.33, height: 45 },
            { id: 's4', x: 66.66, y: 55, width: 33.34, height: 45 },
        ],
    },

    // ==================== 5 PHOTOS ====================
    {
        id: '5-featured',
        name: '5 Featured',
        aspectRatio: 1.2,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 60, height: 60 },
            { id: 's2', x: 60, y: 0, width: 40, height: 30 },
            { id: 's3', x: 60, y: 30, width: 40, height: 30 },
            { id: 's4', x: 0, y: 60, width: 30, height: 40 },
            { id: 's5', x: 30, y: 60, width: 70, height: 40 },
        ],
    },
    {
        id: '5-cross',
        name: '5 Cross',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 25, y: 0, width: 50, height: 40 },
            { id: 's2', x: 0, y: 40, width: 33.33, height: 30 },
            { id: 's3', x: 33.33, y: 40, width: 33.33, height: 30 },
            { id: 's4', x: 66.66, y: 40, width: 33.34, height: 30 },
            { id: 's5', x: 25, y: 70, width: 50, height: 30 },
        ],
    },
    {
        id: '5-mosaic',
        name: '5 Mosaic',
        aspectRatio: 1.5,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 50 },
            { id: 's2', x: 50, y: 0, width: 50, height: 50 },
            { id: 's3', x: 0, y: 50, width: 33.33, height: 50 },
            { id: 's4', x: 33.33, y: 50, width: 33.33, height: 50 },
            { id: 's5', x: 66.66, y: 50, width: 33.34, height: 50 },
        ],
    },

    // ==================== 6 PHOTOS ====================
    {
        id: '6-grid',
        name: '6 Grid',
        aspectRatio: 1.5,
        style: 'clean',
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
        id: '6-hero',
        name: '6 Hero',
        aspectRatio: 1.2,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 66.66, height: 60 },
            { id: 's2', x: 66.66, y: 0, width: 33.34, height: 30 },
            { id: 's3', x: 66.66, y: 30, width: 33.34, height: 30 },
            { id: 's4', x: 0, y: 60, width: 33.33, height: 40 },
            { id: 's5', x: 33.33, y: 60, width: 33.33, height: 40 },
            { id: 's6', x: 66.66, y: 60, width: 33.34, height: 40 },
        ],
    },
    {
        id: '6-mosaic',
        name: '6 Mosaic',
        aspectRatio: 1.2,
        style: 'artistic',
        slots: [
            { id: 's1', x: 0, y: 0, width: 50, height: 66.66 },
            { id: 's2', x: 50, y: 0, width: 50, height: 33.33 },
            { id: 's3', x: 50, y: 33.33, width: 25, height: 33.33 },
            { id: 's4', x: 75, y: 33.33, width: 25, height: 33.33 },
            { id: 's5', x: 0, y: 66.66, width: 33.33, height: 33.34 },
            { id: 's6', x: 33.33, y: 66.66, width: 66.67, height: 33.34 },
        ],
    },

    // ==================== 7 PHOTOS ====================
    {
        id: '7-spotlight',
        name: '7 Spotlight',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 20, y: 20, width: 60, height: 40 },
            { id: 's2', x: 0, y: 0, width: 33.33, height: 25 },
            { id: 's3', x: 33.33, y: 0, width: 33.33, height: 25 },
            { id: 's4', x: 66.66, y: 0, width: 33.34, height: 25 },
            { id: 's5', x: 0, y: 65, width: 33.33, height: 35 },
            { id: 's6', x: 33.33, y: 65, width: 33.33, height: 35 },
            { id: 's7', x: 66.66, y: 65, width: 33.34, height: 35 },
        ],
    },

    // ==================== 8 PHOTOS ====================
    {
        id: '8-grid',
        name: '8 Grid',
        aspectRatio: 2,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 25, height: 50 },
            { id: 's2', x: 25, y: 0, width: 25, height: 50 },
            { id: 's3', x: 50, y: 0, width: 25, height: 50 },
            { id: 's4', x: 75, y: 0, width: 25, height: 50 },
            { id: 's5', x: 0, y: 50, width: 25, height: 50 },
            { id: 's6', x: 25, y: 50, width: 25, height: 50 },
            { id: 's7', x: 50, y: 50, width: 25, height: 50 },
            { id: 's8', x: 75, y: 50, width: 25, height: 50 },
        ],
    },

    // ==================== 9 PHOTOS ====================
    {
        id: '9-grid',
        name: '9 Grid',
        aspectRatio: 1,
        style: 'clean',
        slots: [
            { id: 's1', x: 0, y: 0, width: 33.33, height: 33.33 },
            { id: 's2', x: 33.33, y: 0, width: 33.33, height: 33.33 },
            { id: 's3', x: 66.66, y: 0, width: 33.34, height: 33.33 },
            { id: 's4', x: 0, y: 33.33, width: 33.33, height: 33.33 },
            { id: 's5', x: 33.33, y: 33.33, width: 33.33, height: 33.33 },
            { id: 's6', x: 66.66, y: 33.33, width: 33.34, height: 33.33 },
            { id: 's7', x: 0, y: 66.66, width: 33.33, height: 33.34 },
            { id: 's8', x: 33.33, y: 66.66, width: 33.33, height: 33.34 },
            { id: 's9', x: 66.66, y: 66.66, width: 33.34, height: 33.34 },
        ],
    },
];

/**
 * Get templates filtered by photo count (exact match only)
 */
export function getTemplatesForPhotoCount(count: number): CollageTemplate[] {
    return TEMPLATES.filter((t) => t.slots.length === count);
}

/**
 * Get the best default template for a given photo count
 */
export function getDefaultTemplate(count: number): CollageTemplate {
    // Find exact match first
    const exact = TEMPLATES.find((t) => t.slots.length === count);
    if (exact) return exact;

    // Find closest smaller match
    const smaller = TEMPLATES
        .filter((t) => t.slots.length <= count)
        .sort((a, b) => b.slots.length - a.slots.length);

    return smaller[0] || TEMPLATES[0];
}

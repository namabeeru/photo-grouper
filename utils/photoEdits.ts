/**
 * Per-slot photo edits and collage-wide style settings.
 */

export type FilterId =
    | 'none'
    | 'mono'
    | 'noir'
    | 'sepia'
    | 'vintage'
    | 'fade'
    | 'warm'
    | 'cool'
    | 'vivid'
    | 'dramatic'
    | 'cinematic'
    | 'pastel'
    | 'lush'
    | 'matte';

export interface PhotoEdits {
    rotation: number;    // degrees, -180 .. 180 (image content rotation)
    scale: number;       // 1.0 .. 3.0 (zoom inside slot)
    offsetX: number;     // -50 .. 50 (% of slot width)
    offsetY: number;     // -50 .. 50 (% of slot height)
    filter: FilterId;
    brightness: number;  // 0.5 .. 1.5 (1 = no change)
    contrast: number;    // 0.5 .. 1.5
    saturation: number;  // 0 .. 2
    blur: number;        // 0 .. 6 (px)
}

export const DEFAULT_EDITS: PhotoEdits = {
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    filter: 'none',
    brightness: 1,
    contrast: 1,
    saturation: 1,
    blur: 0,
};

/**
 * CSS filter contribution for each named preset.
 * Combined with user brightness/contrast/saturation in `editsToCssFilter`.
 */
const FILTER_PRESETS: Record<FilterId, string> = {
    none: '',
    mono: 'grayscale(1)',
    noir: 'grayscale(1) contrast(1.25) brightness(0.92)',
    sepia: 'sepia(0.85) saturate(1.05)',
    vintage: 'sepia(0.4) saturate(0.85) contrast(0.95) brightness(1.05) hue-rotate(-10deg)',
    fade: 'contrast(0.85) brightness(1.1) saturate(0.8)',
    warm: 'saturate(1.15) hue-rotate(-15deg) brightness(1.05)',
    cool: 'saturate(1.1) hue-rotate(15deg) brightness(1.02)',
    vivid: 'saturate(1.6) contrast(1.1)',
    dramatic: 'contrast(1.35) saturate(1.1) brightness(0.95)',
    cinematic: 'contrast(1.15) saturate(0.85) hue-rotate(-5deg)',
    pastel: 'saturate(0.7) brightness(1.12) contrast(0.95)',
    lush: 'saturate(1.4) brightness(1.05) contrast(1.05)',
    matte: 'contrast(0.9) brightness(1.05) saturate(0.95)',
};

export const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
    { id: 'none', label: 'Original' },
    { id: 'mono', label: 'Mono' },
    { id: 'noir', label: 'Noir' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'fade', label: 'Fade' },
    { id: 'warm', label: 'Warm' },
    { id: 'cool', label: 'Cool' },
    { id: 'vivid', label: 'Vivid' },
    { id: 'dramatic', label: 'Dramatic' },
    { id: 'cinematic', label: 'Cinema' },
    { id: 'pastel', label: 'Pastel' },
    { id: 'lush', label: 'Lush' },
    { id: 'matte', label: 'Matte' },
];

export function editsToCssFilter(edits: PhotoEdits): string {
    const parts: string[] = [];
    const preset = FILTER_PRESETS[edits.filter];
    if (preset) parts.push(preset);
    if (edits.brightness !== 1) parts.push(`brightness(${edits.brightness})`);
    if (edits.contrast !== 1) parts.push(`contrast(${edits.contrast})`);
    if (edits.saturation !== 1) parts.push(`saturate(${edits.saturation})`);
    if (edits.blur > 0) parts.push(`blur(${edits.blur}px)`);
    return parts.join(' ');
}

/**
 * Translate slot-relative offsets into a CSS transform string applied to
 * the photo element inside its slot container.
 */
export function editsToTransform(edits: PhotoEdits): string {
    const tx = edits.offsetX;
    const ty = edits.offsetY;
    return `translate(${tx}%, ${ty}%) scale(${edits.scale}) rotate(${edits.rotation}deg)`;
}

// ===== Collage-wide style =====

export interface CollageStyle {
    background: string;   // hex color for canvas background
    gap: number;          // 0 .. 24 (px in editor; scaled for export)
    cornerRadius: number; // 0 .. 32 (px in editor; scaled for export)
    padding: number;      // 0 .. 40 (px outer padding in editor; scaled for export)
}

export const DEFAULT_STYLE: CollageStyle = {
    background: '#ffffff',
    gap: 6,
    cornerRadius: 4,
    padding: 0,
};

export const BACKGROUND_PRESETS: { name: string; value: string }[] = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#111111' },
    { name: 'Cream', value: '#f7efe1' },
    { name: 'Blush', value: '#fadadd' },
    { name: 'Mint', value: '#d6f5e3' },
    { name: 'Sky', value: '#d6e9f7' },
    { name: 'Lavender', value: '#e6dbf5' },
    { name: 'Charcoal', value: '#2b2b2e' },
    { name: 'Sunset', value: '#ffb088' },
    { name: 'Forest', value: '#2f4a3a' },
];

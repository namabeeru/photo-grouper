'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    ArrowLeft, Download, Loader2, RotateCcw, Repeat2,
    LayoutGrid, Sliders, Wand2, Palette, Crop,
    RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRightIcon,
    Check, X, Hand,
} from 'lucide-react';
import { CollageTemplate, SlotPosition } from '@/utils/templates';
import {
    PhotoEdits,
    DEFAULT_EDITS,
    FILTER_OPTIONS,
    FilterId,
    editsToCssFilter,
    editsToTransform,
    clampOffsets,
    maxOffsetPct,
    CollageStyle,
    BACKGROUND_PRESETS,
    ASPECT_PRESETS,
} from '@/utils/photoEdits';

import { PhotoData } from '@/types/photo';

interface CollageEditorProps {
    photos: PhotoData[];
    templates: CollageTemplate[];
    selectedTemplate: CollageTemplate;
    photoAssignments: Map<string, number>;
    selectedSlot: string | null;
    slotEdits: Map<string, PhotoEdits>;
    collageStyle: CollageStyle;
    outputAspectRatio: number | null;
    isSaving: boolean;
    onTemplateSelect: (template: CollageTemplate) => void;
    onSlotClick: (slotId: string) => void;
    onSwapSlots: (slotA: string, slotB: string) => void;
    onUpdateSlotEdits: (slotId: string, updates: Partial<PhotoEdits>) => void;
    onResetSlotEdits: (slotId: string) => void;
    onApplyEditToAll: (updates: Partial<PhotoEdits>) => void;
    onUpdateStyle: (updates: Partial<CollageStyle>) => void;
    onSetAspectRatio: (ratio: number | null) => void;
    onSave: () => void;
    onCancel: () => void;
}

type Tab = 'layouts' | 'adjust' | 'filters' | 'format' | 'style';

export default function CollageEditor({
    photos,
    templates,
    selectedTemplate,
    photoAssignments,
    selectedSlot,
    slotEdits,
    collageStyle,
    outputAspectRatio,
    isSaving,
    onTemplateSelect,
    onSlotClick,
    onSwapSlots,
    onUpdateSlotEdits,
    onResetSlotEdits,
    onApplyEditToAll,
    onUpdateStyle,
    onSetAspectRatio,
    onSave,
    onCancel,
}: CollageEditorProps) {
    const [tab, setTab] = useState<Tab>('layouts');
    // Slot currently "armed" to be swapped. Tapping another slot swaps them.
    const [swapSource, setSwapSource] = useState<string | null>(null);

    const availableTemplates = useMemo(
        () => templates.filter((t) => t.slots.length === photos.length),
        [templates, photos.length]
    );

    const aspectRatio = outputAspectRatio ?? selectedTemplate.aspectRatio;

    const activeEdits: PhotoEdits = selectedSlot
        ? (slotEdits.get(selectedSlot) ?? DEFAULT_EDITS)
        : DEFAULT_EDITS;

    // Changing layout drops the armed state (slot IDs may differ).
    const handleTemplateSelect = useCallback((t: CollageTemplate) => {
        setSwapSource(null);
        onTemplateSelect(t);
    }, [onTemplateSelect]);

    // ----- stable per-slot callbacks (so EditableSlot can be memoized) -----
    const handleTap = useCallback((slotId: string) => {
        if (swapSource) {
            if (swapSource !== slotId) onSwapSlots(swapSource, slotId);
            setSwapSource(null);
            return;
        }
        onSlotClick(slotId);
    }, [swapSource, onSwapSlots, onSlotClick]);

    const handleLongPress = useCallback((slotId: string) => {
        // Arm this slot for swapping. Light haptic where supported.
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate(12); } catch { /* ignore */ }
        }
        setSwapSource(slotId);
        onSlotClick(slotId);
    }, [onSlotClick]);

    const handleEditsChange = useCallback((slotId: string, updates: Partial<PhotoEdits>) => {
        onUpdateSlotEdits(slotId, updates);
    }, [onUpdateSlotEdits]);

    const armSwapFromButton = useCallback(() => {
        if (selectedSlot) setSwapSource(selectedSlot);
    }, [selectedSlot]);

    const cancelSwap = useCallback(() => setSwapSource(null), []);

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-slate-950 text-white">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-700/80 bg-slate-900/90 px-4 py-3 backdrop-blur-xl">
                <button
                    onClick={onCancel}
                    className="-ml-1 flex min-h-10 items-center gap-2 rounded-full px-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm">Photos</span>
                </button>

                <div className="hidden text-center sm:block">
                    <p className="text-sm font-semibold text-white">Edit collage</p>
                    <p className="text-[11px] text-slate-500">{photos.length} photos · {availableTemplates.length} layouts</p>
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex min-h-10 items-center gap-2 rounded-full bg-blue-500 px-5 font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
            </header>

            {swapSource && (
                <div className="flex shrink-0 items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-sm font-medium text-slate-950" role="status">
                    <Repeat2 className="h-4 w-4" />
                    Tap another photo to swap
                    <button onClick={cancelSwap} className="ml-2 rounded-full bg-slate-950/10 px-2 py-0.5 font-semibold hover:bg-slate-950/20">
                        Cancel
                    </button>
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <section className="flex min-h-0 flex-1 flex-col items-center justify-start overflow-auto p-4 sm:p-6 md:justify-center" aria-label="Collage preview">
                    <div
                        className="relative w-full max-w-md shrink-0 overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/10"
                        style={{
                            aspectRatio,
                            background: collageStyle.background,
                            padding: collageStyle.padding,
                            borderRadius: collageStyle.cornerRadius,
                        }}
                    >
                        <div className="relative h-full w-full">
                            {selectedTemplate.slots.map((slot, slotIndex) => {
                                const photoIndex = photoAssignments.get(slot.id);
                                const photo = photoIndex !== undefined ? photos[photoIndex] : null;
                                const isSelected = selectedSlot === slot.id && !swapSource;
                                const edits = slotEdits.get(slot.id) ?? DEFAULT_EDITS;

                                return (
                                    <EditableSlot
                                        key={slot.id}
                                        slot={slot}
                                        slotNumber={slotIndex + 1}
                                        photo={photo}
                                        edits={edits}
                                        isSelected={isSelected}
                                        isSwapSource={swapSource === slot.id}
                                        swapArmed={!!swapSource && swapSource !== slot.id}
                                        cornerRadius={collageStyle.cornerRadius}
                                        halfGap={collageStyle.gap / 2}
                                        onTap={handleTap}
                                        onLongPress={handleLongPress}
                                        onEditsChange={handleEditsChange}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 px-4 text-center text-[11px] text-slate-500">
                        <Hand className="h-3.5 w-3.5 shrink-0" />
                        Tap to select · Drag to move · Pinch to zoom · Hold to swap
                    </p>
                </section>

                <aside className="flex shrink-0 flex-col border-t border-slate-700 bg-slate-900 md:w-[27rem] md:border-l md:border-t-0" aria-label="Editing tools">
                    <div className="flex shrink-0 border-b border-slate-700" role="tablist" aria-label="Editing tools">
                        <TabButton active={tab === 'layouts'} onClick={() => setTab('layouts')} icon={<LayoutGrid className="h-5 w-5" />} label="Layouts" />
                        <TabButton active={tab === 'adjust'} onClick={() => setTab('adjust')} icon={<Sliders className="h-5 w-5" />} label="Adjust" />
                        <TabButton active={tab === 'filters'} onClick={() => setTab('filters')} icon={<Wand2 className="h-5 w-5" />} label="Filters" />
                        <TabButton active={tab === 'format'} onClick={() => setTab('format')} icon={<Crop className="h-5 w-5" />} label="Format" />
                        <TabButton active={tab === 'style'} onClick={() => setTab('style')} icon={<Palette className="h-5 w-5" />} label="Style" />
                    </div>

                    <div id="editor-tool-panel" role="tabpanel" className="max-h-[40vh] overflow-y-auto md:max-h-none md:flex-1">
                        {tab === 'layouts' && (
                            <LayoutsTab templates={availableTemplates} selectedTemplate={selectedTemplate} onTemplateSelect={handleTemplateSelect} />
                        )}
                        {tab === 'adjust' && (
                            <AdjustTab
                                selectedSlot={selectedSlot}
                                edits={activeEdits}
                                onUpdate={(updates) => selectedSlot && onUpdateSlotEdits(selectedSlot, updates)}
                                onReset={() => selectedSlot && onResetSlotEdits(selectedSlot)}
                                onArmSwap={armSwapFromButton}
                            />
                        )}
                        {tab === 'filters' && (
                            <FiltersTab
                                selectedSlot={selectedSlot}
                                selectedPhoto={selectedSlot ? photos[photoAssignments.get(selectedSlot) ?? -1] ?? null : null}
                                currentFilter={activeEdits.filter}
                                onPick={(filter) => selectedSlot && onUpdateSlotEdits(selectedSlot, { filter })}
                                onApplyAll={(filter) => onApplyEditToAll({ filter })}
                            />
                        )}
                        {tab === 'format' && <FormatTab activeRatio={outputAspectRatio} onSelect={onSetAspectRatio} />}
                        {tab === 'style' && <StyleTab style={collageStyle} onUpdate={onUpdateStyle} />}
                    </div>
                </aside>
            </div>
        </div>
    );
}

/* ============================== EditableSlot ============================== */

const TAP_SLOP = 8;          // px of movement still treated as a tap
const DRAG_THRESHOLD = 8;    // px before a press becomes a pan
const LONG_PRESS_MS = 400;   // hold time to arm a swap

interface EditableSlotProps {
    slot: SlotPosition;
    slotNumber: number;
    photo: PhotoData | null;
    edits: PhotoEdits;
    isSelected: boolean;
    isSwapSource: boolean;
    swapArmed: boolean; // some OTHER slot is armed → this slot is a swap target
    cornerRadius: number;
    halfGap: number;
    onTap: (slotId: string) => void;
    onLongPress: (slotId: string) => void;
    onEditsChange: (slotId: string, updates: Partial<PhotoEdits>) => void;
}

const EditableSlot = React.memo(function EditableSlot({
    slot, slotNumber, photo, edits, isSelected, isSwapSource, swapArmed,
    cornerRadius, halfGap,
    onTap, onLongPress, onEditsChange,
}: EditableSlotProps) {
    const innerRef = useRef<HTMLDivElement>(null);
    const imgAspectRef = useRef<number>(0);

    const editsRef = useRef(edits);
    useEffect(() => { editsRef.current = edits; }, [edits]);

    const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    const gestureRef = useRef<{
        mode: null | 'pan' | 'pinch';
        moved: boolean;
        longPressed: boolean;
        startX: number;
        startY: number;
        timer: number | null;
    }>({ mode: null, moved: false, longPressed: false, startX: 0, startY: 0, timer: null });

    const slotId = slot.id;

    const clearTimer = useCallback(() => {
        if (gestureRef.current.timer !== null) {
            window.clearTimeout(gestureRef.current.timer);
            gestureRef.current.timer = null;
        }
    }, []);

    const commitEditsChange = useCallback((updates: Partial<PhotoEdits>) => {
        editsRef.current = { ...editsRef.current, ...updates };
        onEditsChange(slotId, updates);
    }, [slotId, onEditsChange]);

    const getPannedOffsets = useCallback((e: PhotoEdits, dxPx: number, dyPx: number, scale = e.scale) => {
        const rect = innerRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return null;
        const m = maxOffsetPct(imgAspectRef.current, rect.width, rect.height, scale);
        return {
            offsetX: Math.max(-m.x, Math.min(m.x, e.offsetX + (dxPx / rect.width) * 100)),
            offsetY: Math.max(-m.y, Math.min(m.y, e.offsetY + (dyPx / rect.height) * 100)),
        };
    }, []);

    // Re-clamp stored offsets when overflow could change (zoom / image load /
    // slot resize) so panning never reveals empty space and zooming out brings
    // pushed-off edges back into view.
    const reclamp = useCallback(() => {
        const rect = innerRef.current?.getBoundingClientRect();
        if (!rect || !imgAspectRef.current) return;
        const e = editsRef.current;
        const clamped = clampOffsets(e, imgAspectRef.current, rect.width, rect.height);
        if (Math.abs(clamped.offsetX - e.offsetX) > 0.05 || Math.abs(clamped.offsetY - e.offsetY) > 0.05) {
            commitEditsChange(clamped);
        }
    }, [commitEditsChange]);

    useEffect(() => { reclamp(); }, [edits.scale, edits.offsetX, edits.offsetY, reclamp]);

    useEffect(() => {
        const el = innerRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => reclamp());
        ro.observe(el);
        return () => ro.disconnect();
    }, [reclamp]);

    useEffect(() => () => clearTimer(), [clearTimer]);

    const applyPan = (dxPx: number, dyPx: number) => {
        const e = editsRef.current;
        const offsets = getPannedOffsets(e, dxPx, dyPx);
        if (offsets) commitEditsChange(offsets);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        const ptrs = pointersRef.current;
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (ptrs.size === 1) {
            gestureRef.current = { mode: null, moved: false, longPressed: false, startX: e.clientX, startY: e.clientY, timer: null };
            if (photo) {
                gestureRef.current.timer = window.setTimeout(() => {
                    if (!gestureRef.current.moved && pointersRef.current.size === 1) {
                        gestureRef.current.longPressed = true;
                        onLongPress(slotId);
                    }
                }, LONG_PRESS_MS);
            }
        } else if (ptrs.size === 2) {
            clearTimer();
            gestureRef.current.mode = 'pinch';
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const ptrs = pointersRef.current;
        if (!ptrs.has(e.pointerId)) return;
        const prev = ptrs.get(e.pointerId)!;
        const curr = { x: e.clientX, y: e.clientY };
        const g = gestureRef.current;

        if (ptrs.size >= 2) {
            // ---- pinch: zoom + pan (no rotation, to avoid accidental skew) ----
            g.mode = 'pinch';
            g.moved = true;
            clearTimer();
            let other: { x: number; y: number } | null = null;
            for (const [id, pos] of ptrs) { if (id !== e.pointerId) { other = pos; break; } }
            if (other && photo) {
                const oldDist = Math.hypot(other.x - prev.x, other.y - prev.y);
                const newDist = Math.hypot(other.x - curr.x, other.y - curr.y);
                if (oldDist > 1) {
                    const factor = newDist / oldDist;
                    const e0 = editsRef.current;
                    const newScale = Math.max(1, Math.min(3, e0.scale * factor));
                    const offsets = getPannedOffsets(e0, (curr.x - prev.x) / 2, (curr.y - prev.y) / 2, newScale);
                    commitEditsChange(offsets ? { scale: newScale, ...offsets } : { scale: newScale });
                }
            }
            ptrs.set(e.pointerId, curr);
            return;
        }

        // ---- single pointer ----
        if (g.longPressed) { ptrs.set(e.pointerId, curr); return; } // armed: ignore movement

        const totalDx = curr.x - g.startX;
        const totalDy = curr.y - g.startY;

        if (g.mode === null) {
            if (Math.abs(totalDx) + Math.abs(totalDy) < DRAG_THRESHOLD) {
                ptrs.set(e.pointerId, curr);
                return;
            }
            g.moved = true;
            clearTimer();
            g.mode = 'pan';
        }

        if (g.mode === 'pan' && photo) {
            applyPan(curr.x - prev.x, curr.y - prev.y);
        }
        ptrs.set(e.pointerId, curr);
    };

    const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
        const ptrs = pointersRef.current;
        const g = gestureRef.current;
        if (ptrs.has(e.pointerId)) ptrs.delete(e.pointerId);

        if (ptrs.size === 0) {
            clearTimer();
            const dist = Math.abs(e.clientX - g.startX) + Math.abs(e.clientY - g.startY);
            // A long-press already armed the swap; don't also treat the release
            // as a tap (which would immediately cancel it).
            if (!g.longPressed && !g.moved && dist < TAP_SLOP) {
                onTap(slotId);
            }
            gestureRef.current.mode = null;
            gestureRef.current.moved = false;
            gestureRef.current.longPressed = false;
        } else if (ptrs.size === 1) {
            // One finger lifted from a pinch — treat the remaining finger as a fresh, already-moved gesture.
            const remaining = [...ptrs.entries()][0];
            gestureRef.current = { mode: null, moved: true, longPressed: false, startX: remaining[1].x, startY: remaining[1].y, timer: null };
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onTap(slotId);
    };

    return (
        <div
            data-slot-id={slot.id}
            className={`absolute transition-all duration-150 ${isSelected || isSwapSource ? 'z-10' : ''}`}
            style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                padding: halfGap,
            }}
        >
            <div
                ref={innerRef}
                role="button"
                tabIndex={0}
                aria-label={photo ? `Select photo slot ${slotNumber}` : `Empty photo slot ${slotNumber}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onKeyDown={handleKeyDown}
                onContextMenu={(ev) => ev.preventDefault()}
                className={`relative w-full h-full overflow-hidden bg-slate-200 transition-all select-none cursor-pointer
                    ${isSelected ? 'ring-4 ring-blue-500' : ''}
                    ${isSwapSource ? 'ring-4 ring-amber-400' : ''}
                    ${swapArmed ? 'ring-2 ring-amber-300/60' : ''}`}
                style={{
                    borderRadius: cornerRadius,
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                }}
            >
                {photo ? (
                    <div
                        className="absolute inset-0"
                        style={{
                            transform: editsToTransform(edits),
                            filter: editsToCssFilter(edits),
                            transformOrigin: 'center center',
                            willChange: 'transform, filter',
                        }}
                    >
                        <Image
                            src={photo.previewUrl}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover pointer-events-none"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            draggable={false}
                            onLoad={(ev) => {
                                const t = ev.target as HTMLImageElement;
                                if (t.naturalWidth && t.naturalHeight) {
                                    imgAspectRef.current = t.naturalWidth / t.naturalHeight;
                                    reclamp();
                                }
                            }}
                        />
                    </div>
                ) : null}

                {/* Swap-target hint badge */}
                {swapArmed && photo && (
                    <span className="absolute inset-0 flex items-center justify-center bg-amber-400/10 pointer-events-none">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-900 shadow-lg">
                            <Repeat2 className="w-4 h-4" />
                        </span>
                    </span>
                )}
            </div>
        </div>
    );
});

/* ============================== Tabs ============================== */

function TabButton({ active, onClick, icon, label }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={onClick}
            role="tab"
            aria-selected={active}
            aria-controls="editor-tool-panel"
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors
                ${active ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-700/40' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function LayoutsTab({
    templates, selectedTemplate, onTemplateSelect,
}: {
    templates: CollageTemplate[];
    selectedTemplate: CollageTemplate;
    onTemplateSelect: (t: CollageTemplate) => void;
}) {
    return (
        <div className="px-4 py-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{templates.length} Layouts</p>
            <div className="grid grid-cols-4 gap-3">
                {templates.map((template) => {
                    const isSelected = template.id === selectedTemplate.id;
                    return (
                        <button
                            key={template.id}
                            onClick={() => onTemplateSelect(template)}
                            aria-label={template.name}
                            aria-pressed={isSelected}
                            className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-150
                                ${isSelected
                                    ? 'ring-2 ring-blue-500 bg-blue-500/20'
                                    : 'bg-slate-700 hover:bg-slate-600 opacity-80 hover:opacity-100'
                                }`}
                            title={template.name}
                        >
                            <div className="absolute inset-2 bg-slate-600/60 rounded-md">
                                {template.slots.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`absolute rounded-[2px] ${isSelected ? 'bg-blue-400' : 'bg-slate-400'}`}
                                        style={{
                                            left: `${s.x}%`,
                                            top: `${s.y}%`,
                                            width: `${Math.max(s.width - 4, 2)}%`,
                                            height: `${Math.max(s.height - 4, 2)}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function AdjustTab({
    selectedSlot, edits, onUpdate, onReset, onArmSwap,
}: {
    selectedSlot: string | null;
    edits: PhotoEdits;
    onUpdate: (updates: Partial<PhotoEdits>) => void;
    onReset: () => void;
    onArmSwap: () => void;
}) {
    if (!selectedSlot) {
        return (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Tap a photo above to start editing.
            </div>
        );
    }

    const PAN_STEP = 5;
    const SCALE_STEP = 0.1;
    const ROT_STEP = 90;

    return (
        <div className="px-4 py-3 space-y-4">
            <div className="flex flex-wrap gap-2">
                <QuickButton onClick={() => onUpdate({ rotation: edits.rotation - ROT_STEP })} icon={<RotateCcw className="w-4 h-4" />} label="Rotate L" />
                <QuickButton onClick={() => onUpdate({ rotation: edits.rotation + ROT_STEP })} icon={<RotateCw className="w-4 h-4" />} label="Rotate R" />
                <QuickButton onClick={() => onUpdate({ scale: Math.min(3, edits.scale + SCALE_STEP) })} icon={<ZoomIn className="w-4 h-4" />} label="Zoom +" />
                <QuickButton onClick={() => onUpdate({ scale: Math.max(1, edits.scale - SCALE_STEP) })} icon={<ZoomOut className="w-4 h-4" />} label="Zoom −" />
                <QuickButton onClick={() => onUpdate({ offsetY: edits.offsetY - PAN_STEP })} icon={<ArrowUp className="w-4 h-4" />} label="Up" />
                <QuickButton onClick={() => onUpdate({ offsetY: edits.offsetY + PAN_STEP })} icon={<ArrowDown className="w-4 h-4" />} label="Down" />
                <QuickButton onClick={() => onUpdate({ offsetX: edits.offsetX - PAN_STEP })} icon={<ArrowLeftIcon className="w-4 h-4" />} label="Left" />
                <QuickButton onClick={() => onUpdate({ offsetX: edits.offsetX + PAN_STEP })} icon={<ArrowRightIcon className="w-4 h-4" />} label="Right" />
            </div>

            <SliderRow label="Rotation" value={edits.rotation} min={-180} max={180} step={1} unit="°" onChange={(v) => onUpdate({ rotation: v })} />
            <SliderRow label="Zoom" value={edits.scale} min={1} max={3} step={0.01} format={(v) => `${v.toFixed(2)}x`} onChange={(v) => onUpdate({ scale: v })} />
            <SliderRow label="Brightness" value={edits.brightness} min={0.5} max={1.5} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ brightness: v })} />
            <SliderRow label="Contrast" value={edits.contrast} min={0.5} max={1.5} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ contrast: v })} />
            <SliderRow label="Saturation" value={edits.saturation} min={0} max={2} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ saturation: v })} />
            <SliderRow label="Blur" value={edits.blur} min={0} max={6} step={0.1} unit="px" onChange={(v) => onUpdate({ blur: v })} />

            <div className="flex gap-2">
                <button
                    onClick={onArmSwap}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2"
                >
                    <Repeat2 className="w-4 h-4" />
                    Swap…
                </button>
                <button
                    onClick={onReset}
                    className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
        </div>
    );
}

function QuickButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-xs"
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function SliderRow({
    label, value, min, max, step, unit, format, onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    format?: (v: number) => string;
    onChange: (v: number) => void;
}) {
    const display = format ? format(value) : `${Math.round(value)}${unit ?? ''}`;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300">{label}</span>
                <span className="text-xs text-slate-400 tabular-nums">{display}</span>
            </div>
            <input
                type="range"
                aria-label={label}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-6"
            />
        </div>
    );
}

function FiltersTab({
    selectedSlot, selectedPhoto, currentFilter, onPick, onApplyAll,
}: {
    selectedSlot: string | null;
    selectedPhoto: PhotoData | null;
    currentFilter: FilterId;
    onPick: (filter: FilterId) => void;
    onApplyAll: (filter: FilterId) => void;
}) {
    if (!selectedSlot || !selectedPhoto) {
        return (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Tap a photo above to apply a filter.
            </div>
        );
    }

    return (
        <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Filters</p>
                <button
                    onClick={() => onApplyAll(currentFilter)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                    <Check className="w-4 h-4" />
                    Apply to all
                </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {FILTER_OPTIONS.map((opt) => {
                    const isSelected = opt.id === currentFilter;
                    const previewEdits: PhotoEdits = { ...DEFAULT_EDITS, filter: opt.id };
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onPick(opt.id)}
                            aria-pressed={isSelected}
                            className={`group flex flex-col items-center gap-1 transition-transform ${isSelected ? 'scale-[1.04]' : ''}`}
                        >
                            <div className={`relative w-full aspect-square rounded-lg overflow-hidden bg-slate-700
                                ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-700 group-hover:ring-slate-500'}`}>
                                <div className="absolute inset-0" style={{ filter: editsToCssFilter(previewEdits) }}>
                                    <Image src={selectedPhoto.previewUrl} alt="" fill unoptimized className="object-cover" sizes="80px" />
                                </div>
                            </div>
                            <span className={`text-[11px] ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FormatTab({
    activeRatio, onSelect,
}: {
    activeRatio: number | null;
    onSelect: (ratio: number | null) => void;
}) {
    return (
        <div className="px-4 py-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Aspect Ratio</p>
            <div className="grid grid-cols-2 gap-2.5">
                {ASPECT_PRESETS.map((preset) => {
                    const isSelected = (preset.ratio ?? null) === activeRatio ||
                        (preset.ratio !== null && activeRatio !== null && Math.abs(preset.ratio - activeRatio) < 0.001);
                    const r = preset.ratio ?? 1;
                    const boxW = r >= 1 ? 34 : 34 * r;
                    const boxH = r >= 1 ? 34 / r : 34;
                    return (
                        <button
                            key={preset.id}
                            onClick={() => onSelect(preset.ratio)}
                            aria-pressed={isSelected}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-500/15'
                                    : 'border-slate-700 bg-slate-700/40 hover:border-slate-500'}`}
                        >
                            <span className="flex items-center justify-center w-9 h-9 flex-shrink-0">
                                <span
                                    className={`block rounded-[3px] ${isSelected ? 'bg-blue-400' : 'bg-slate-400'}`}
                                    style={{ width: boxW, height: boxH }}
                                />
                            </span>
                            <span className="min-w-0">
                                <span className={`block text-sm font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>{preset.label}</span>
                                <span className="block text-[11px] text-slate-400 truncate">{preset.platform}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function StyleTab({
    style, onUpdate,
}: {
    style: CollageStyle;
    onUpdate: (updates: Partial<CollageStyle>) => void;
}) {
    return (
        <div className="px-4 py-3 space-y-5">
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Background</p>
                <div className="flex gap-2 flex-wrap">
                    {BACKGROUND_PRESETS.map((preset) => {
                        const isSelected = style.background.toLowerCase() === preset.value.toLowerCase();
                        return (
                            <button
                                key={preset.value}
                                onClick={() => onUpdate({ background: preset.value })}
                                aria-label={`${preset.name} background`}
                                aria-pressed={isSelected}
                                className={`relative w-9 h-9 rounded-full border-2 transition-all
                                    ${isSelected ? 'border-blue-500 scale-110' : 'border-slate-600 hover:border-slate-400'}`}
                                style={{ background: preset.value }}
                                title={preset.name}
                            >
                                {isSelected && (
                                    <Check className="w-4 h-4 absolute inset-0 m-auto" style={{ color: isLight(preset.value) ? '#000' : '#fff' }} />
                                )}
                            </button>
                        );
                    })}
                    <label className="relative w-9 h-9 rounded-full border-2 border-dashed border-slate-500 hover:border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden">
                        <input
                            type="color"
                            aria-label="Custom background color"
                            value={style.background}
                            onChange={(e) => onUpdate({ background: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Palette className="w-4 h-4 text-slate-400" />
                    </label>
                </div>
            </div>

            <SliderRow label="Photo gap" value={style.gap} min={0} max={24} step={1} unit="px" onChange={(v) => onUpdate({ gap: v })} />
            <SliderRow label="Corner radius" value={style.cornerRadius} min={0} max={32} step={1} unit="px" onChange={(v) => onUpdate({ cornerRadius: v })} />
            <SliderRow label="Outer padding" value={style.padding} min={0} max={40} step={1} unit="px" onChange={(v) => onUpdate({ padding: v })} />

            <button
                onClick={() => onUpdate({ background: '#ffffff', gap: 6, cornerRadius: 4, padding: 0 })}
                className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium flex items-center justify-center gap-2"
            >
                <X className="w-4 h-4" />
                Reset style
            </button>
        </div>
    );
}

function isLight(hex: string): boolean {
    const m = hex.replace('#', '');
    if (m.length < 6) return true;
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma > 0.6;
}

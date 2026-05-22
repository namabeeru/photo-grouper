'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
    ArrowLeft, Download, Loader2, RotateCcw, Repeat2,
    LayoutGrid, Sliders, Wand2, Palette,
    RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRightIcon,
    Check, X,
} from 'lucide-react';
import { CollageTemplate } from '@/utils/templates';
import {
    PhotoEdits,
    DEFAULT_EDITS,
    FILTER_OPTIONS,
    FilterId,
    editsToCssFilter,
    editsToTransform,
    CollageStyle,
    BACKGROUND_PRESETS,
} from '@/utils/photoEdits';

interface PhotoData {
    file: File;
    previewUrl: string;
}

interface CollageEditorProps {
    photos: PhotoData[];
    templates: CollageTemplate[];
    selectedTemplate: CollageTemplate;
    photoAssignments: Map<string, number>;
    selectedSlot: string | null;
    slotEdits: Map<string, PhotoEdits>;
    collageStyle: CollageStyle;
    isSaving: boolean;
    onTemplateSelect: (template: CollageTemplate) => void;
    onSlotClick: (slotId: string) => void;
    onSwapSlots: (slotA: string, slotB: string) => void;
    onUpdateSlotEdits: (slotId: string, updates: Partial<PhotoEdits>) => void;
    onResetSlotEdits: (slotId: string) => void;
    onApplyEditToAll: (updates: Partial<PhotoEdits>) => void;
    onUpdateStyle: (updates: Partial<CollageStyle>) => void;
    onSave: () => void;
    onCancel: () => void;
}

type Tab = 'layouts' | 'adjust' | 'filters' | 'style';

export default function CollageEditor({
    photos,
    templates,
    selectedTemplate,
    photoAssignments,
    selectedSlot,
    slotEdits,
    collageStyle,
    isSaving,
    onTemplateSelect,
    onSlotClick,
    onSwapSlots,
    onUpdateSlotEdits,
    onResetSlotEdits,
    onApplyEditToAll,
    onUpdateStyle,
    onSave,
    onCancel,
}: CollageEditorProps) {
    const [tab, setTab] = useState<Tab>('layouts');
    const [swapSource, setSwapSource] = useState<string | null>(null);

    // Reset swap mode if the layout changes — slot IDs may no longer exist.
    useEffect(() => {
        setSwapSource(null);
    }, [selectedTemplate.id]);

    const availableTemplates = useMemo(
        () => templates.filter((t) => t.slots.length === photos.length),
        [templates, photos.length]
    );

    const activeEdits: PhotoEdits = selectedSlot
        ? (slotEdits.get(selectedSlot) ?? DEFAULT_EDITS)
        : DEFAULT_EDITS;

    const handleSlotPress = useCallback((slotId: string) => {
        if (swapSource) {
            if (swapSource !== slotId) {
                onSwapSlots(swapSource, slotId);
            }
            setSwapSource(null);
            return;
        }
        onSlotClick(slotId);
    }, [swapSource, onSwapSlots, onSlotClick]);

    const beginSwap = useCallback(() => {
        if (!selectedSlot) return;
        setSwapSource(selectedSlot);
    }, [selectedSlot]);

    const cancelSwap = useCallback(() => setSwapSource(null), []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                </button>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
            </header>

            {/* Swap mode banner */}
            {swapSource && (
                <div className="px-4 py-2 bg-blue-600/80 text-center text-sm flex items-center justify-center gap-2">
                    <Repeat2 className="w-4 h-4" />
                    Tap another photo to swap positions
                    <button onClick={cancelSwap} className="ml-2 underline text-white/90">Cancel</button>
                </div>
            )}

            {/* Main Collage View */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md shadow-2xl overflow-hidden"
                    style={{
                        aspectRatio: selectedTemplate.aspectRatio,
                        background: collageStyle.background,
                        padding: collageStyle.padding,
                        borderRadius: collageStyle.cornerRadius,
                    }}
                >
                    <div className="relative w-full h-full">
                        {selectedTemplate.slots.map((slot) => {
                            const photoIndex = photoAssignments.get(slot.id);
                            const photo = photoIndex !== undefined ? photos[photoIndex] : null;
                            const isSelected = selectedSlot === slot.id && !swapSource;
                            const isSwapSource = swapSource === slot.id;
                            const edits = slotEdits.get(slot.id) ?? DEFAULT_EDITS;
                            const halfGap = collageStyle.gap / 2;

                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => handleSlotPress(slot.id)}
                                    className={`absolute transition-all duration-150 ${isSelected ? 'z-10' : ''}`}
                                    style={{
                                        left: `${slot.x}%`,
                                        top: `${slot.y}%`,
                                        width: `${slot.width}%`,
                                        height: `${slot.height}%`,
                                        padding: halfGap,
                                    }}
                                >
                                    <div
                                        className={`relative w-full h-full overflow-hidden bg-slate-200 transition-all
                                            ${isSelected ? 'ring-4 ring-blue-500' : ''}
                                            ${isSwapSource ? 'ring-4 ring-amber-400' : ''}`}
                                        style={{ borderRadius: collageStyle.cornerRadius }}
                                    >
                                        {photo && (
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
                                                    className="object-cover pointer-events-none"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className="bg-slate-800 border-t border-slate-700 safe-area-inset-bottom">
                {/* Tab bar */}
                <div className="flex border-b border-slate-700">
                    <TabButton active={tab === 'layouts'} onClick={() => setTab('layouts')} icon={<LayoutGrid className="w-4 h-4" />} label="Layouts" />
                    <TabButton active={tab === 'adjust'} onClick={() => setTab('adjust')} icon={<Sliders className="w-4 h-4" />} label="Adjust" />
                    <TabButton active={tab === 'filters'} onClick={() => setTab('filters')} icon={<Wand2 className="w-4 h-4" />} label="Filters" />
                    <TabButton active={tab === 'style'} onClick={() => setTab('style')} icon={<Palette className="w-4 h-4" />} label="Style" />
                </div>

                <div className="max-h-[42vh] overflow-y-auto">
                    {tab === 'layouts' && (
                        <LayoutsTab
                            templates={availableTemplates}
                            selectedTemplate={selectedTemplate}
                            onTemplateSelect={onTemplateSelect}
                        />
                    )}
                    {tab === 'adjust' && (
                        <AdjustTab
                            selectedSlot={selectedSlot}
                            edits={activeEdits}
                            onUpdate={(updates) => selectedSlot && onUpdateSlotEdits(selectedSlot, updates)}
                            onReset={() => selectedSlot && onResetSlotEdits(selectedSlot)}
                            onBeginSwap={beginSwap}
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
                    {tab === 'style' && (
                        <StyleTab style={collageStyle} onUpdate={onUpdateStyle} />
                    )}
                </div>
            </div>
        </div>
    );
}

/* ============================== Sub-components ============================== */

function TabButton({ active, onClick, icon, label }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors
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
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Layouts</p>
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-3 min-w-max">
                    {templates.map((template) => {
                        const isSelected = template.id === selectedTemplate.id;
                        return (
                            <button
                                key={template.id}
                                onClick={() => onTemplateSelect(template)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200
                                    ${isSelected
                                        ? 'ring-2 ring-blue-500 scale-110 bg-blue-500/20'
                                        : 'bg-slate-700 hover:bg-slate-600 opacity-70 hover:opacity-100'
                                    }`}
                                title={template.name}
                            >
                                <div className="absolute inset-1.5 bg-slate-600 rounded-md">
                                    {template.slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className={`absolute rounded-sm ${isSelected ? 'bg-blue-400' : 'bg-slate-400'}`}
                                            style={{
                                                left: `${slot.x}%`,
                                                top: `${slot.y}%`,
                                                width: `${Math.max(slot.width - 4, 2)}%`,
                                                height: `${Math.max(slot.height - 4, 2)}%`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{templates.length} layouts available</p>
        </div>
    );
}

function AdjustTab({
    selectedSlot, edits, onUpdate, onReset, onBeginSwap,
}: {
    selectedSlot: string | null;
    edits: PhotoEdits;
    onUpdate: (updates: Partial<PhotoEdits>) => void;
    onReset: () => void;
    onBeginSwap: () => void;
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
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
                <QuickButton onClick={() => onUpdate({ rotation: edits.rotation - ROT_STEP })} icon={<RotateCcw className="w-4 h-4" />} label="Rotate L" />
                <QuickButton onClick={() => onUpdate({ rotation: edits.rotation + ROT_STEP })} icon={<RotateCw className="w-4 h-4" />} label="Rotate R" />
                <QuickButton onClick={() => onUpdate({ scale: Math.min(3, edits.scale + SCALE_STEP) })} icon={<ZoomIn className="w-4 h-4" />} label="Zoom +" />
                <QuickButton onClick={() => onUpdate({ scale: Math.max(1, edits.scale - SCALE_STEP) })} icon={<ZoomOut className="w-4 h-4" />} label="Zoom −" />
                <QuickButton onClick={() => onUpdate({ offsetY: Math.max(-50, edits.offsetY - PAN_STEP) })} icon={<ArrowUp className="w-4 h-4" />} label="Up" />
                <QuickButton onClick={() => onUpdate({ offsetY: Math.min(50, edits.offsetY + PAN_STEP) })} icon={<ArrowDown className="w-4 h-4" />} label="Down" />
                <QuickButton onClick={() => onUpdate({ offsetX: Math.max(-50, edits.offsetX - PAN_STEP) })} icon={<ArrowLeftIcon className="w-4 h-4" />} label="Left" />
                <QuickButton onClick={() => onUpdate({ offsetX: Math.min(50, edits.offsetX + PAN_STEP) })} icon={<ArrowRightIcon className="w-4 h-4" />} label="Right" />
            </div>

            {/* Sliders */}
            <SliderRow label="Rotation" value={edits.rotation} min={-180} max={180} step={1} unit="°" onChange={(v) => onUpdate({ rotation: v })} />
            <SliderRow label="Zoom" value={edits.scale} min={1} max={3} step={0.01} format={(v) => `${v.toFixed(2)}x`} onChange={(v) => onUpdate({ scale: v })} />
            <SliderRow label="Brightness" value={edits.brightness} min={0.5} max={1.5} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ brightness: v })} />
            <SliderRow label="Contrast" value={edits.contrast} min={0.5} max={1.5} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ contrast: v })} />
            <SliderRow label="Saturation" value={edits.saturation} min={0} max={2} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => onUpdate({ saturation: v })} />
            <SliderRow label="Blur" value={edits.blur} min={0} max={6} step={0.1} unit="px" onChange={(v) => onUpdate({ blur: v })} />

            <div className="flex gap-2 pt-1">
                <button
                    onClick={onReset}
                    className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
                <button
                    onClick={onBeginSwap}
                    className="flex-1 py-2 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-slate-900 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <Repeat2 className="w-4 h-4" />
                    Swap photo
                </button>
            </div>
        </div>
    );
}

function QuickButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-xs"
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
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
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
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Filters</p>
                <button
                    onClick={() => onApplyAll(currentFilter)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                    <Check className="w-3.5 h-3.5" />
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
                            className={`group flex flex-col items-center gap-1 transition-transform ${isSelected ? 'scale-[1.04]' : ''}`}
                        >
                            <div className={`relative w-full aspect-square rounded-lg overflow-hidden bg-slate-700
                                ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-700 group-hover:ring-slate-500'}`}>
                                <div
                                    className="absolute inset-0"
                                    style={{ filter: editsToCssFilter(previewEdits) }}
                                >
                                    <Image
                                        src={selectedPhoto.previewUrl}
                                        alt={opt.label}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
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
                                className={`relative w-9 h-9 rounded-full border-2 transition-all
                                    ${isSelected ? 'border-blue-500 scale-110' : 'border-slate-600 hover:border-slate-400'}`}
                                style={{ background: preset.value }}
                                title={preset.name}
                            >
                                {isSelected && (
                                    <Check
                                        className="w-4 h-4 absolute inset-0 m-auto"
                                        style={{ color: isLight(preset.value) ? '#000' : '#fff' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                    <label className="relative w-9 h-9 rounded-full border-2 border-dashed border-slate-500 hover:border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden">
                        <input
                            type="color"
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
                className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-medium flex items-center justify-center gap-2"
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

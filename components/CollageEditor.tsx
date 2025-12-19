'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Download, Loader2, RotateCcw } from 'lucide-react';
import { CollageTemplate } from '@/utils/templates';

interface PhotoData {
    file: File;
    previewUrl: string;
}

interface CollageEditorProps {
    photos: PhotoData[];
    templates: CollageTemplate[];
    selectedTemplate: CollageTemplate;
    photoAssignments: Map<string, number>; // slotId -> photo index
    selectedSlot: string | null;
    isSaving: boolean;
    onTemplateSelect: (template: CollageTemplate) => void;
    onSlotClick: (slotId: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function CollageEditor({
    photos,
    templates,
    selectedTemplate,
    photoAssignments,
    selectedSlot,
    isSaving,
    onTemplateSelect,
    onSlotClick,
    onSave,
    onCancel,
}: CollageEditorProps) {
    // Filter templates to only show ones with EXACT photo count match
    const availableTemplates = templates.filter(
        (t) => t.slots.length === photos.length
    );

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
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
            </header>

            {/* Swap hint */}
            {selectedSlot && (
                <div className="px-4 py-2 bg-blue-600/80 text-center text-sm">
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Tap another photo to swap positions
                </div>
            )}

            {/* Main Collage View */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-xl overflow-hidden w-full max-w-md shadow-2xl"
                    style={{
                        aspectRatio: selectedTemplate.aspectRatio,
                    }}
                >
                    {selectedTemplate.slots.map((slot) => {
                        const photoIndex = photoAssignments.get(slot.id);
                        const photo = photoIndex !== undefined ? photos[photoIndex] : null;
                        const isSelected = selectedSlot === slot.id;

                        return (
                            <button
                                key={slot.id}
                                onClick={() => onSlotClick(slot.id)}
                                className={`absolute transition-all duration-200 ${isSelected ? 'ring-4 ring-blue-500 z-10' : ''
                                    }`}
                                style={{
                                    left: `${slot.x}%`,
                                    top: `${slot.y}%`,
                                    width: `${slot.width}%`,
                                    height: `${slot.height}%`,
                                }}
                            >
                                <div className="absolute inset-0.5 rounded-sm overflow-hidden bg-slate-200">
                                    {photo && (
                                        <Image
                                            src={photo.previewUrl}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Template Strip */}
            <div className="bg-slate-800 border-t border-slate-700">
                <div className="px-4 pt-3 pb-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Layouts</p>
                </div>
                <div className="overflow-x-auto pb-6 px-4">
                    <div className="flex gap-3 min-w-max">
                        {availableTemplates.map((template) => {
                            const isSelected = template.id === selectedTemplate.id;
                            return (
                                <button
                                    key={template.id}
                                    onClick={() => onTemplateSelect(template)}
                                    className={`
                                        relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200
                                        ${isSelected
                                            ? 'ring-2 ring-blue-500 scale-110 bg-blue-500/20'
                                            : 'bg-slate-700 hover:bg-slate-600 opacity-70 hover:opacity-100'
                                        }
                                    `}
                                >
                                    {/* Template preview */}
                                    <div className="absolute inset-1.5 bg-slate-600 rounded-md">
                                        {template.slots.map((slot) => (
                                            <div
                                                key={slot.id}
                                                className={`absolute rounded-sm ${isSelected ? 'bg-blue-400' : 'bg-slate-400'
                                                    }`}
                                                style={{
                                                    left: `${slot.x}%`,
                                                    top: `${slot.y}%`,
                                                    width: `${slot.width - 4}%`,
                                                    height: `${slot.height - 4}%`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

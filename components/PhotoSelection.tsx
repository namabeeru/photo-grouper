'use client';

import React from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface PhotoData {
    file: File;
    previewUrl: string;
}

interface PhotoSelectionProps {
    photos: PhotoData[];
    maxPhotos: number;
    onAddPhotos: () => void;
    onRemovePhoto: (index: number) => void;
    onGroupIt: () => void;
    isProcessing?: boolean;
    processingProgress?: { current: number; total: number };
}

export default function PhotoSelection({
    photos,
    maxPhotos,
    onAddPhotos,
    onRemovePhoto,
    onGroupIt,
    isProcessing = false,
    processingProgress = { current: 0, total: 0 },
}: PhotoSelectionProps) {
    const canAddMore = photos.length < maxPhotos;
    const canGroupIt = photos.length >= 2;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                    <div className="text-center">
                        <p className="text-white text-lg font-semibold">Optimizing photos...</p>
                        {processingProgress.total > 1 && (
                            <p className="text-slate-300 text-sm mt-1">
                                {processingProgress.current} of {processingProgress.total}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200">
                <h1 className="text-lg font-semibold text-slate-800">Select Photos</h1>
                <span className="text-sm text-slate-500">
                    {photos.length} of {maxPhotos}
                </span>
            </header>

            {/* Photo Grid */}
            <div className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
                    {/* Existing photos */}
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 shadow-sm"
                        >
                            <Image
                                src={photo.previewUrl}
                                alt={`Photo ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            {/* Remove button */}
                            <button
                                onClick={() => onRemovePhoto(index)}
                                className="absolute top-1.5 right-1.5 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {/* Photo number */}
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                                {index + 1}
                            </span>
                        </div>
                    ))}

                    {/* Add more button */}
                    {canAddMore && (
                        <button
                            onClick={onAddPhotos}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-all"
                        >
                            <Plus className="w-8 h-8 text-slate-400" />
                            <span className="text-xs text-slate-400">Add</span>
                        </button>
                    )}
                </div>

                {/* Empty state */}
                {photos.length === 0 && (
                    <div className="text-center mt-12">
                        <p className="text-slate-400">
                            Tap the + button to add photos
                        </p>
                    </div>
                )}

                {/* Helper text */}
                {photos.length > 0 && photos.length < 2 && (
                    <p className="text-center mt-6 text-sm text-slate-400">
                        Select at least 2 photos to create a collage
                    </p>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="p-4 bg-white border-t border-slate-200 safe-area-inset-bottom">
                <button
                    onClick={onGroupIt}
                    disabled={!canGroupIt}
                    className={`
                        w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2
                        ${canGroupIt
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 active:scale-[0.98]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    <Sparkles className="w-5 h-5" />
                    Group It!
                </button>
            </div>
        </div>
    );
}

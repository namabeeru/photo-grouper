'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ImagePlus, Loader2, Plus, Sparkles, X } from 'lucide-react';

import { PhotoData } from '@/types/photo';

interface PhotoSelectionProps {
    photos: PhotoData[];
    maxPhotos: number;
    onAddPhotos: () => void;
    onDropPhotos: (files: File[]) => void;
    onRemovePhoto: (index: number) => void;
    onGroupIt: () => void;
    onBack: () => void;
    isProcessing?: boolean;
    processingProgress?: { current: number; total: number };
}

export default function PhotoSelection({
    photos,
    maxPhotos,
    onAddPhotos,
    onDropPhotos,
    onRemovePhoto,
    onGroupIt,
    onBack,
    isProcessing = false,
    processingProgress = { current: 0, total: 0 },
}: PhotoSelectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const canAddMore = photos.length < maxPhotos;
    const canGroupIt = photos.length >= 2;

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (!canAddMore || isProcessing) return;
        const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
        if (files.length) onDropPhotos(files);
    };

    return (
        <main
            className="relative flex min-h-dvh flex-col bg-[#f7f8fb] text-slate-950"
            onDragEnter={(event) => { event.preventDefault(); if (canAddMore) setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
            }}
            onDrop={handleDrop}
        >
            {isProcessing && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/70 backdrop-blur-sm" role="status" aria-live="polite">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                    <div className="text-center">
                        <p className="text-base font-semibold text-white">Preparing your photos</p>
                        <p className="mt-1 text-sm text-slate-300">
                            {processingProgress.current} of {processingProgress.total}
                        </p>
                    </div>
                </div>
            )}

            {isDragging && (
                <div className="pointer-events-none fixed inset-3 z-40 flex items-center justify-center rounded-[2rem] border-2 border-dashed border-indigo-500 bg-indigo-50/95 backdrop-blur-sm">
                    <div className="text-center text-indigo-700">
                        <ImagePlus className="mx-auto h-10 w-10" />
                        <p className="mt-3 font-semibold">Drop photos to add them</p>
                    </div>
                </div>
            )}

            <header inert={isProcessing ? true : undefined} className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
                    <button onClick={onBack} aria-label="Back to home" className="-ml-2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="ml-2 flex-1">
                        <h1 className="text-base font-semibold tracking-tight text-slate-900">Choose your photos</h1>
                        <p className="hidden text-xs text-slate-500 sm:block">Pick the moments you want in one frame</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tabular-nums text-slate-600">
                        {photos.length} / {maxPhotos}
                    </span>
                </div>
            </header>

            <section inert={isProcessing ? true : undefined} className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Build your set</h2>
                    <p className="mt-1 text-sm text-slate-500">Add 2 to {maxPhotos} photos. You can adjust each crop in the next step.</p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4 md:grid-cols-5">
                    {photos.map((photo, index) => (
                        <div key={photo.previewUrl} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-slate-900/5">
                            <Image src={photo.previewUrl} alt={`Selected photo ${index + 1}`} fill unoptimized className="object-cover" sizes="(max-width: 640px) 33vw, 180px" />
                            <button
                                onClick={() => onRemovePhoto(index)}
                                aria-label={`Remove photo ${index + 1}`}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/65 text-white backdrop-blur-sm transition hover:bg-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-950/65 px-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                {index + 1}
                            </span>
                        </div>
                    ))}

                    {canAddMore && (
                        <button
                            onClick={onAddPhotos}
                            aria-label="Add photos"
                            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                <Plus className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-semibold">Add photos</span>
                        </button>
                    )}
                </div>

                {photos.length === 0 && (
                    <button
                        onClick={onAddPhotos}
                        className="mt-3 flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/70"
                    >
                        <ImagePlus className="h-9 w-9 text-indigo-500" />
                        <span className="mt-4 text-base font-semibold text-slate-800">Choose photos or drop them here</span>
                        <span className="mt-1 text-sm text-slate-500">JPG, PNG, WebP, HEIC, and other image formats</span>
                    </button>
                )}

                {photos.length === 1 && (
                    <p className="mt-5 text-sm font-medium text-amber-700" role="status">Add one more photo to continue.</p>
                )}
            </section>

            <footer inert={isProcessing ? true : undefined} className="sticky bottom-0 border-t border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl safe-area-inset-bottom">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
                    <p className="hidden text-sm text-slate-500 sm:block">Your originals are never uploaded.</p>
                    <button
                        onClick={onGroupIt}
                        disabled={!canGroupIt}
                        className="ml-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
                    >
                        <Sparkles className="h-4 w-4" />
                        Create collage
                    </button>
                </div>
            </footer>
        </main>
    );
}

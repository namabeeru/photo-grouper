'use client';

import React, { useRef } from 'react';
import PhotoSlot from './PhotoSlot';
import { CollageTemplate, SlotPosition } from '@/utils/templates';

interface PhotoData {
    file: File;
    previewUrl: string;
}

interface CollageCanvasProps {
    template: CollageTemplate;
    photos: Map<string, PhotoData>; // slotId -> photo
    onAddPhoto: (slotId: string) => void;
    onRemovePhoto: (slotId: string) => void;
}

export default function CollageCanvas({
    template,
    photos,
    onAddPhoto,
    onRemovePhoto
}: CollageCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-100">
            <div
                ref={containerRef}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-lg"
                style={{
                    aspectRatio: template.aspectRatio,
                }}
            >
                {/* Render each slot */}
                {template.slots.map((slot) => (
                    <PhotoSlot
                        key={slot.id}
                        slotId={slot.id}
                        photo={photos.get(slot.id) || null}
                        onAddPhoto={onAddPhoto}
                        onRemovePhoto={onRemovePhoto}
                        style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: `${slot.width}%`,
                            height: `${slot.height}%`,
                        }}
                    />
                ))}

                {/* White gap overlay for clean borders */}
                <div className="absolute inset-0 pointer-events-none">
                    {template.slots.map((slot, index) => (
                        <div
                            key={`border-${slot.id}`}
                            className="absolute border-2 border-white"
                            style={{
                                left: `${slot.x}%`,
                                top: `${slot.y}%`,
                                width: `${slot.width}%`,
                                height: `${slot.height}%`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

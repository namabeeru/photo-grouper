'use client';

import React, { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';

interface PhotoSlotProps {
    photo: { file: File; previewUrl: string } | null;
    slotId: string;
    onAddPhoto: (slotId: string) => void;
    onRemovePhoto: (slotId: string) => void;
    style: React.CSSProperties;
}

export default function PhotoSlot({
    photo,
    slotId,
    onAddPhoto,
    onRemovePhoto,
    style
}: PhotoSlotProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!photo) {
            onAddPhoto(slotId);
        }
    };

    return (
        <div
            className="absolute transition-all duration-300 ease-out"
            style={style}
        >
            <div
                className={`
          absolute inset-1 rounded-lg overflow-hidden transition-all
          ${photo
                        ? 'bg-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-400'
                    }
        `}
                onClick={handleClick}
            >
                {photo ? (
                    <>
                        <Image
                            src={photo.previewUrl}
                            alt="Photo"
                            fill
                            className="object-cover"
                        />
                        {/* Remove button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemovePhoto(slotId);
                            }}
                            className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors z-10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-2 rounded-full bg-slate-200">
                            <Plus className="w-5 h-5 text-slate-500" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { X, Download, Share } from 'lucide-react';

interface CollageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

export default function CollageModal({ isOpen, onClose, imageUrl }: CollageModalProps) {
    if (!isOpen || !imageUrl) return null;

    const handleDownload = async () => {
        if (!imageUrl) return;

        // Check for "Share" API support (common on mobile)
        if (navigator.share) {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'photo-grouper-collage.jpg', {
                    type: 'image/jpeg',
                });
                await navigator.share({
                    files: [file],
                    title: 'Photo Grouper Collage',
                });
                return;
            } catch (error) {
                console.warn('Sharing failed, falling back to download', error);
            }
        }

        // Fallback to link download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'photo-grouper-collage.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800">Your Collage</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt="Generated Collage"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Download className="w-5 h-5" />
                        <span>Save to Photos</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

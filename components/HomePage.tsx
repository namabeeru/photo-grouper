'use client';

import React from 'react';
import Image from 'next/image';

interface HomePageProps {
    onSelectPhotos: () => void;
}

export default function HomePage({ onSelectPhotos }: HomePageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100">
            {/* App Branding */}
            <div className="text-center mb-12">
                {/* Hero Logo */}
                <div className="mb-6">
                    <Image
                        src="/logo.png"
                        alt="Photo Grouper"
                        width={200}
                        height={200}
                        className="mx-auto drop-shadow-xl"
                        priority
                    />
                </div>

                {/* App Name */}
                <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
                    Photo Grouper
                </h1>

                {/* Privacy Tagline */}
                <p className="text-slate-500 text-lg max-w-xs mx-auto leading-relaxed">
                    Your photos, your device.
                    <br />
                    <span className="text-slate-400">Zero cloud uploads. Ever.</span>
                </p>
            </div>

            {/* Main CTA Button */}
            <button
                onClick={onSelectPhotos}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
                <span className="flex items-center gap-3">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    Select Photos
                </span>
            </button>

            {/* Feature badges */}
            <div className="mt-12 flex flex-wrap gap-3 justify-center">
                <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
                    🔒 100% Private
                </span>
                <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
                    📱 Works Offline
                </span>
                <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
                    ⚡ Instant Collages
                </span>
            </div>
        </div>
    );
}

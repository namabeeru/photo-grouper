'use client';

import React from 'react';
import Image from 'next/image';

interface HomePageProps {
    onSelectPhotos: () => void;
}

export default function HomePage({ onSelectPhotos }: HomePageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-purple-100/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100/30 to-cyan-100/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Hero Logo */}
                <div className="mb-6">
                    <Image
                        src="/logo.png"
                        alt="Photo Grouper"
                        width={400}
                        height={400}
                        className="mx-auto drop-shadow-xl"
                        priority
                    />
                </div>

                {/* App Name */}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-3 tracking-tight">
                    Photo Grouper
                </h1>

                {/* Privacy Tagline */}
                <p className="text-slate-500 text-lg max-w-xs mx-auto leading-relaxed mb-10">
                    Your photos, your device.
                    <br />
                    <span className="text-slate-400">Zero cloud uploads. Ever.</span>
                </p>

                {/* Main CTA Button - Refined gradient */}
                <button
                    onClick={onSelectPhotos}
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                >
                    <span className="flex items-center gap-3">
                        <svg
                            className="w-5 h-5 opacity-90"
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

                {/* Feature badges - Refined */}
                <div className="mt-10 flex flex-wrap gap-2 justify-center">
                    <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
                        🔒 100% Private
                    </span>
                    <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
                        📱 Works Offline
                    </span>
                    <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-100">
                        ⚡ Instant Collages
                    </span>
                </div>
            </div>
        </div>
    );
}

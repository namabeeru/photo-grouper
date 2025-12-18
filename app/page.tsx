'use client';

import React, { useState, useEffect } from 'react';
import DropZone from '@/components/DropZone';
import { X, Trash2, Download } from 'lucide-react';
import Image from 'next/image';

interface FileWithPreview {
  file: File;
  previewUrl: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);



  // Keep track of files ref for cleanup on unmount
  const filesRef = React.useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      filesRef.current.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, []);

  const handleFilesDropped = (droppedFiles: File[]) => {
    const newFiles = droppedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return (
    <main className="min-h-screen pb-32 font-[family-name:var(--font-sans)] bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Photo Grouper
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Drag and drop your photos to arrange them into a beautiful collage.
            <br />
            <span className="text-sm opacity-75">
              Private & Local-first. No cloud uploads.
            </span>
          </p>
        </header>

        {/* Drop Zone */}
        <section>
          <DropZone onFilesDropped={handleFilesDropped} />
        </section>

        {/* File Grid */}
        {files.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-slate-700 px-1">
              Selected Photos ({files.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="group relative aspect-square bg-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.file.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Actions Footer */}
      {files.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => {
                files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                setFiles([]);
              }}
              className="flex items-center gap-2 px-6 py-3 text-red-600 font-medium rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </button>
            <button
              disabled
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white font-medium rounded-full opacity-50 cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>Download Collage</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

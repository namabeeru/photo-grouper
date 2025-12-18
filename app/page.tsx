'use client';

import { useState } from 'react';
import DropZone from '@/components/DropZone';
import { FileIcon, X } from 'lucide-react';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesDropped = (droppedFiles: File[]) => {
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-sans)] bg-background text-foreground">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800">
            Photo Grouper
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

        {/* File List */}
        {files.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-700">
                Selected Photos ({files.length})
              </h2>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-2 bg-slate-100 rounded-md">
                    <FileIcon className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

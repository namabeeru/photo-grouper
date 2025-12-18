'use client';

import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
}

export default function DropZone({ onFilesDropped }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [onFilesDropped]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer
        ${
          isDragging
            ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white/80'
        }
      `}
    >
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-blue-500" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-700">
            {isDragging ? 'Drop images here' : 'Adrag & drop images'}
          </h3>
          <p className="text-sm text-gray-500">
            {isDragging ? 'Release to add' : 'Supports PNG, JPG, WEBP'}
          </p>
        </div>
      </div>
    </div>
  );
}

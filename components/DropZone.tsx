'use client';

import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
}

export default function DropZone({ onFilesDropped }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files).filter((file) =>
          file.type.startsWith('image/')
        );
        onFilesDropped(files);
      }
      // Reset input value so same files can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesDropped]
  );

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      className={`
        w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer
        ${isDragging
          ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
          : 'border-slate-300 hover:border-slate-400 bg-white/50 hover:bg-white/80'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept="image/*"
      />
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          {isDragging ? (
            <Upload className="w-8 h-8 text-blue-500" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Drop images here' : 'Tap to add photos'}
          </h3>
          <p className="text-sm text-slate-500">
            {isDragging ? 'Release to add' : 'Supports PNG, JPG, WEBP'}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import CollageCanvas from '@/components/CollageCanvas';
import TemplateStrip from '@/components/TemplateStrip';
import { TEMPLATES, CollageTemplate, getDefaultTemplate } from '@/utils/templates';
import { saveCollage } from '@/utils/collageGenerator';
import { Share, Download, Plus, Loader2, Image as ImageIcon } from 'lucide-react';

interface PhotoData {
  file: File;
  previewUrl: string;
}

export default function Home() {
  const [photos, setPhotos] = useState<Map<string, PhotoData>>(new Map());
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>(TEMPLATES[4]); // 4-grid default
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availablePhotos, setAvailablePhotos] = useState<PhotoData[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoCount = photos.size;

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      availablePhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const handleAddPhoto = (slotId: string) => {
    setActiveSlotId(slotId);
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (slotId: string) => {
    setPhotos((prev) => {
      const newMap = new Map(prev);
      const photo = newMap.get(slotId);
      if (photo) {
        // Add back to available photos
        setAvailablePhotos((availablePhotos) => [...availablePhotos, photo]);
      }
      newMap.delete(slotId);
      return newMap;
    });
  };

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    // If we have an active slot, fill it with the first photo
    if (activeSlotId && files.length > 0) {
      const firstFile = files[0];
      const photoData: PhotoData = {
        file: firstFile,
        previewUrl: URL.createObjectURL(firstFile),
      };

      setPhotos((prev) => {
        const newMap = new Map(prev);
        newMap.set(activeSlotId, photoData);
        return newMap;
      });

      // Add remaining files to available photos
      const remaining = files.slice(1).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setAvailablePhotos((prev) => [...prev, ...remaining]);
    } else {
      // Add all to available photos and auto-fill empty slots
      const newPhotos = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      // Auto-fill empty slots
      setPhotos((prev) => {
        const newMap = new Map(prev);
        let photoIndex = 0;

        for (const slot of selectedTemplate.slots) {
          if (!newMap.has(slot.id) && photoIndex < newPhotos.length) {
            newMap.set(slot.id, newPhotos[photoIndex]);
            photoIndex++;
          }
        }

        // Add remaining to available
        const remaining = newPhotos.slice(photoIndex);
        if (remaining.length > 0) {
          setAvailablePhotos((availablePhotos) => [...availablePhotos, ...remaining]);
        }

        return newMap;
      });
    }

    setActiveSlotId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [activeSlotId, selectedTemplate.slots]);

  const handleTemplateChange = (template: CollageTemplate) => {
    // Collect all current photos
    const allPhotos: PhotoData[] = [...availablePhotos];
    photos.forEach((photo) => allPhotos.push(photo));

    // Redistribute to new template
    const newPhotosMap = new Map<string, PhotoData>();
    let photoIndex = 0;

    for (const slot of template.slots) {
      if (photoIndex < allPhotos.length) {
        newPhotosMap.set(slot.id, allPhotos[photoIndex]);
        photoIndex++;
      }
    }

    // Remaining go to available
    const remaining = allPhotos.slice(photoIndex);

    setPhotos(newPhotosMap);
    setAvailablePhotos(remaining);
    setSelectedTemplate(template);
  };

  const handleSave = async () => {
    if (photoCount === 0) return;

    setIsSaving(true);
    try {
      await saveCollage(selectedTemplate, photos);
    } catch (error) {
      console.error('Failed to save collage:', error);
      alert('Failed to save collage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMorePhotos = () => {
    setActiveSlotId(null);
    fileInputRef.current?.click();
  };

  const canSave = photoCount > 0;

  return (
    <main className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept="image/*"
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-lg font-semibold">Collage</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Add more photos button */}
          <button
            onClick={handleAddMorePhotos}
            className="p-2.5 hover:bg-slate-700 rounded-full transition-colors"
            title="Add more photos"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Save/Share button */}
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
              ${canSave
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Share className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <CollageCanvas
        template={selectedTemplate}
        photos={photos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
      />

      {/* Available Photos Strip (if any) */}
      {availablePhotos.length > 0 && (
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">
            {availablePhotos.length} more {availablePhotos.length === 1 ? 'photo' : 'photos'} available
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {availablePhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => {
                  // Find first empty slot and fill it
                  const emptySlot = selectedTemplate.slots.find((s) => !photos.has(s.id));
                  if (emptySlot) {
                    setPhotos((prev) => {
                      const newMap = new Map(prev);
                      newMap.set(emptySlot.id, photo);
                      return newMap;
                    });
                    setAvailablePhotos((prev) => prev.filter((_, i) => i !== index));
                  }
                }}
                className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden ring-2 ring-slate-600 hover:ring-blue-400 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template Strip */}
      <div className="bg-slate-800 border-t border-slate-700">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-slate-400">Choose layout</p>
        </div>
        <TemplateStrip
          templates={TEMPLATES}
          selectedId={selectedTemplate.id}
          onSelect={handleTemplateChange}
        />
        {/* Safe area padding for notch devices */}
        <div className="h-2 sm:h-4" />
      </div>
    </main>
  );
}

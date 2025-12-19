'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import HomePage from '@/components/HomePage';
import PhotoSelection from '@/components/PhotoSelection';
import CollageEditor from '@/components/CollageEditor';
import { TEMPLATES, CollageTemplate, getDefaultTemplate, getTemplatesForPhotoCount } from '@/utils/templates';
import { saveCollage } from '@/utils/collageGenerator';

interface PhotoData {
  file: File;
  previewUrl: string;
}

type AppPhase = 'home' | 'selection' | 'editor';

const MAX_PHOTOS = 9;

export default function Home() {
  // Phase state
  const [phase, setPhase] = useState<AppPhase>('home');

  // Photo state
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Collage state
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>(TEMPLATES[0]);
  const [photoAssignments, setPhotoAssignments] = useState<Map<string, number>>(new Map());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  // ===== PHOTO SELECTION HANDLERS =====

  const handleSelectPhotos = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, MAX_PHOTOS - photos.length);

    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => {
      const combined = [...prev, ...newPhotos].slice(0, MAX_PHOTOS);
      return combined;
    });

    // Move to selection phase if on home
    if (phase === 'home') {
      setPhase('selection');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [phase, photos.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const photo = prev[index];
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ===== COLLAGE PHASE HANDLERS =====

  const handleGroupIt = useCallback(() => {
    if (photos.length < 2) return;

    // Get best template for photo count
    const template = getDefaultTemplate(photos.length);
    setSelectedTemplate(template);

    // Assign photos to slots
    const assignments = new Map<string, number>();
    template.slots.forEach((slot, index) => {
      if (index < photos.length) {
        assignments.set(slot.id, index);
      }
    });
    setPhotoAssignments(assignments);
    setSelectedSlot(null);
    setPhase('editor');
  }, [photos.length]);

  const handleTemplateSelect = useCallback((template: CollageTemplate) => {
    setSelectedTemplate(template);

    // Reassign photos to new template slots
    const assignments = new Map<string, number>();
    template.slots.forEach((slot, index) => {
      if (index < photos.length) {
        assignments.set(slot.id, index);
      }
    });
    setPhotoAssignments(assignments);
    setSelectedSlot(null);
  }, [photos.length]);

  const handleSlotClick = useCallback((slotId: string) => {
    if (!selectedSlot) {
      // First selection
      setSelectedSlot(slotId);
    } else if (selectedSlot === slotId) {
      // Deselect
      setSelectedSlot(null);
    } else {
      // Swap photos between slots
      setPhotoAssignments((prev) => {
        const newMap = new Map(prev);
        const photo1 = prev.get(selectedSlot);
        const photo2 = prev.get(slotId);

        if (photo1 !== undefined) {
          newMap.set(slotId, photo1);
        } else {
          newMap.delete(slotId);
        }

        if (photo2 !== undefined) {
          newMap.set(selectedSlot, photo2);
        } else {
          newMap.delete(selectedSlot);
        }

        return newMap;
      });
      setSelectedSlot(null);
    }
  }, [selectedSlot]);

  const handleSave = useCallback(async () => {
    if (photos.length === 0) return;

    setIsSaving(true);
    try {
      // Convert assignments to the format expected by saveCollage
      const photosMap = new Map<string, PhotoData>();
      photoAssignments.forEach((photoIndex, slotId) => {
        if (photos[photoIndex]) {
          photosMap.set(slotId, photos[photoIndex]);
        }
      });

      await saveCollage(selectedTemplate, photosMap);
    } catch (error) {
      console.error('Failed to save collage:', error);
      alert('Failed to save collage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [photos, photoAssignments, selectedTemplate]);

  const handleCancelEditor = useCallback(() => {
    setSelectedSlot(null);
    setPhase('selection');
  }, []);

  // ===== RENDER =====

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept="image/*"
      />

      {phase === 'home' && (
        <HomePage onSelectPhotos={handleSelectPhotos} />
      )}

      {phase === 'selection' && (
        <PhotoSelection
          photos={photos}
          maxPhotos={MAX_PHOTOS}
          onAddPhotos={handleSelectPhotos}
          onRemovePhoto={handleRemovePhoto}
          onGroupIt={handleGroupIt}
        />
      )}

      {phase === 'editor' && (
        <CollageEditor
          photos={photos}
          templates={getTemplatesForPhotoCount(photos.length)}
          selectedTemplate={selectedTemplate}
          photoAssignments={photoAssignments}
          selectedSlot={selectedSlot}
          isSaving={isSaving}
          onTemplateSelect={handleTemplateSelect}
          onSlotClick={handleSlotClick}
          onSave={handleSave}
          onCancel={handleCancelEditor}
        />
      )}
    </>
  );
}

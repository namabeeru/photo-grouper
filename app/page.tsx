'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import HomePage from '@/components/HomePage';
import PhotoSelection from '@/components/PhotoSelection';
import CollageEditor from '@/components/CollageEditor';
import InstallPrompt from '@/components/InstallPrompt';
import { TEMPLATES, CollageTemplate, getDefaultTemplate, getTemplatesForPhotoCount } from '@/utils/templates';
import { saveCollage } from '@/utils/collageGenerator';
import { PhotoEdits, DEFAULT_EDITS, CollageStyle, DEFAULT_STYLE } from '@/utils/photoEdits';

import { PhotoData } from '@/types/photo';

type AppPhase = 'home' | 'selection' | 'editor';

const MAX_PHOTOS = 9;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

const initAssignments = (template: CollageTemplate, photoCount: number) => {
  const assignments = new Map<string, number>();
  template.slots.forEach((slot, index) => {
    if (index < photoCount) {
      assignments.set(slot.id, index);
    }
  });
  return assignments;
};

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

  // Edits keyed by slot id (only persisted as long as a template is in use)
  const [slotEdits, setSlotEdits] = useState<Map<string, PhotoEdits>>(new Map());
  // Collage-wide style
  const [collageStyle, setCollageStyle] = useState<CollageStyle>(DEFAULT_STYLE);
  // Output aspect ratio override (null = follow the layout's own ratio)
  const [outputAspectRatio, setOutputAspectRatio] = useState<number | null>(null);

  // Processing state for image compression
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PhotoData[]>([]);
  const processingRef = useRef(false);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const editorTemplates = useMemo(
    () => getTemplatesForPhotoCount(photos.length),
    [photos.length]
  );

  // ===== PHOTO SELECTION HANDLERS =====

  const handleSelectPhotos = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processFiles = useCallback(async (incomingFiles: File[]) => {
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    const oversizedCount = imageFiles.filter((file) => file.size > MAX_SOURCE_BYTES).length;
    const files = imageFiles
      .filter((file) => file.size <= MAX_SOURCE_BYTES)
      .slice(0, MAX_PHOTOS - photos.length);

    if (oversizedCount > 0) {
      setImportNotice(`${oversizedCount} photo${oversizedCount === 1 ? '' : 's'} skipped because the file exceeded 25 MB.`);
    } else {
      setImportNotice(null);
    }

    if (files.length === 0 || processingRef.current) return;

    // Lock synchronously so two file/drop events in the same render cannot race.
    processingRef.current = true;

    if (phase === 'home') setPhase('selection');

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: files.length });

    const compressionOptions = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      libURL: '/browser-image-compression.js',
    };

    try {
      const newPhotos: PhotoData[] = [];
      let failedCount = 0;

      // Decode/compress sequentially to cap peak memory on mobile devices.
      for (const [index, original] of files.entries()) {
        try {
          const output = await imageCompression(original, compressionOptions);
          newPhotos.push({
            file: output,
            previewUrl: URL.createObjectURL(output),
          });
        } catch (error) {
          failedCount += 1;
          console.error('Failed to prepare image:', error);
        }
        setProcessingProgress({ current: index + 1, total: files.length });
      }

      if (failedCount > 0) {
        setImportNotice(`${failedCount} photo${failedCount === 1 ? '' : 's'} could not be decoded and ${failedCount === 1 ? 'was' : 'were'} skipped.`);
      }
      setPhotos((prev) => {
        const capacity = Math.max(0, MAX_PHOTOS - prev.length);
        const accepted = newPhotos.slice(0, capacity);
        newPhotos.slice(capacity).forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
        return [...prev, ...accepted];
      });
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  }, [phase, photos.length]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    await processFiles(files);
  }, [processFiles]);

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

    const template = getDefaultTemplate(photos.length);
    setSelectedTemplate(template);
    setPhotoAssignments(initAssignments(template, photos.length));
    setSlotEdits(new Map());
    setCollageStyle(DEFAULT_STYLE);
    setOutputAspectRatio(null);
    setSelectedSlot(null);
    setPhase('editor');
  }, [photos.length]);

  const handleTemplateSelect = useCallback((template: CollageTemplate) => {
    setSelectedTemplate(template);
    setPhotoAssignments(initAssignments(template, photos.length));
    setSelectedSlot(null);
    // Reset edits when layout changes — slot IDs may not map cleanly.
    setSlotEdits(new Map());
  }, [photos.length]);

  // Click-to-select. If the same slot is tapped again it toggles off.
  // Inline UI in the editor handles "swap" via an explicit action.
  const handleSlotClick = useCallback((slotId: string) => {
    setSelectedSlot((prev) => (prev === slotId ? null : slotId));
  }, []);

  const handleSwapSlots = useCallback((slotA: string, slotB: string) => {
    setPhotoAssignments((prev) => {
      const newMap = new Map(prev);
      const p1 = prev.get(slotA);
      const p2 = prev.get(slotB);
      if (p1 !== undefined) newMap.set(slotB, p1); else newMap.delete(slotB);
      if (p2 !== undefined) newMap.set(slotA, p2); else newMap.delete(slotA);
      return newMap;
    });
    // Also swap edits so the visual edit follows the photo.
    setSlotEdits((prev) => {
      const newMap = new Map(prev);
      const e1 = prev.get(slotA);
      const e2 = prev.get(slotB);
      if (e1) newMap.set(slotB, e1); else newMap.delete(slotB);
      if (e2) newMap.set(slotA, e2); else newMap.delete(slotA);
      return newMap;
    });
  }, []);

  const handleUpdateSlotEdits = useCallback((slotId: string, updates: Partial<PhotoEdits>) => {
    setSlotEdits((prev) => {
      const newMap = new Map(prev);
      const current = prev.get(slotId) ?? DEFAULT_EDITS;
      newMap.set(slotId, { ...current, ...updates });
      return newMap;
    });
  }, []);

  const handleResetSlotEdits = useCallback((slotId: string) => {
    setSlotEdits((prev) => {
      const newMap = new Map(prev);
      newMap.delete(slotId);
      return newMap;
    });
  }, []);

  // Apply the same edit (filter/preset) to every slot.
  const handleApplyEditToAll = useCallback((updates: Partial<PhotoEdits>) => {
    setSlotEdits((prev) => {
      const newMap = new Map(prev);
      selectedTemplate.slots.forEach((slot) => {
        const current = newMap.get(slot.id) ?? DEFAULT_EDITS;
        newMap.set(slot.id, { ...current, ...updates });
      });
      return newMap;
    });
  }, [selectedTemplate]);

  const handleUpdateStyle = useCallback((updates: Partial<CollageStyle>) => {
    setCollageStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSetAspectRatio = useCallback((ratio: number | null) => {
    setOutputAspectRatio(ratio);
  }, []);

  const handleSave = useCallback(async () => {
    if (photos.length === 0) return;

    setIsSaving(true);
    try {
      const photosMap = new Map<string, PhotoData>();
      photoAssignments.forEach((photoIndex, slotId) => {
        if (photos[photoIndex]) {
          photosMap.set(slotId, photos[photoIndex]);
        }
      });

      await saveCollage(selectedTemplate, photosMap, slotEdits, collageStyle, outputAspectRatio);
    } catch (error) {
      console.error('Failed to save collage:', error);
      alert('Failed to save collage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [photos, photoAssignments, selectedTemplate, slotEdits, collageStyle, outputAspectRatio]);

  const handleCancelEditor = useCallback(() => {
    setSelectedSlot(null);
    setPhase('selection');
  }, []);

  const handleBackToHome = useCallback(() => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    photosRef.current = [];
    setPhotos([]);
    setPhotoAssignments(new Map());
    setSlotEdits(new Map());
    setSelectedSlot(null);
    setPhase('home');
  }, [photos]);

  // ===== RENDER =====

  return (
    <>
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
          onDropPhotos={processFiles}
          onRemovePhoto={handleRemovePhoto}
          onGroupIt={handleGroupIt}
          onBack={handleBackToHome}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          importNotice={importNotice}
        />
      )}

      {phase === 'editor' && (
        <CollageEditor
          photos={photos}
          templates={editorTemplates}
          selectedTemplate={selectedTemplate}
          photoAssignments={photoAssignments}
          selectedSlot={selectedSlot}
          slotEdits={slotEdits}
          collageStyle={collageStyle}
          outputAspectRatio={outputAspectRatio}
          isSaving={isSaving}
          onTemplateSelect={handleTemplateSelect}
          onSlotClick={handleSlotClick}
          onSwapSlots={handleSwapSlots}
          onUpdateSlotEdits={handleUpdateSlotEdits}
          onResetSlotEdits={handleResetSlotEdits}
          onApplyEditToAll={handleApplyEditToAll}
          onUpdateStyle={handleUpdateStyle}
          onSetAspectRatio={handleSetAspectRatio}
          onSave={handleSave}
          onCancel={handleCancelEditor}
        />
      )}

      <InstallPrompt enabled={phase !== 'editor'} />
    </>
  );
}

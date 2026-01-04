'use client';

import { useState } from 'react';
import { uploadToTemporaryBucket, deleteFromTemporaryBucket } from '@/lib/supabase/storage';
import { TemporaryMedia } from '@/types/TemporaryMedia';

export function useTemporaryUpload(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryMedia, setTemporaryMedia] = useState<TemporaryMedia | null>(null);

  const upload = async (file: File): Promise<TemporaryMedia | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando upload:', file.name);
      const media = await uploadToTemporaryBucket(userId, file);
      setTemporaryMedia(media);
      console.log('✅ Upload completado');
      return media;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error en upload:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      await deleteFromTemporaryBucket(filePath);
      setTemporaryMedia(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    }
  };

  const reset = () => {
    setTemporaryMedia(null);
    setError(null);
  };

  return {
    upload,
    deleteFile,
    reset,
    loading,
    error,
    temporaryMedia,
  };
}

import { supabase } from './client';
import { TemporaryMedia } from '@/types/TemporaryMedia';

/**
 * Validar que el archivo sea una imagen o video soportado
 */
export function validateMediaFile(file: File): {
  valid: boolean;
  error?: string;
  mediaType?: 'image' | 'video';
} {
  const maxSizes = {
    image: 50 * 1024 * 1024, // 50MB para imágenes
    video: 500 * 1024 * 1024, // 500MB para videos
  };

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

  let mediaType: 'image' | 'video' = 'image';
  if (allowedImageTypes.includes(file.type)) {
    mediaType = 'image';
  } else if (allowedVideoTypes.includes(file.type)) {
    mediaType = 'video';
  } else {
    return {
      valid: false,
      error: 'Tipo de archivo no soportado. Usa imágenes (JPEG, PNG, WebP, GIF) o videos (MP4, MOV, AVI)',
    };
  }

  if (file.size > maxSizes[mediaType]) {
    return {
      valid: false,
      error: `Archivo demasiado grande. Máximo: ${maxSizes[mediaType] / (1024 * 1024)}MB`,
    };
  }

  return { valid: true, mediaType };
}

/**
 * Subir archivo a bucket temporal (Storage only)
 * NO inserta en BD - solo Storage
 */
export async function uploadToTemporaryBucket(
  userId: string,
  file: File
): Promise<TemporaryMedia> {
  try {
    // Validar archivo
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Validación de archivo fallida');
    }

    // Generar ruta única
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomStr}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    console.log('📤 Subiendo archivo:', filePath);

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads-temp')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    console.log('✅ Archivo subido a Storage');

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('uploads-temp')
      .getPublicUrl(filePath);

    // Retornar metadata
    const result: TemporaryMedia = {
      id: fileName,
      path: filePath,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      mediaType: validation.mediaType!,
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      publicUrl: publicUrlData.publicUrl,
    };

    console.log('✅ Metadata:', result);
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error:', msg);
    throw new Error(`No se pudo subir el archivo: ${msg}`);
  }
}

/**
 * Eliminar archivo temporal de Storage
 */
export async function deleteFromTemporaryBucket(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('uploads-temp')
      .remove([filePath]);

    if (error) {
      console.warn(`Advertencia al eliminar: ${error.message}`);
    } else {
      console.log('✅ Archivo eliminado');
    }
  } catch (error) {
    console.warn('Error al eliminar:', error);
  }
}

/**
 * Obtener URL pública de archivo
 */
export function getTemporaryMediaUrl(filePath: string): string {
  const { data } = supabase.storage.from('uploads-temp').getPublicUrl(filePath);
  return data.publicUrl;
}

'use client';

import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

export type ImageStorageEvent =
  | {
      type: 'upload';
      newUrl: string;
      storagePath: string;
      previousUrl?: string | null;
      businessId: number;
    }
  | {
      type: 'delete';
      previousUrl?: string | null;
      businessId: number;
    };

interface ImageUploadProps {
  currentImage: string | null;
  onImageChange: (url: string | null) => void;
  productName: string;
  businessId: number;
  productId: string;
  logoSize?: number;
  onLogoSizeChange?: (size: number) => void;
  logoOffsetX?: number;
  onLogoOffsetXChange?: (offset: number) => void;
  logoOffsetY?: number;
  onLogoOffsetYChange?: (offset: number) => void;
  logoMode?: string;
  onStorageEvent?: (event: ImageStorageEvent) => void;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  productName,
  businessId,
  productId,
  logoSize = 100,
  onLogoSizeChange,
  logoOffsetX = 0,
  onLogoOffsetXChange,
  logoOffsetY = 0,
  onLogoOffsetYChange,
  logoMode = 'logo-name',
  onStorageEvent,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  type OptimizationStatus =
    | { state: 'optimized'; format: 'webp' | 'jpeg'; savingsPct?: number }
    | { state: 'original' }
    | null;

  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabaseBaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const supabaseStorageBaseUrl = supabaseBaseUrl
    ? `${supabaseBaseUrl}/storage/v1/object/public/menu-images/`
    : '';
  const isSupabaseStorageImage = (url?: string | null) => {
    if (!url || !supabaseStorageBaseUrl) return false;
    return url.startsWith(supabaseStorageBaseUrl);
  };

  const MAX_OUTPUT_SIZE = 640; // px
  const JPEG_QUALITY = 0.8;
  const WEBP_QUALITY = 0.75;

  const encodeCanvas = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));

  const optimizeImageFile = async (
    file: File
  ): Promise<{ file: File; optimized: boolean; format?: 'webp' | 'jpeg'; savingsPct?: number }> => {
    try {
      const imageBitmap = await createImageBitmap(file);

      const shortestEdge = Math.min(imageBitmap.width, imageBitmap.height);
      const cropSize = shortestEdge;
      const outputSize = Math.min(MAX_OUTPUT_SIZE, cropSize);

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        imageBitmap.close();
        return { file, optimized: false };
      }

      const offsetX = (imageBitmap.width - cropSize) / 2;
      const offsetY = (imageBitmap.height - cropSize) / 2;

      ctx.drawImage(
        imageBitmap,
        offsetX,
        offsetY,
        cropSize,
        cropSize,
        0,
        0,
        outputSize,
        outputSize
      );

      imageBitmap.close();

      let optimizedBlob = await encodeCanvas(canvas, 'image/webp', WEBP_QUALITY);
      let format: 'webp' | 'jpeg' | undefined = optimizedBlob ? 'webp' : undefined;

      if (!optimizedBlob) {
        optimizedBlob = await encodeCanvas(canvas, 'image/jpeg', JPEG_QUALITY);
        format = optimizedBlob ? 'jpeg' : undefined;
      }

      if (!optimizedBlob || !format) {
        return { file, optimized: false };
      }

      const extension = format === 'webp' ? 'webp' : 'jpg';
      const optimizedFile = new File([
        optimizedBlob,
      ], `${file.name.replace(/\.[^.]+$/, '')}-optimized.${extension}`, {
        type: optimizedBlob.type,
        lastModified: Date.now(),
      });

      const savingsPct = Math.max(0, Math.round((1 - optimizedBlob.size / file.size) * 100));

      return { file: optimizedFile, optimized: true, format, savingsPct };
    } catch (error) {
      console.warn('No se pudo optimizar la imagen, usando archivo original.', error);
      return { file, optimized: false };
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('El archivo debe ser una imagen (PNG o JPG)');
      return;
    }

  setOptimizationStatus(null);
  setUploading(true);

    try {
      // Obtener token del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Debes estar autenticado para subir imágenes');
        setUploading(false);
        return;
      }

  const { file: optimizedFile, optimized, format, savingsPct } = await optimizeImageFile(file);

      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('productName', productName);
      formData.append('businessId', businessId.toString());
      formData.append('productId', productId);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const previousUrl = currentImage;
        onImageChange(data.url);
        if (data.path) {
          onStorageEvent?.({
            type: 'upload',
            newUrl: data.url,
            storagePath: data.path,
            previousUrl: isSupabaseStorageImage(previousUrl) ? previousUrl : undefined,
            businessId,
          });
        }
        if (optimized) {
          setOptimizationStatus({ state: 'optimized', format: format ?? 'jpeg', savingsPct });
        } else {
          setOptimizationStatus({ state: 'original' });
        }
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (uploading) return;
    const previousUrl = currentImage;
    onImageChange(null);
  setOptimizationStatus(null);
    if (previousUrl && isSupabaseStorageImage(previousUrl)) {
      onStorageEvent?.({ type: 'delete', previousUrl, businessId });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Contenedor principal: foto + sliders lado a lado */}
      <div className="flex gap-4">
        {/* Columna izquierda: Foto */}
        <div className="flex flex-col items-start">
          <div className="relative inline-block">
            {/* Preview */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl">📷</div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-1 bg-white/90 hover:bg-white text-blue-600 rounded-lg transition disabled:opacity-50"
                  title="Subir imagen"
                >
                  <Upload size={16} />
                </button>
                {currentImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="p-1 bg-white/90 hover:bg-white text-red-600 rounded-lg transition disabled:opacity-50"
                    title="Eliminar imagen"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin text-2xl">⏳</div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <p className="text-xs text-gray-600 mt-2">
            {currentImage ? (
              <span className="text-green-600 font-bold">
                ✓ Imagen cargada{' '}
                {optimizationStatus?.state === 'optimized' && (
                  <span>
                    (optimizada{optimizationStatus.format ? ` · ${optimizationStatus.format.toUpperCase()}` : ''}
                    {typeof optimizationStatus.savingsPct === 'number'
                      ? ` · -${optimizationStatus.savingsPct}%`
                      : ''})
                  </span>
                )}
                {optimizationStatus?.state === 'original' && <span>(original)</span>}
              </span>
            ) : (
              <span>PNG o JPG (máx 5MB)</span>
            )}
          </p>
        </div>

        {/* Columna derecha: Sliders para ajustar tamaño y posición del logo */}
        {currentImage && (productName === 'Logo' || productName === 'restaurant-logo') && (
          <div className="flex-1 space-y-3 text-sm">
          {/* Slider Tamaño */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Tamaño: {logoSize}%</label>
            <input
              type="range"
              min="50"
              max="200"
              value={logoSize}
              onChange={(e) => onLogoSizeChange?.(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pequeño</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Sliders de posición - condicional según el modo */}
          {logoMode === 'logo-only' ? (
            <>
              <p className="text-xs text-gray-600 font-semibold">Posición del Logo</p>
              
              {/* Modo Solo Logo - Slider Horizontal */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Posición Horizontal: {logoOffsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={logoOffsetX}
                  onChange={(e) => onLogoOffsetXChange?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>← Izquierda</span>
                  <span>Derecha →</span>
                </div>
              </div>

              {/* Modo Solo Logo - Slider Vertical */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Posición Vertical: {logoOffsetY}px</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={logoOffsetY}
                  onChange={(e) => onLogoOffsetYChange?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>↑ Arriba</span>
                  <span>Abajo ↓</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 font-semibold">Posición del Logo</p>
              
              {/* Modo Logo + Nombre - Slider Horizontal */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Posición Horizontal: {logoOffsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={logoOffsetX}
                  onChange={(e) => onLogoOffsetXChange?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>← Izquierda</span>
                  <span>Derecha →</span>
                </div>
              </div>

              {/* Modo Logo + Nombre - Slider Vertical */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Posición Vertical: {logoOffsetY}px</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={logoOffsetY}
                  onChange={(e) => onLogoOffsetYChange?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>↑ Arriba</span>
                  <span>Abajo ↓</span>
                </div>
              </div>
            </>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

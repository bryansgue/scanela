'use client';

import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

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
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setUploading(true);

    try {
      // Obtener token del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Debes estar autenticado para subir imágenes');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
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
        onImageChange(data.url);
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
                    onClick={() => onImageChange(null)}
                    className="p-1 bg-white/90 hover:bg-white text-red-600 rounded-lg transition"
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
              <span className="text-green-600 font-bold">✓ Imagen cargada</span>
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

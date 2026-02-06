'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useMemo, useState, useEffect } from 'react';

export type QRDownloadOnlyProps = {
  menuId: number;
  businessName: string;
  shareUrl: string;
};

/**
 * Componente para descargar solo el código QR como imagen PNG
 */
export default function QRDownloadOnly({
  menuId,
  businessName,
  shareUrl,
}: QRDownloadOnlyProps) {
  const canvasId = useMemo(() => `qr-canvas-only-${menuId}`, [menuId]);
  const filename = useMemo(() => {
    const base = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${base || 'menu'}-qr.png`;
  }, [businessName]);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadQR = () => {
    if (isGeneratingImage) return;
    
    const qrCanvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!qrCanvas) {
      alert('No pudimos encontrar el QR para descargar.');
      return;
    }

    try {
      setIsGeneratingImage(true);
      const url = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando QR:', error);
      alert('Error al descargar el QR. Intenta de nuevo.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Previsualización */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 flex justify-center">
        {/* Canvas invisible para captura */}
        <div style={{ display: 'none' }}>
          <QRCodeCanvas
            id={canvasId}
            value={shareUrl}
            size={512}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {/* QR visible en previsualización */}
        <QRCodeCanvas
          value={shareUrl}
          size={256}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      {/* Información y botón */}
      <div className="text-center space-y-4">
        <div className="text-sm text-gray-600">
          <p className="font-semibold">Código QR Único</p>
          <p className="text-xs">Descarga como PNG de alta calidad (512 × 512 px)</p>
        </div>

        <button
          onClick={handleDownloadQR}
          disabled={isGeneratingImage}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isGeneratingImage
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
          }`}
        >
          {isGeneratingImage ? (
            <>
              <div className="animate-spin text-lg">⏳</div>
              Descargando...
            </>
          ) : (
            <>
              📥 Descargar QR (PNG)
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 max-w-md mx-auto">
          El QR se descargará como archivo PNG de 512 × 512 píxeles. Ideal para redes sociales o uso digital.
        </p>
      </div>
    </div>
  );
}

'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useMemo, useState, useEffect, useRef } from 'react';

export type PrintableA6QRCardProps = {
  menuId: number;
  businessName: string;
  shareUrl: string;
};

/**
 * Tarjeta QR vertical compacta para impresión
 * Tamaño: 100 × 120 mm (ancho reducido)
 * Diseño: Blanco, alto contraste, sans-serif
 * Contenido: "MENÚ DIGITAL", "Escanea para ver", QR code
 */
export default function PrintableA6QRCard({
  menuId,
  businessName,
  shareUrl,
}: PrintableA6QRCardProps) {
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const canvasId = useMemo(() => `qr-canvas-compact-${menuId}`, [menuId]);
  const filename = useMemo(() => {
    const base = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return base || 'menu';
  }, [businessName]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;

    const qrCanvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!qrCanvas) {
      alert('No pudimos encontrar el QR para generar el PDF.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const { jsPDF } = await import('jspdf');

      // Documento vertical compacto (100 × 120 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 120],
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fondo blanco general
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Tarjeta centrada con borde
    const cardMarginX = 6; // mm
    const cardMarginY = 8; // mm
    const cardWidth = pageWidth - cardMarginX * 2;
    const cardHeight = pageHeight - cardMarginY * 2;
    const cardX = cardMarginX;
    const cardY = cardMarginY;

      pdf.setLineWidth(0.6);
      pdf.setDrawColor(27, 36, 48);
    pdf.rect(cardX, cardY, cardWidth, cardHeight);

      // Contenido dentro de la tarjeta
    const contentPaddingTop = 12;
    let cursorY = cardY + contentPaddingTop;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
      pdf.setTextColor(15, 23, 42);
      pdf.text('MENÚ DIGITAL', pageWidth / 2, cursorY, { align: 'center' });

      cursorY += 9;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Escanea para ver', pageWidth / 2, cursorY, { align: 'center' });

    cursorY += 10;

    const qrSize = 64; // mm
    const qrX = (pageWidth - qrSize) / 2;
      const qrY = cursorY;
      const qrData = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);

    // Espacio final
    cursorY = qrY + qrSize + 8;

    pdf.save(`${filename}-qr-compact.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (isGeneratingPng || !cardInnerRef.current) return;

    try {
      setIsGeneratingPng(true);
      const html2canvas = (await import('html2canvas')).default;

      // Usar html2canvas para capturar solo la tarjeta A6
      const canvas = await html2canvas(cardInnerRef.current, {
        scale: 3, // Alta resolución
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
    link.download = `${filename}-qr-compact.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando PNG:', error);
      alert('Error al descargar la imagen PNG. Intenta de nuevo.');
    } finally {
      setIsGeneratingPng(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      {/* Previsualización */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg" style={{ maxWidth: '360px', width: '100%' }}>
        {/* Simulación de tarjeta vertical compacta */}
        <div 
          ref={cardInnerRef}
          className="bg-white border-2 border-gray-800 mx-auto"
          style={{
            width: '64mm',
            height: '77mm',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8mm 5mm 9mm',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {/* Título */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '18pt',
              fontWeight: 'bold',
              color: '#0f172a',
              margin: '0 0 2mm 0',
              letterSpacing: '-0.5pt',
            }}>
              MENÚ DIGITAL
            </h1>
            
            {/* Subtítulo */}
            <p style={{
              fontSize: '8pt',
              fontWeight: 'normal',
              color: '#334155',
              margin: '0 0 3mm 0',
            }}>
              Escanea para ver
            </p>
          </div>

          {/* QR Code - Canvas invisible para captura */}
          <div style={{ display: 'none' }}>
            <QRCodeCanvas
              id={canvasId}
              value={shareUrl}
              size={256}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* QR Code visible en previsualización */}
          <div style={{
            width: '42mm',
            height: '42mm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}>
            <QRCodeCanvas
              value={shareUrl}
              size={168}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
        </div>
      </div>

      {/* Información y botones */}
      <div className="text-center space-y-4 px-4 w-full">
        <div className="text-sm text-gray-600">
          <p className="font-semibold">Tarjeta de Menú Digital Estrecha</p>
          <p className="text-xs">100 × 120 mm • Menos ancho, mismo alto</p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf || isGeneratingPng}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              isGeneratingPdf || isGeneratingPng
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-105 cursor-pointer'
            }`}
          >
            {isGeneratingPdf ? (
              <>
                <div className="animate-spin text-lg">⏳</div>
                Generando PDF...
              </>
            ) : (
              <>
                📥 Descargar PDF
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 max-w-md mx-auto px-2">
          El PDF está optimizado para impresión vertical de 100 × 120 mm con ancho reducido. Usa la configuración de impresión "Sin márgenes" o "Ajustar a página".
        </p>
      </div>
    </div>
  );
}

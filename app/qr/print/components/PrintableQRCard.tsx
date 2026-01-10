'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useMemo, useState, useEffect } from 'react';
import type { QRThemePreset } from '../themePresets';

export type PrintableQRCardProps = {
  menuId: number;
  businessName: string;
  subtitle?: string;
  shareUrl: string;
  themePreset: QRThemePreset;
};

const formatUrlForDisplay = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname + parsed.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
};

export default function PrintableQRCard({
  menuId,
  businessName,
  subtitle = 'Escanea para ver el menú',
  shareUrl,
  themePreset,
}: PrintableQRCardProps) {
  const canvasId = useMemo(() => `qr-canvas-${menuId}`, [menuId]);
  const filename = useMemo(() => {
    const base = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${base || 'menu'}-qr.png`;
  }, [businessName]);

  const [tableLabel, setTableLabel] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const neutralColors = {
    pageBg: '#f8fafc',
    cardBg: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    mutedText: '#94a3b8',
    border: '#e2e8f0',
    mutedBg: '#f1f5f9',
    badgeBg: '#000000',
  } as const;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sanitizedLabel = (isClient ? tableLabel : '').trim();
  const effectiveLabel = sanitizedLabel;
  const tableOverlayText = useMemo(() => {
    if (!effectiveLabel) return '';
    const trimmed = effectiveLabel.trim().toUpperCase();
    return trimmed.length > 18 ? `${trimmed.slice(0, 17)}…` : trimmed;
  }, [effectiveLabel]);
  const qrUrl = useMemo(() => {
    if (!effectiveLabel) return shareUrl;
    const suffix = `table=${encodeURIComponent(effectiveLabel)}`;
    return `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}${suffix}`;
  }, [shareUrl, effectiveLabel]);

  const handleDownload = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  const displayUrl = formatUrlForDisplay(qrUrl);

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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const cardX = margin;
      const cardY = margin;
      const cardWidth = pageWidth - margin * 2;
      const cardHeight = pageHeight - margin * 2;

      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 10, 10, 'FD');

      let cursorY = cardY + 26;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(15, 23, 42);
      pdf.text(businessName, pageWidth / 2, cursorY, { align: 'center' });

      cursorY += 12;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(13);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Escanea este QR para ver el menú digital', pageWidth / 2, cursorY, { align: 'center' });

      if (effectiveLabel) {
        cursorY += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(51, 65, 85);
        pdf.text(`Mesa: ${effectiveLabel}`, pageWidth / 2, cursorY, { align: 'center' });
      }

      cursorY += 18;
      const qrSize = Math.min(120, cardWidth - 60);
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = cursorY;
      const qrData = qrCanvas.toDataURL('image/png');
      pdf.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);

      if (tableOverlayText) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        const textWidth = pdf.getTextWidth(tableOverlayText);
        const paddingX = 14;
        const overlayWidth = Math.min(qrSize - 8, textWidth + paddingX * 2);
        const overlayHeight = 26;
        const overlayX = (pageWidth - overlayWidth) / 2;
        const overlayY = qrY + qrSize / 2 - overlayHeight / 2;

        pdf.setFillColor(0, 0, 0);
        pdf.setDrawColor(0, 0, 0);
        pdf.roundedRect(overlayX, overlayY, overlayWidth, overlayHeight, 5, 5, 'FD');

        pdf.setTextColor(255, 255, 255);
        pdf.text(tableOverlayText, pageWidth / 2, overlayY + overlayHeight - 8, { align: 'center' });
      }

      cursorY = qrY + qrSize + 18;
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(displayUrl, pageWidth / 2, cursorY, { align: 'center' });

      const baseName = filename.replace(/\.png$/, '') || 'qr-menu';
      pdf.save(`${baseName}.pdf`);
    } catch (error) {
      console.error('Error generando PDF del QR', error);
      alert('No pudimos generar el PDF. Intenta nuevamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      className="min-h-screen print:bg-white"
      style={{ backgroundColor: neutralColors.pageBg, color: neutralColors.textPrimary }}
    >
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 print:py-0">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border print:shadow-none"
          style={{ backgroundColor: neutralColors.cardBg, borderColor: neutralColors.border }}
        >
          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-center">
            <div>
              <span
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full"
                style={{
                  background: themePreset.background,
                  border: `1px solid ${themePreset.border}`,
                  color: themePreset.text,
                }}
              >
                Código QR oficial
              </span>

              <h1
                className="mt-6 text-4xl font-black tracking-tight"
                style={{ color: neutralColors.textPrimary }}
              >
                {businessName}
              </h1>
              <p className="mt-2 text-lg" style={{ color: neutralColors.textSecondary }}>
                {subtitle}
              </p>
              <p className="mt-2 text-base" style={{ color: neutralColors.textSecondary }}>
                Este QR pertenece a <strong>{businessName}</strong>. Colócalo en cada mesa para que tus clientes accedan al menú en segundos.
              </p>

              <div className="mt-6 space-y-2">
                <p
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: neutralColors.mutedText }}
                >
                  URL del menú
                </p>
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-mono break-all"
                  style={{ color: neutralColors.textPrimary }}
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-bold"
                    style={{
                      background: themePreset.primary,
                      boxShadow: `0 10px 25px -12px ${themePreset.primary}`,
                    }}
                  >
                    ↗
                  </span>
                  {displayUrl}
                </a>
                <p className="text-sm" style={{ color: neutralColors.textSecondary }}>
                  Cualquier cambio que hagas en tu menú se reflejará automáticamente al escanear este QR. Si indicas la mesa, quedará registrado en la URL.
                </p>
              </div>

              {isClient && (
                <div className="mt-6 print:hidden">
                  <label
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: neutralColors.textPrimary }}
                  >
                    Etiqueta de mesa (opcional)
                    <span className="text-xs font-normal" style={{ color: neutralColors.mutedText }}>
                      Ej. Mesa 4, Terraza A
                    </span>
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      type="text"
                      value={tableLabel}
                      onChange={(e) => setTableLabel(e.target.value)}
                      placeholder="Mesa 1"
                      className="flex-1 px-4 py-3 rounded-2xl border focus:outline-none"
                      style={{ borderColor: neutralColors.border, color: neutralColors.textPrimary }}
                    />
                    <button
                      onClick={() => setTableLabel('')}
                      className="px-4 py-3 rounded-2xl border font-semibold"
                      style={{ borderColor: neutralColors.border, color: neutralColors.textSecondary }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" style={{ color: neutralColors.textSecondary }}>
                <div
                  className="border rounded-2xl p-4"
                  style={{ backgroundColor: neutralColors.mutedBg, borderColor: neutralColors.border }}
                >
                  <p className="font-semibold" style={{ color: neutralColors.textPrimary }}>
                    Recomendado para impresión
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Papel satinado o adhesivo</li>
                    <li>Formato cuadrado mínimo 10 cm</li>
                    <li>Imprime en alta resolución (300 dpi)</li>
                  </ul>
                </div>
                <div
                  className="border rounded-2xl p-4"
                  style={{ backgroundColor: neutralColors.mutedBg, borderColor: neutralColors.border }}
                >
                  <p className="font-semibold" style={{ color: neutralColors.textPrimary }}>
                    Consejos rápidos
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Coloca el QR en mesas y entrada</li>
                    <li>Incluye una frase invitando a escanear</li>
                    <li>Prueba el QR antes de imprimir en masa</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border" style={{ borderColor: neutralColors.border }}>
              <div
                className="relative rounded-2xl p-6 flex flex-col items-center gap-5 border"
                style={{ backgroundColor: neutralColors.cardBg, borderColor: neutralColors.border }}
              >
                <p
                  className="text-center text-lg font-bold uppercase tracking-wide"
                  style={{ color: neutralColors.textPrimary }}
                >
                  {businessName}
                </p>
                <p className="text-center text-sm" style={{ color: neutralColors.textSecondary }}>
                  Escanea este QR para ver el menú digital
                </p>
                <div className="relative inline-flex">
                  <QRCodeCanvas
                    id={canvasId}
                    value={qrUrl}
                    size={320}
                    includeMargin
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                  {tableOverlayText && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      aria-label={`Mesa ${tableOverlayText}`}
                    >
                      <span
                        className="px-8 py-3 rounded-full text-2xl font-black tracking-[0.2em]"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.92)',
                          color: '#ffffff',
                        }}
                      >
                        {tableOverlayText}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full mt-4 text-sm text-center" style={{ color: neutralColors.textSecondary }}>
                  {displayUrl}
                </div>
              </div>

              <div className="relative mt-6 flex flex-col gap-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-transform hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${themePreset.primary}, ${themePreset.secondary})`,
                    boxShadow: `0 20px 35px -25px ${themePreset.primary}`,
                  }}
                >
                  Imprimir o guardar como PDF
                </button>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="flex-1 min-w-[150px] py-3 px-4 rounded-xl font-semibold border"
                    style={{ borderColor: neutralColors.border, color: neutralColors.textPrimary }}
                  >
                    Descargar PNG (300 dpi)
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-semibold border ${
                      isGeneratingPdf ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    style={{ borderColor: neutralColors.border, color: neutralColors.textPrimary }}
                  >
                    {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}
                  </button>
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[150px] py-3 px-4 rounded-xl font-semibold border text-center"
                    style={{ borderColor: neutralColors.border, color: neutralColors.textPrimary }}
                  >
                    Abrir menú en nueva pestaña
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-6 px-8 py-6 flex flex-col gap-2 text-sm rounded-3xl print:hidden"
          style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
        >
          <p className="font-semibold uppercase tracking-[0.2em]" style={{ color: '#cbd5f5' }}>
            Instrucciones para PDF
          </p>
          <ol className="list-decimal list-inside space-y-1" style={{ color: '#e2e8f0' }}>
            <li>Pulsa el botón Imprimir o guardar como PDF.</li>
            <li>En destino selecciona Guardar como PDF.</li>
            <li>Ajusta márgenes a Ninguno y escala a 100%.</li>
            <li>Descarga el archivo y compártelo con tu imprenta.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

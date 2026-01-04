'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Download, Printer, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function QRPrintPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.businessId as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('orange');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!businessId) {
      setError('ID de negocio no válido');
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Debes estar autenticado para generar el QR imprimible.');
          setLoading(false);
          return;
        }

        setUser(session.user);
        
        // Cargar info del restaurante
        const { data, error: fetchError } = await supabase
          .from('menus')
          .select('*')
          .eq('id', businessId)
          .single();

        if (fetchError) throw fetchError;

        // Verificar que pertenece al usuario autenticado
        if (data.user_id !== session.user.id) {
          setError('No tienes permiso para acceder a este QR.');
          setLoading(false);
          return;
        }

        // Parsear menu_data si es string
        let menuData = data.menu_data;
        if (typeof menuData === 'string') {
          try {
            menuData = JSON.parse(menuData);
          } catch (e) {
            menuData = {};
          }
        }

        setBusinessInfo({ ...data, menuData });
        setTheme(data.theme || 'orange');
        setIsAuthenticated(true);
      } catch (err: any) {
        console.error('Error:', err);
        setError('Error al cargar la información del restaurante.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [businessId]);

  // Generar QR cuando el componente está listo
  useEffect(() => {
    if (!canvasRef.current || !businessId || !isAuthenticated) return;

    const generateQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const isDev = process.env.NODE_ENV === 'development';
        const baseUrl = isDev 
          ? 'http://192.168.0.179:3000'
          : (process.env.NEXT_PUBLIC_SITE_URL || 'https://scanela.app');
        const qrUrl = `${baseUrl}/menu/${businessId}`;

        // Mapa de colores del tema
        const themeColorMap: Record<string, string> = {
          orange: '#FF8C00',
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          purple: '#A855F7',
          pink: '#EC4899',
          cyan: '#06B6D4',
          lime: '#84CC16',
          amber: '#F59E0B',
          indigo: '#6366F1',
          rose: '#F43F5E',
          teal: '#14B8A6',
        };

        const themeColor = themeColorMap[theme] || themeColorMap.orange;

        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: themeColor,
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        // Agregar logo del negocio en el centro del QR
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const logoSize = 60;

            // Fondo blanco circular
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoSize / 2 + 4, 0, Math.PI * 2);
            ctx.fill();

            // Borde del tema color
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoSize / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Si hay logo del negocio, dibujarlo; si no, usar emoji
            if (businessInfo?.menuData?.businessLogo) {
              try {
                const logoImg = new Image();
                logoImg.onload = () => {
                  // Crear máscara circular
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
                  ctx.clip();

                  // Dibujar imagen dentro del círculo
                  const imgSize = logoSize;
                  ctx.drawImage(
                    logoImg,
                    centerX - imgSize / 2,
                    centerY - imgSize / 2,
                    imgSize,
                    imgSize
                  );

                  ctx.restore();
                };
                logoImg.crossOrigin = 'anonymous';
                logoImg.src = businessInfo.menuData.businessLogo;
              } catch (e) {
                // Si falla cargar imagen, usar emoji
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#000000';
                ctx.fillText('🍽️', centerX, centerY);
              }
            } else {
              // Usar emoji como fallback
              ctx.font = 'bold 40px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#000000';
              ctx.fillText('🍽️', centerX, centerY);
            }
          }
        }
      } catch (err) {
        console.error('Error generating QR:', err);
      }
    };

    generateQR();
  }, [businessId, isAuthenticated, theme]);

  const getThemeColors = (t: string) => {
    const themes: Record<string, { 
      header: string; 
      bg: string;
      border: string;
      text: string;
      step: string;
      accent: string;
    }> = {
      orange: { 
        header: 'from-orange-600 via-orange-500 to-amber-400', 
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-600',
        step: 'bg-orange-100 text-orange-700',
        accent: 'bg-orange-500'
      },
      blue: { 
        header: 'from-blue-600 via-blue-500 to-cyan-400', 
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-600',
        step: 'bg-blue-100 text-blue-700',
        accent: 'bg-blue-500'
      },
      green: { 
        header: 'from-green-600 via-green-500 to-emerald-400', 
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-600',
        step: 'bg-green-100 text-green-700',
        accent: 'bg-green-500'
      },
      red: { 
        header: 'from-red-600 via-red-500 to-rose-400', 
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-600',
        step: 'bg-red-100 text-red-700',
        accent: 'bg-red-500'
      },
      purple: {
        header: 'from-purple-600 via-purple-500 to-pink-400',
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-600',
        step: 'bg-purple-100 text-purple-700',
        accent: 'bg-purple-500'
      },
      pink: {
        header: 'from-pink-600 via-pink-500 to-rose-400',
        bg: 'bg-pink-50',
        border: 'border-pink-500',
        text: 'text-pink-600',
        step: 'bg-pink-100 text-pink-700',
        accent: 'bg-pink-500'
      },
      cyan: {
        header: 'from-cyan-600 via-cyan-500 to-blue-400',
        bg: 'bg-cyan-50',
        border: 'border-cyan-500',
        text: 'text-cyan-600',
        step: 'bg-cyan-100 text-cyan-700',
        accent: 'bg-cyan-500'
      },
      lime: {
        header: 'from-lime-600 via-lime-500 to-green-400',
        bg: 'bg-lime-50',
        border: 'border-lime-500',
        text: 'text-lime-600',
        step: 'bg-lime-100 text-lime-700',
        accent: 'bg-lime-500'
      },
      amber: {
        header: 'from-amber-600 via-amber-500 to-yellow-400',
        bg: 'bg-amber-50',
        border: 'border-amber-500',
        text: 'text-amber-600',
        step: 'bg-amber-100 text-amber-700',
        accent: 'bg-amber-500'
      },
      indigo: {
        header: 'from-indigo-600 via-indigo-500 to-blue-400',
        bg: 'bg-indigo-50',
        border: 'border-indigo-500',
        text: 'text-indigo-600',
        step: 'bg-indigo-100 text-indigo-700',
        accent: 'bg-indigo-500'
      },
      rose: {
        header: 'from-rose-600 via-rose-500 to-pink-400',
        bg: 'bg-rose-50',
        border: 'border-rose-500',
        text: 'text-rose-600',
        step: 'bg-rose-100 text-rose-700',
        accent: 'bg-rose-500'
      },
      teal: {
        header: 'from-teal-600 via-teal-500 to-cyan-400',
        bg: 'bg-teal-50',
        border: 'border-teal-500',
        text: 'text-teal-600',
        step: 'bg-teal-100 text-teal-700',
        accent: 'bg-teal-500'
      },
    };
    return themes[t] || themes['orange'];
  };

  const colors = getThemeColors(theme);

  const handleDownload = () => {
    const qrElement = document.getElementById('qr-printable');
    if (qrElement) {
      const canvas = qrElement.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `qr-${businessInfo.business_name}.png`;
        link.click();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      {/* Header para pantalla (no se imprime) */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{businessInfo.business_name}</h1>
            <p className="text-gray-600 text-sm">QR Imprimible</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Download size={18} /> Descargar PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <Printer size={18} /> Imprimir
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              <X size={18} /> Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido imprimible */}
      <div className="max-w-2xl mx-auto">
        <div
          id="qr-printable"
          className={`${colors.bg} rounded-lg overflow-hidden shadow-2xl print:shadow-none print:rounded-none`}
          style={{ width: '600px', margin: '0 auto', minHeight: '850px' }}
        >
          {/* Gradient Header con Decoración */}
          <div className={`bg-gradient-to-r ${colors.header} text-white relative overflow-hidden`}>
            {/* Decoración de olas en el fondo */}
            <div className="absolute top-0 left-0 right-0 h-32 opacity-10">
              <svg viewBox="0 0 1200 120" className="w-full h-full">
                <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="white" />
              </svg>
            </div>

            <div className="relative p-8 text-center">
              {/* Logo Circular */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  {/* Círculo de fondo con efecto glow */}
                  <div className="absolute inset-0 bg-white rounded-full shadow-2xl"></div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-white via-white to-gray-100 rounded-full opacity-50 blur-lg"></div>
                  
                  {/* Logo dentro del círculo */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden bg-white">
                    {businessInfo.menuData?.businessLogo ? (
                      <img
                        src={businessInfo.menuData.businessLogo}
                        alt="Logo"
                        className="w-full h-full object-cover drop-shadow-lg"
                      />
                    ) : (
                      <span className="text-6xl">🍽️</span>
                    )}
                  </div>

                  {/* Borde decorativo */}
                  <div className="absolute inset-0 rounded-full border-4 border-white border-opacity-60"></div>
                </div>
              </div>

              <h1 className="text-4xl font-black mb-1 drop-shadow-lg">
                {businessInfo.business_name}
              </h1>
              <p className="text-white text-opacity-90 text-sm font-semibold tracking-wide">
                MENÚ DIGITAL
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 print:p-6">
            {/* Línea decorativa */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>

            {/* QR Code Section */}
            <div className="text-center mb-12">
              <p className={`${colors.text} text-base font-bold mb-8 uppercase tracking-widest`}>
                Escanea para ver la carta
              </p>
              <div className="flex justify-center perspective">
                <div className={`relative p-6 bg-white border-4 ${colors.border} rounded-2xl shadow-xl hover:shadow-2xl transition-all`}>
                  {/* Glow effect */}
                  <div className={`absolute -inset-2 bg-gradient-to-r ${colors.header} opacity-20 rounded-2xl blur-lg -z-10`}></div>
                  
                  <canvas
                    ref={canvasRef}
                    className="drop-shadow-md relative z-10"
                  />
                </div>
              </div>
            </div>

            {/* Steps Section - Horizontal */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="flex items-center justify-between gap-1">
                {/* Step 1 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`${colors.step} w-16 h-16 rounded-full flex items-center justify-center mb-3 font-bold text-3xl shadow-md hover:scale-110 transition-transform`}>
                    📱
                  </div>
                  <p className="text-sm font-bold text-gray-800">Escanea</p>
                </div>

                {/* Arrow */}
                <div className="text-3xl text-gray-300 pb-6 flex-shrink-0">→</div>

                {/* Step 2 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`${colors.step} w-16 h-16 rounded-full flex items-center justify-center mb-3 font-bold text-3xl shadow-md hover:scale-110 transition-transform`}>
                    📋
                  </div>
                  <p className="text-sm font-bold text-gray-800">Pide</p>
                </div>

                {/* Arrow */}
                <div className="text-3xl text-gray-300 pb-6 flex-shrink-0">→</div>

                {/* Step 3 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`${colors.step} w-16 h-16 rounded-full flex items-center justify-center mb-3 font-bold text-3xl shadow-md hover:scale-110 transition-transform`}>
                    💳
                  </div>
                  <p className="text-sm font-bold text-gray-800">Paga</p>
                </div>

                {/* Arrow */}
                <div className="text-3xl text-gray-300 pb-6 flex-shrink-0">→</div>

                {/* Step 4 */}
                <div className="flex flex-col items-center flex-1">
                  <div className={`${colors.step} w-16 h-16 rounded-full flex items-center justify-center mb-3 font-bold text-3xl shadow-md hover:scale-110 transition-transform`}>
                    😋
                  </div>
                  <p className="text-sm font-bold text-gray-800">Disfruta</p>
                </div>
              </div>
            </div>

            {/* Línea decorativa */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">Powered by</p>
              <p className={`${colors.text} font-black text-2xl tracking-tight`}>Scanela</p>
              <p className="text-gray-400 text-xs mt-4 italic">Tu menú digital en la palma de tu mano</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones de impresión */}
      <div className="max-w-2xl mx-auto mt-6 print:hidden">
        <div className={`${colors.step} border-2 ${colors.border} rounded-lg p-4`}>
          <p className={`${colors.text} text-sm`}>
            💡 <strong>Tip:</strong> Para mejores resultados, imprime en papel A4 o A5 en color. Usa márgenes mínimos en la configuración de impresión.
          </p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\:hidden {
            display: none;
          }
          #qr-printable {
            box-shadow: none;
            width: 100%;
            height: auto;
            background: white;
          }
          .perspective {
            perspective: 1000px;
          }
        }
      `}</style>
    </div>
  );
}

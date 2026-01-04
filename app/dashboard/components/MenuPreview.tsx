'use client';

import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import MenuDisplay from '../../components/MenuDisplay';

export default function MenuPreview({
  menu,
  isDemo,
  businessName,
  theme = 'orange',
  businessPlan = 'ventas',
}: {
  menu: any;
  isDemo: boolean;
  businessName: string;
  theme?: string;
  businessPlan?: string;
}) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const getThemeColors = (t: string) => {
    const themes: Record<string, { header: string }> = {
      orange: { header: 'from-orange-500 to-orange-600' },
      blue: { header: 'from-blue-500 to-blue-600' },
      green: { header: 'from-green-500 to-green-600' },
      red: { header: 'from-red-500 to-red-600' },
      purple: { header: 'from-purple-500 to-purple-600' },
      pink: { header: 'from-pink-500 to-pink-600' },
      cyan: { header: 'from-cyan-500 to-cyan-600' },
      lime: { header: 'from-lime-500 to-lime-600' },
      amber: { header: 'from-amber-500 to-amber-600' },
      indigo: { header: 'from-indigo-500 to-indigo-600' },
      rose: { header: 'from-rose-500 to-rose-600' },
      teal: { header: 'from-teal-500 to-teal-600' },
    };
    return themes[t] || themes['orange'];
  };

  const colors = getThemeColors(theme);

  const handleDownload = (format: 'png' | 'pdf') => {
    if (isDemo) {
      setShowDemoModal(true);
      return;
    }
    // TODO: Implementar descarga real
  };

  // Mock handler para agregar al carrito (no hace nada, solo para mostrar el botón)
  const handleMockAddToCart = () => {
    // No hacer nada, es solo una vista previa
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      {/* iPhone Frame - Tamaño proporcional a celulares reales */}
      <div className="bg-black rounded-3xl shadow-2xl overflow-hidden border-8 border-black flex flex-col relative" style={{ height: '800px', width: '410px' }}>
        {/* Pantalla - usa MenuDisplay para ser exactamente igual al menú real */}
        <MenuDisplay 
          menu={menu}
          businessName={businessName}
          theme={theme}
          showFrame={false}
          businessPlan={businessPlan as 'menu' | 'ventas'}
          onAddToCart={handleMockAddToCart}
        />

        {/* Carrito flotante mockup (solo Plan Ventas) - positioned within iPhone */}
        {businessPlan === 'ventas' && (
          <button className="absolute bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg z-40 flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
            <span className="text-xl">🛒</span>
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              1
            </span>
          </button>
        )}
      </div>

      {/* Botones de descarga con efectos mejorados */}
      {!isDemo && (
        <div className="mt-6 flex gap-3 animate-fadeIn">
          <button
            onClick={() => handleDownload('png')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Download size={16} /> PNG
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Download size={16} /> PDF
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105">
            <Printer size={16} /> Imprimir
          </button>
        </div>
      )}

      {/* Modal DEMO */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm shadow-2xl">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Activa tu plan</h3>
            <p className="text-gray-600 text-sm mb-6">
              Las descargas están disponibles solo para planes activos. Actualiza ahora para acceder a todas las funciones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button className={`flex-1 px-4 py-2 bg-gradient-to-r ${colors.header} hover:shadow-lg text-white rounded-lg transition font-medium text-sm`}>
                Ver planes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

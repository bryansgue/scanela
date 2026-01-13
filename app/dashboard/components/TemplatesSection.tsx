'use client';

import { useState, useEffect } from 'react';

export default function TemplatesSection({
  onLoadTemplate,
}: {
  onLoadTemplate: (type: string) => void;
}) {
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const buttonBaseClasses =
    'px-2 py-1 bg-white/90 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transform hover:-translate-y-0.5';

  // Cargar plantillas desde el archivo JSON público
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/menu-templates.json');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error cargando plantillas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
        <div className="animate-pulse flex items-center justify-center h-12">
          <p className="text-gray-400 text-xs">Cargando plantillas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-1.5">
        {/* Pizzería */}
          <button
            onClick={() => onLoadTemplate('pizzeria')}
            className={buttonBaseClasses}
            title="Plantilla de Pizzería"
          >
          <div className="text-base">🍕</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Pizza</div>
        </button>

        {/* Cafetería */}
          <button
            onClick={() => onLoadTemplate('cafeteria')}
            className={buttonBaseClasses}
            title="Plantilla de Cafetería"
          >
          <div className="text-base">☕</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Café</div>
        </button>

        {/* Heladería */}
          <button
            onClick={() => onLoadTemplate('heladeria')}
            className={buttonBaseClasses}
            title="Plantilla de Heladería"
          >
          <div className="text-base">🍦</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Helado</div>
        </button>

        {/* Restaurante */}
          <button
            onClick={() => onLoadTemplate('restaurante')}
            className={buttonBaseClasses}
            title="Plantilla de Restaurante"
          >
          <div className="text-base">🍽️</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Comida</div>
        </button>

        {/* Panadería */}
          <button
            onClick={() => onLoadTemplate('panaderia')}
            className={buttonBaseClasses}
            title="Plantilla de Panadería"
          >
          <div className="text-base">🥐</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Pan</div>
        </button>

        {/* Hamburguesería */}
          <button
            onClick={() => onLoadTemplate('hamburgueseria')}
            className={buttonBaseClasses}
            title="Plantilla de Hamburguesería"
          >
          <div className="text-base">🍔</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Burger</div>
        </button>
      </div>
    </div>
  );
}

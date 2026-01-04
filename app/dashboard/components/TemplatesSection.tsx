'use client';

import { useState, useEffect } from 'react';

export default function TemplatesSection({
  onLoadTemplate,
}: {
  onLoadTemplate: (type: string) => void;
}) {
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

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
          className="px-1.5 py-1 bg-gradient-to-br from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-700 rounded text-xs font-semibold transition-all duration-300 border border-blue-300 hover:border-blue-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Plantilla de Pizzería"
        >
          <div className="text-base">🍕</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Pizza</div>
        </button>

        {/* Cafetería */}
        <button
          onClick={() => onLoadTemplate('cafeteria')}
          className="px-1.5 py-1 bg-gradient-to-br from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 text-purple-700 rounded text-xs font-semibold transition-all duration-300 border border-purple-300 hover:border-purple-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
          title="Plantilla de Cafetería"
        >
          <div className="text-base">☕</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Café</div>
        </button>

        {/* Heladería */}
        <button
          onClick={() => onLoadTemplate('heladeria')}
          className="px-1.5 py-1 bg-gradient-to-br from-indigo-100 to-indigo-50 hover:from-indigo-200 hover:to-indigo-100 text-indigo-700 rounded text-xs font-semibold transition-all duration-300 border border-indigo-300 hover:border-indigo-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Plantilla de Heladería"
        >
          <div className="text-base">🍦</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Helado</div>
        </button>

        {/* Restaurante */}
        <button
          onClick={() => onLoadTemplate('restaurante')}
          className="px-1.5 py-1 bg-gradient-to-br from-violet-100 to-violet-50 hover:from-violet-200 hover:to-violet-100 text-violet-700 rounded text-xs font-semibold transition-all duration-300 border border-violet-300 hover:border-violet-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
          title="Plantilla de Restaurante"
        >
          <div className="text-base">🍽️</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Comida</div>
        </button>

        {/* Panadería */}
        <button
          onClick={() => onLoadTemplate('panaderia')}
          className="px-1.5 py-1 bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 rounded text-xs font-semibold transition-all duration-300 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
          title="Plantilla de Panadería"
        >
          <div className="text-base">🥐</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Pan</div>
        </button>

        {/* Hamburguesería */}
        <button
          onClick={() => onLoadTemplate('hamburgueseria')}
          className="px-1.5 py-1 bg-gradient-to-br from-cyan-100 to-cyan-50 hover:from-cyan-200 hover:to-cyan-100 text-cyan-700 rounded text-xs font-semibold transition-all duration-300 border border-cyan-300 hover:border-cyan-400 shadow-sm hover:shadow-md flex items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          title="Plantilla de Hamburguesería"
        >
          <div className="text-base">🍔</div>
          <div className="leading-none line-clamp-1 text-xs hidden sm:block">Burger</div>
        </button>
      </div>
    </div>
  );
}

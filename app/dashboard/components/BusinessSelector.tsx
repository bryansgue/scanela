'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

export default function BusinessSelector({
  businesses,
  selected,
  onSelect,
  onAddBusiness,
  onDeleteBusiness,
  canAddBusiness,
  isDemo,
}: {
  businesses: any[];
  selected: any;
  onSelect: (b: any) => void;
  onAddBusiness?: () => void;
  onDeleteBusiness?: () => void;
  canAddBusiness: boolean;
  isDemo: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeBusiness = businesses.find((b) => b.id === selected?.id) || selected;
  const activeItemsCount = activeBusiness?.items ?? 0;

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Dropdown mejorado */}
      <div className="relative w-full max-w-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 px-5 py-3 text-left"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl bg-white rounded-xl px-3 py-1 shadow-sm border border-white/70 flex-shrink-0">
              {selected?.logo}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-blue-500 font-semibold">Negocio activo</p>
              <p className="text-lg font-semibold text-gray-900 truncate">{selected?.name}</p>
              <p className="text-xs text-gray-500">{activeItemsCount} productos</p>
            </div>

            <ChevronDown
              size={18}
              className={`text-blue-600 transition-transform duration-300 flex-shrink-0 mt-2 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-slideDown">
            {/* Header del dropdown */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Tus negocios</p>
            </div>

            {/* Listado de negocios */}
            {businesses.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => {
                  onSelect(b);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 border-b border-gray-100 last:border-0 ${
                  selected?.id === b.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{b.logo}</span>
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold ${
                      selected?.id === b.id ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {b.name}
                  </p>
                  <p className="text-xs text-gray-500">{b.items || '0'} productos</p>
                </div>
                {selected?.id === b.id && (
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                )}
              </button>
            ))}

            {/* Agregar y Eliminar negocio - lado a lado */}
            <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
              {canAddBusiness && !isDemo && (
                <button
                  onClick={() => {
                    if (onAddBusiness) {
                      onAddBusiness();
                      setIsOpen(false);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer py-2 transition-all duration-200"
                  title="Agregar un nuevo negocio"
                >
                  <Plus size={18} />
                  <span className="font-medium">Agregar</span>
                </button>
              )}

              {!isDemo && (
                <button
                  onClick={() => {
                    if (onDeleteBusiness) {
                      onDeleteBusiness();
                      setIsOpen(false);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer py-2 transition-all duration-200 ${
                    canAddBusiness
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
                      : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800'
                  }`}
                  title="Eliminar este negocio"
                >
                  <Trash2 size={18} />
                  <span className="font-medium">Eliminar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Indicador DEMO */}
      {isDemo && (
        <div className="ml-auto px-3 py-1 bg-amber-100 border-2 border-amber-300 rounded-full text-xs font-bold text-amber-800">
          📵 Solo 1 negocio
        </div>
      )}
    </div>
  );
}

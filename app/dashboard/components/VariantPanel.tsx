'use client';

import { Plus, X, GripVertical } from 'lucide-react';
import { useState } from 'react';

export default function VariantPanel({
  product,
  categoryId,
  onUpdate,
}: {
  product: any;
  categoryId: number;
  onUpdate: (variants: any) => void;
}) {
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const variants = product.variants || {
    sizes: [],
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    if (!newPrice.trim()) {
      alert('Por favor ingresa un precio para el tamaño');
      return;
    }
    // Normalizar coma a punto
    const normalized = newPrice.replace(',', '.');
    const priceValue = parseFloat(normalized);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Precio inválido');
      return;
    }
    const updated = {
      ...variants,
      sizes: [...variants.sizes, { 
        id: Date.now(), 
        name: newSize,
        price: priceValue,
        allowCombinations: true // Por defecto, habilitadas
      }],
    };
    onUpdate(updated);
    setNewSize('');
    setNewPrice('');
  };

  const deleteSize = (id: number) => {
    const updated = {
      ...variants,
      sizes: variants.sizes.filter((s: any) => s.id !== id),
    };
    onUpdate(updated);
  };

  const updateSizeName = (id: number, newName: string) => {
    const updated = {
      ...variants,
      sizes: variants.sizes.map((s: any) => 
        s.id === id ? { ...s, name: newName } : s
      ),
    };
    onUpdate(updated);
  };

  const updateSizePrice = (id: number, newPrice: number) => {
    // Rechazar negativos y NaN
    if (isNaN(newPrice) || newPrice < 0) newPrice = 0;
    const updated = {
      ...variants,
      sizes: variants.sizes.map((s: any) => 
        s.id === id ? { ...s, price: newPrice } : s
      ),
    };
    onUpdate(updated);
  };

  const toggleSizeCombinations = (id: number) => {
    const updated = {
      ...variants,
      sizes: variants.sizes.map((s: any) => 
        s.id === id ? { ...s, allowCombinations: !s.allowCombinations } : s
      ),
    };
    onUpdate(updated);
  };

  const reorderSizes = (sourceSizeId: number, targetSizeId: number) => {
    const sizes = [...variants.sizes];
    const sourceIdx = sizes.findIndex((s: any) => s.id === sourceSizeId);
    const targetIdx = sizes.findIndex((s: any) => s.id === targetSizeId);
    
    if (sourceIdx === -1 || targetIdx === -1) return;
    
    const [moved] = sizes.splice(sourceIdx, 1);
    sizes.splice(targetIdx, 0, moved);
    
    const updated = { ...variants, sizes };
    onUpdate(updated);
  };

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 space-y-3 bg-blue-50 rounded-lg p-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">📏 Tamaños</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Ej: Pequeño, Mediano"
            onKeyPress={(e) => {
              if (e.key === 'Enter') addSize();
            }}
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          />
          <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-lg px-2">
            <span className="text-orange-600 font-bold text-sm">$</span>
            <input
              type="text"
              value={newPrice}
              onChange={(e) => {
                const input = e.target.value;
                // Permitir números decimales con . o ,
                if (input === '') {
                  setNewPrice('');
                } else {
                  // Reemplazar , por . para validar
                  const normalized = input.replace(',', '.');
                  // Permite digitar coma o punto
                  if (/^\d*[.,]?\d*$/.test(input)) {
                    setNewPrice(input); // Mostrar lo que digita (con coma si quiere)
                  }
                }
              }}
              placeholder="0.00"
              onKeyPress={(e) => {
                if (e.key === 'Enter') addSize();
              }}
              className="w-16 px-1 py-2 border-0 focus:outline-none focus:ring-0 text-sm bg-white text-orange-600 font-bold"
            />
          </div>
          <button
            onClick={addSize}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {variants.sizes?.map((size: any, idx: number) => (
            <div
              key={size.id}
              draggable
              onDragStart={() => setDraggedItem(size.id)}
              onDragEnd={() => setDraggedItem(null)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverItem(size.id);
              }}
              onDragLeave={() => setDragOverItem(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverItem(null);
                if (draggedItem && draggedItem !== size.id) {
                  reorderSizes(draggedItem, size.id);
                }
              }}
              className={`flex items-center gap-1 px-2 py-2 rounded-lg border transition-all ${
                dragOverItem === size.id
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-blue-300 bg-white'
              }`}
            >
              <GripVertical size={16} className="text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
              <input
                type="text"
                value={size.name}
                onChange={(e) => updateSizeName(size.id, e.target.value)}
                className="min-w-24 px-2 py-1 bg-white border border-blue-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="flex items-center gap-1 bg-white border border-blue-200 rounded px-1.5 flex-shrink-0">
                <span className="text-orange-600 font-bold text-xs">$</span>
                <input
                  type="text"
                  value={editingPriceId === size.id ? editingPrice : (size.price || '')}
                  onChange={(e) => {
                    const input = e.target.value;
                    setEditingPriceId(size.id);
                    setEditingPrice(input);
                    
                    if (input === '') {
                      updateSizePrice(size.id, 0);
                    } else {
                      // Permitir digitar con coma o punto
                      if (/^\d*[.,]?\d*$/.test(input)) {
                        // Reemplazar , por . y luego parsear
                        const normalized = input.replace(',', '.');
                        const value = parseFloat(normalized);
                        if (!isNaN(value) && value >= 0) {
                          updateSizePrice(size.id, value);
                        }
                      }
                    }
                  }}
                  onBlur={() => setEditingPriceId(null)}
                  className="w-14 px-1 py-0.5 border-0 focus:outline-none focus:ring-0 text-xs bg-white text-orange-600 font-bold"
                />
              </div>
              {/* Toggle para habilitar/deshabilitar combinaciones */}
              <label className="flex items-center gap-1 cursor-pointer flex-shrink-0" title="Permitir combinaciones para este tamaño">
                <input
                  type="checkbox"
                  checked={size.allowCombinations !== false}
                  onChange={() => toggleSizeCombinations(size.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-600">🔗</span>
              </label>
              <button
                onClick={() => deleteSize(size.id)}
                className="text-red-500 hover:text-red-700 flex-shrink-0 p-0 ml-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 Arrastra para reordenar.</p>
          <p>🔗 Activa para habilitar/deshabilitar combinaciones.</p>
        </div>
      </div>
    </div>
  );
}

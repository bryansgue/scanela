'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function CategoryVariantPanel({
  category,
  onUpdate,
}: {
  category: any;
  onUpdate: (variants: any) => void;
}) {
  const [newSize, setNewSize] = useState('');
  const [newFlavor, setNewFlavor] = useState('');
  const [newOption, setNewOption] = useState('');

  const variants = category.variants || {
    sizes: [],
    flavors: [],
    options: [],
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    const updated = {
      ...variants,
      sizes: [...variants.sizes, { id: Date.now(), name: newSize }],
    };
    onUpdate(updated);
    setNewSize('');
  };

  const addFlavor = () => {
    if (!newFlavor.trim()) return;
    const updated = {
      ...variants,
      flavors: [...variants.flavors, { id: Date.now(), name: newFlavor }],
    };
    onUpdate(updated);
    setNewFlavor('');
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    const updated = {
      ...variants,
      options: [...variants.options, { id: Date.now(), name: newOption }],
    };
    onUpdate(updated);
    setNewOption('');
  };

  const deleteSize = (id: number) => {
    const updated = {
      ...variants,
      sizes: variants.sizes.filter((s: any) => s.id !== id),
    };
    onUpdate(updated);
  };

  const deleteFlavor = (id: number) => {
    const updated = {
      ...variants,
      flavors: variants.flavors.filter((f: any) => f.id !== id),
    };
    onUpdate(updated);
  };

  const deleteOption = (id: number) => {
    const updated = {
      ...variants,
      options: variants.options.filter((o: any) => o.id !== id),
    };
    onUpdate(updated);
  };

  return (
    <div className="bg-purple-50 rounded-lg p-4 space-y-4 border-2 border-dashed border-purple-300">
      <div>
        <h4 className="font-bold text-gray-900 text-sm mb-3">🎯 Variantes de Categoría</h4>
        <p className="text-xs text-gray-600 mb-3">Estas opciones se aplicarán a todos los productos en "{category.name}"</p>
      </div>

      {/* Tamaños */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">📏 Tamaños</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="Ej: Pequeño, Mediano, Grande"
            onKeyPress={(e) => {
              if (e.key === 'Enter') addSize();
            }}
            className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          />
          <button
            onClick={addSize}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.sizes?.map((size: any) => (
            <div key={size.id} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-purple-300">
              <span className="text-sm font-medium text-gray-700">{size.name}</span>
              <button
                onClick={() => deleteSize(size.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sabores */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">🍕 Sabores/Tipos</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFlavor}
            onChange={(e) => setNewFlavor(e.target.value)}
            placeholder="Ej: Vainilla, Chocolate, Fresa"
            onKeyPress={(e) => {
              if (e.key === 'Enter') addFlavor();
            }}
            className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          />
          <button
            onClick={addFlavor}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.flavors?.map((flavor: any) => (
            <div key={flavor.id} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-purple-300">
              <span className="text-sm font-medium text-gray-700">{flavor.name}</span>
              <button
                onClick={() => deleteFlavor(flavor.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Opciones genéricas */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">⚡ Opciones Genéricas</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Ej: Sin azúcar, Con hielo, Extra espeso"
            onKeyPress={(e) => {
              if (e.key === 'Enter') addOption();
            }}
            className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          />
          <button
            onClick={addOption}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.options?.map((option: any) => (
            <div key={option.id} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-purple-300">
              <span className="text-sm font-medium text-gray-700">{option.name}</span>
              <button
                onClick={() => deleteOption(option.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-600 italic pt-2 border-t border-purple-200">
        💡 Usa esto para variantes comunes a toda la categoría. Cada producto puede tener sus propias variantes específicas.
      </p>
    </div>
  );
}

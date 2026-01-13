'use client';

/**
 * MenuEditor - Editor de menú con sincronización en tiempo real
 * 
 * ARQUITECTURA DE EVENTOS:
 * ========================
 * Este componente emite 3 tipos de eventos CustomEvent que MenuPreview escucha:
 * 
 * 1. 'productCreated' (detail: { categoryId })
 *    - Emitido cuando se crea un NUEVO producto
 *    - MenuPreview salta a esa categoría
 * 
 * 2. 'productEditing' (detail: { categoryId })
 *    - Emitido CADA VEZ que se edita un campo del producto:
 *      - Nombre (onChange del input)
 *      - Descripción (onChange del input)
 *      - Precio (onChange del input)
 *      - Imagen (onImageChange callback)
 *      - Toggle variantes (onClick)
 *      - Variantes panel (onUpdate callback)
 *    - MenuPreview salta a esa categoría en TIEMPO REAL
 * 
 * 3. 'categoryEditing' (detail: { categoryId })
 *    - Emitido cuando se edita una categoría:
 *      - Nombre (onChange del input)
 *      - Variantes categoría (onUpdate callback)
 *    - MenuPreview salta a esa categoría
 * 
 * REGLA IMPORTANTE:
 * Estos eventos son los ÚNICOS que controlan qué categoría se muestra en preview.
 * MenuPreview NO debe auto-seleccionar basado en cambios de estado interno del menu.
 * El auto-select inicial SOLO ocurre una vez al cargar (si no hay categoría seleccionada).
 */

import { Plus, Trash2, ChevronDown, GripVertical, Settings2, X, Copy, Phone, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import VariantPanel from './VariantPanel';
import CategoryVariantPanel from './CategoryVariantPanel';
import ImageUpload, { type ImageStorageEvent } from './ImageUpload';

export default function MenuEditor({
  menu,
  onUpdate,
  businessName,
  businessId,
  onBusinessNameChange,
  theme = 'orange',
  onThemeChange,
  onSaveMenu,
  onImageStorageEvent,
}: {
  menu: any;
  onUpdate: (menu: any) => void;
  businessName: string;
  businessId: number;
  onBusinessNameChange: (name: string) => void;
  theme?: string;
  onThemeChange?: (theme: string) => void;
  onSaveMenu?: () => Promise<boolean>;
  onImageStorageEvent?: (event: ImageStorageEvent) => void;
}) {
  // Helper para obtener colores del tema
  const getThemeColors = (t: string) => {
    const themeMap: Record<string, { light: string; dark: string; border: string }> = {
      orange: { light: 'from-orange-50', dark: 'from-orange-100', border: 'border-orange-200' },
      blue: { light: 'from-blue-50', dark: 'from-blue-100', border: 'border-blue-200' },
      green: { light: 'from-green-50', dark: 'from-green-100', border: 'border-green-200' },
      red: { light: 'from-red-50', dark: 'from-red-100', border: 'border-red-200' },
      purple: { light: 'from-purple-50', dark: 'from-purple-100', border: 'border-purple-200' },
      pink: { light: 'from-pink-50', dark: 'from-pink-100', border: 'border-pink-200' },
      cyan: { light: 'from-cyan-50', dark: 'from-cyan-100', border: 'border-cyan-200' },
      lime: { light: 'from-lime-50', dark: 'from-lime-100', border: 'border-lime-200' },
      amber: { light: 'from-amber-50', dark: 'from-amber-100', border: 'border-amber-200' },
      indigo: { light: 'from-indigo-50', dark: 'from-indigo-100', border: 'border-indigo-200' },
      rose: { light: 'from-rose-50', dark: 'from-rose-100', border: 'border-rose-200' },
      teal: { light: 'from-teal-50', dark: 'from-teal-100', border: 'border-teal-200' },
    };
    return themeMap[t] || themeMap['orange'];
  };

  const themeColors = getThemeColors(theme);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set()); // "categoryId-productId"
  const [newCategoryName, setNewCategoryName] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [expandedVariants, setExpandedVariants] = useState<string | null>(null); // "categoryId-productId"
  const [expandedCategoryVariants, setExpandedCategoryVariants] = useState<number | null>(null); // categoryId
  const [expandedConfig, setExpandedConfig] = useState(false); // Configuración expandida/contraída (inicia colapsada)
  const [editingProducts, setEditingProducts] = useState<{
    [key: string]: { name: string; description: string; price: number };
  }>({}); // Almacena cambios no guardados por producto "categoryId-productId"
  const [editingCategories, setEditingCategories] = useState<{
    [key: string]: boolean;
  }>({}); // Almacena qué categoría está en modo edición inline

  // Escuchar evento de descartar cambios desde el dashboard
  useEffect(() => {
    const handleDiscardChanges = () => {
      // Limpiar todos los estados de edición
      setEditingProducts({});
      setEditingCategories({});
      console.log('🔄 Estados de edición limpiados');
    };

    window.addEventListener('discardChanges', handleDiscardChanges);
    return () => {
      window.removeEventListener('discardChanges', handleDiscardChanges);
    };
  }, []);

  // Auto-expandir productos que tienen variantes cuando se importan
  useEffect(() => {
    const newExpandedProducts = new Set<string>();
    menu.categories?.forEach((cat: any) => {
      cat.products?.forEach((prod: any) => {
        if (prod.hasVariants && (prod.sizes && prod.sizes.length > 0)) {
          newExpandedProducts.add(`${cat.id}-${prod.id}`);
        }
      });
    });
    if (newExpandedProducts.size > 0) {
      setExpandedProducts(newExpandedProducts);
    }
  }, [menu]);

  // Toggle para expandir/contraer productos
  const toggleProductExpanded = (categoryId: number, productId: number) => {
    const key = `${categoryId}-${productId}`;
    const newSet = new Set(expandedProducts);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedProducts(newSet);
  };

  const isProductExpanded = (categoryId: number, productId: number) => {
    return expandedProducts.has(`${categoryId}-${productId}`);
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newMenu = {
      ...menu,
      categories: [
        ...menu.categories,
        { id: Date.now(), name: newCategoryName, products: [] },
      ],
    };
    onUpdate(newMenu);
    setNewCategoryName('');
  };

  const deleteCategory = (id: number) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.filter((c: any) => c.id !== id),
    };
    onUpdate(newMenu);
  };

  const updateCategory = (id: number, name: string) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === id ? { ...c, name } : c
      ),
    };
    onUpdate(newMenu);
  };

  const deleteProduct = (categoryId: number, productId: number) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.filter((p: any) => p.id !== productId),
            }
          : c
      ),
    };
    onUpdate(newMenu);
  };

  const duplicateProduct = (categoryId: number, productId: number) => {
    const product = menu.categories
      .find((c: any) => c.id === categoryId)
      ?.products.find((p: any) => p.id === productId);
    
    if (!product) return;
    
    const newProduct = {
      ...product,
      id: Date.now(),
      name: `${product.name} (copia)`,
    };
    
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? {
              ...c,
              products: [...c.products, newProduct],
            }
          : c
      ),
    };
    onUpdate(newMenu);
  };

  const updateProduct = (categoryId: number, productId: number, field: string, value: any) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p: any) =>
                p.id === productId ? { ...p, [field]: value } : p
              ),
            }
          : c
      ),
    };
    onUpdate(newMenu);
  };

  const updateVariants = (categoryId: number, productId: number, variants: any) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p: any) =>
                p.id === productId ? { ...p, variants, hasVariants: true } : p
              ),
            }
          : c
      ),
    };
    onUpdate(newMenu);
  };

  const updateCategoryVariants = (categoryId: number, categoryVariants: any) => {
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? { ...c, variants: categoryVariants, hasVariants: true }
          : c
      ),
    };
    onUpdate(newMenu);
  };

  const handleDropProduct = (categoryId: number, targetProductId: number) => {
    console.log('🔥 handleDropProduct llamado:', { categoryId, targetProductId, draggedItem });
    
    if (!draggedItem) {
      console.log('❌ draggedItem es null');
      return;
    }
    
    if (!draggedItem.startsWith('prod||')) {
      console.log('❌ draggedItem no es de producto:', draggedItem);
      return;
    }
    
    const parts = draggedItem.split('||');
    const sourceProductId = parts[2]; // Tomar como string
    
    console.log('📍 Source:', sourceProductId, 'Target:', targetProductId);
    
    if (sourceProductId === String(targetProductId)) {
      console.log('⚠️ Mismo producto, abortando');
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    // Buscar la categoría y reordenar
    const newCategories = menu.categories.map((cat: any) => {
      if (cat.id !== categoryId) return cat;
      
      const products = [...cat.products];
      const sourceIdx = products.findIndex((p: any) => String(p.id) === sourceProductId);
      const targetIdx = products.findIndex((p: any) => p.id === targetProductId);
      
      console.log('🔍 Índices:', { sourceIdx, targetIdx });
      
      if (sourceIdx === -1 || targetIdx === -1) {
        console.log('❌ No encontrados los índices');
        return cat;
      }
      
      // Reordenar
      const [moved] = products.splice(sourceIdx, 1);
      products.splice(targetIdx, 0, moved);
      
      console.log('✅ Productos reordenados:', products.map((p: any) => p.id));
      
      return { ...cat, products };
    });
    
    const newMenu = { ...menu, categories: newCategories };
    console.log('🎯 Nuevo menú:', newMenu);
    console.log('📤 Llamando onUpdate');
    
    // Limpiar estados ANTES de llamar onUpdate
    setDraggedItem(null);
    setDragOverItem(null);
    
    // Llamar onUpdate DESPUÉS
    onUpdate(newMenu);
  };

  // Reordenar categorías con drag & drop
  const handleDropCategory = (targetCategoryId: number) => {
    console.log('🔥 handleDropCategory llamado:', { targetCategoryId, draggedItem });
    
    if (!draggedItem) {
      console.log('❌ draggedItem es null');
      return;
    }
    
    if (!draggedItem.startsWith('cat-')) {
      console.log('❌ draggedItem no es de categoría:', draggedItem);
      return;
    }
    
    const sourceCategoryId = draggedItem.slice(4); // Tomar desde "cat-" en adelante
    
    console.log('📍 Source:', sourceCategoryId, 'Target:', targetCategoryId);
    
    if (sourceCategoryId === String(targetCategoryId)) {
      console.log('⚠️ Misma categoría, abortando');
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    const categories = [...menu.categories];
    const sourceIdx = categories.findIndex((c: any) => String(c.id) === sourceCategoryId);
    const targetIdx = categories.findIndex((c: any) => c.id === targetCategoryId);
    
    console.log('🔍 Índices:', { sourceIdx, targetIdx });
    
    if (sourceIdx === -1 || targetIdx === -1) {
      console.log('❌ No encontrados los índices');
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    // Reordenar
    const [moved] = categories.splice(sourceIdx, 1);
    categories.splice(targetIdx, 0, moved);
    
    console.log('✅ Categorías reordenadas:', categories.map((c: any) => c.name));
    
    const newMenu = { ...menu, categories };
    console.log('🎯 Nuevo menú:', newMenu);
    console.log('📤 Llamando onUpdate');
    
    // Limpiar estados ANTES de llamar onUpdate
    setDraggedItem(null);
    setDragOverItem(null);
    
    // Llamar onUpdate DESPUÉS
    onUpdate(newMenu);
  };

  // Obtener el estado actual de un producto (edición o valor original)
  const getProductEditState = (categoryId: number, productId: number, product: any) => {
    const key = `${categoryId}-${productId}`;
    return editingProducts[key] || {
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
    };
  };

  // Actualizar el estado de edición de un producto (sin guardar a DB)
  const updateProductEditState = (
    categoryId: number,
    productId: number,
    field: string,
    value: any
  ) => {
    const key = `${categoryId}-${productId}`;
    const product = menu.categories
      .find((c: any) => c.id === categoryId)
      ?.products.find((p: any) => p.id === productId);
    if (!product) return;

    const currentState = getProductEditState(categoryId, productId, product);
    
    // Actualizar el estado local de edición
    setEditingProducts({
      ...editingProducts,
      [key]: { ...currentState, [field]: value },
    });

    // ⭐ IMPORTANTE: Actualizar menuData inmediatamente para detectar cambios
    // Esto dispara el useEffect de detección de cambios en el dashboard
    const newMenu = {
      ...menu,
      categories: menu.categories.map((c: any) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p: any) =>
                p.id === productId 
                  ? { 
                      ...p, 
                      [field]: field === 'name' || field === 'description' || field === 'price' 
                        ? value 
                        : p[field]
                    } 
                  : p
              ),
            }
          : c
      ),
    };
    
    onUpdate(newMenu);
  };

  // Guardar los cambios de un producto a la DB y limpiar el estado
  const saveProductChanges = (categoryId: number, productId: number) => {
    const key = `${categoryId}-${productId}`;
    
    // Ya los cambios fueron guardados en menuData por updateProductEditState
    // Solo necesitamos limpiar el estado de edición local
    const newEditingProducts = { ...editingProducts };
    delete newEditingProducts[key];
    setEditingProducts(newEditingProducts);
  };

  // Verificar si un producto tiene cambios no guardados
  const hasUnsavedChanges = (categoryId: number, productId: number) => {
    const key = `${categoryId}-${productId}`;
    return key in editingProducts;
  };

  // Helper para emitir evento de edición de producto
  const emitProductEditingEvent = (categoryId: number) => {
    window.dispatchEvent(new CustomEvent('productEditing', { detail: { categoryId } }));
  };

  // Helper para emitir evento de edición de categoría
  const emitCategoryEditingEvent = (categoryId: number) => {
    window.dispatchEvent(new CustomEvent('categoryEditing', { detail: { categoryId } }));
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-b from-white via-gray-50/50 to-gray-50">
      {/* SECCIÓN: NOMBRE Y LOGO DEL RESTAURANTE */}
      <div className="mb-10 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Header colapsable */}
        <button
          onClick={() => setExpandedConfig(!expandedConfig)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all duration-300 border-b border-gray-100"
        >
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">⚙️ Configuración del Restaurante</h2>
          <ChevronDown 
            size={24} 
            className={`text-blue-600 transition-transform duration-300 ${expandedConfig ? '' : '-rotate-90'}`}
          />
        </button>

        {/* Contenido colapsable */}
        {expandedConfig && (
          <div className="p-6 bg-white space-y-6">
            {/* Nombre del Restaurante */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Nombre del Restaurante</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => onBusinessNameChange(e.target.value)}
                placeholder="Ej: Mi Restaurante"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-base bg-white hover:border-gray-300 transition-all duration-300"
              />
            </div>

            {/* Subtítulo del Menú */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                📝 Subtítulo del Menú
              </label>
              <input
                type="text"
                value={menu.menuSubtitle || 'Menú Digital QR'}
                onChange={(e) => {
                  const newMenu = { ...menu, menuSubtitle: e.target.value };
                  onUpdate(newMenu);
                }}
                placeholder="Menú Digital QR"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-base bg-white hover:border-gray-300 transition-all duration-300"
              />
            </div>

            {/* URL Personalizado */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                🔗 Mi URL Personalizado
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm font-medium">scanela.com/</span>
                  <input
                    type="text"
                    value={menu.customSlug || ''}
                    onChange={(e) => {
                      const newMenu = { ...menu, customSlug: e.target.value };
                      onUpdate(newMenu);
                    }}
                    placeholder={businessName?.toLowerCase().replace(/\s+/g, '-') || 'mi-negocio'}
                    className="flex-1 px-0 py-0 border-0 bg-transparent focus:outline-none focus:ring-0 text-gray-800 font-semibold text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Usa solo letras, números y guiones. Máximo 50 caracteres.
                </p>
                {menu.customSlug && (
                  <a
                    href={`https://scanela.com/${menu.customSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    🔗 Visitar: scanela.com/{menu.customSlug}
                  </a>
                )}
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo del Restaurante</label>
              <ImageUpload
                currentImage={menu.businessLogo}
                onImageChange={(url) => {
                  const newMenu = { ...menu, businessLogo: url };
                  onUpdate(newMenu);
                }}
                productName="restaurant-logo"
                businessId={businessId}
                productId="logo"
                logoSize={menu.logoSize || 100}
                onLogoSizeChange={(size) => {
                  const newMenu = { ...menu, logoSize: size };
                  onUpdate(newMenu);
                }}
                logoMode={menu.logoMode}
                logoOffsetX={menu.logoMode === 'logo-only' ? (menu.logoOnlyOffsetX || 0) : (menu.logoOffsetX || 0)}
                onLogoOffsetXChange={(offset) => {
                  const key = menu.logoMode === 'logo-only' ? 'logoOnlyOffsetX' : 'logoOffsetX';
                  const newMenu = { ...menu, [key]: offset };
                  onUpdate(newMenu);
                }}
                logoOffsetY={menu.logoMode === 'logo-only' ? (menu.logoOnlyOffsetY || 0) : (menu.logoOffsetY || 0)}
                onLogoOffsetYChange={(offset) => {
                  const key = menu.logoMode === 'logo-only' ? 'logoOnlyOffsetY' : 'logoOffsetY';
                  const newMenu = { ...menu, [key]: offset };
                  onUpdate(newMenu);
                }}
                onStorageEvent={onImageStorageEvent}
              />
            </div>

            {/* Modo de Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Modo de visualización</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'logo-only', label: 'Solo Logo', icon: '🖼️' },
                  { value: 'logo-name', label: 'Logo + Nombre', icon: '📝' },
                  { value: 'name-only', label: 'Solo Nombre', icon: '🔤' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newMenu = { ...menu, logoMode: option.value };
                      onUpdate(newMenu);
                    }}
                    className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                      menu.logoMode === option.value
                        ? 'bg-orange-500 text-white ring-2 ring-orange-600 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-150'
                    }`}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Colores */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Color del Tema</label>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {[
                  { name: 'orange', bg: 'from-orange-500 to-orange-600' },
                  { name: 'blue', bg: 'from-blue-500 to-blue-600' },
                  { name: 'green', bg: 'from-green-500 to-green-600' },
                  { name: 'red', bg: 'from-red-500 to-red-600' },
                  { name: 'purple', bg: 'from-purple-500 to-purple-600' },
                  { name: 'pink', bg: 'from-pink-500 to-pink-600' },
                  { name: 'cyan', bg: 'from-cyan-500 to-cyan-600' },
                  { name: 'lime', bg: 'from-lime-500 to-lime-600' },
                  { name: 'amber', bg: 'from-amber-500 to-amber-600' },
                  { name: 'indigo', bg: 'from-indigo-500 to-indigo-600' },
                  { name: 'rose', bg: 'from-rose-500 to-rose-600' },
                  { name: 'teal', bg: 'from-teal-500 to-teal-600' },
                ].map((t) => (
                  <button
                    key={t.name}
                    onClick={() => onThemeChange?.(t.name)}
                    className={`h-8 rounded transition-all duration-300 ${
                      theme === t.name
                        ? 'ring-2 ring-offset-1 ring-gray-800 scale-105'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                    title={t.name}
                  >
                    <div className={`w-full h-full rounded bg-gradient-to-r ${t.bg}`}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Phone size={16} />
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={menu.whatsappNumber || ''}
                onChange={(e) => {
                  const newMenu = { ...menu, whatsappNumber: e.target.value };
                  onUpdate(newMenu);
                }}
                placeholder="+51 999 123 456"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold text-base bg-white hover:border-gray-300 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-1">Incluye el código de país</p>
            </div>

            {/* Horarios de Atención */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Horarios de Atención
              </label>
              <input
                type="text"
                value={menu.businessHours || ''}
                onChange={(e) => {
                  const newMenu = { ...menu, businessHours: e.target.value };
                  onUpdate(newMenu);
                }}
                placeholder="Lunes - Viernes: 10:00 AM - 10:00 PM"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold text-base bg-white hover:border-gray-300 transition-all duration-300"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: Lun-Vie: 10AM-10PM | Sáb-Dom: 12PM-11PM</p>
            </div>

            {/* Sección Eliminar Restaurante */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-red-600 mb-3">⚠️ Peligro</label>
              <button
                onClick={() => window.dispatchEvent(new Event('deleteBusinessName'))}
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                title="Eliminar restaurante"
              >
                <Trash2 size={20} />
                Eliminar Restaurante
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel Agregar categoría + Importar menú */}
      <div className="mb-10 space-y-3">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') addCategory();
            }}
            placeholder="Ej: Entradas, Platos principales..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm bg-white transition-all duration-300"
          />
          <div className="flex gap-2">
            <button
              onClick={addCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Plus size={18} /> Categoría
            </button>
            <button
              onClick={() => {
                // Llamar a la función de importar desde el padre
                const event = new CustomEvent('importMenu');
                window.dispatchEvent(event);
              }}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              📷 Cargar menú
            </button>
          </div>
        </div>
      </div>

      {/* Listado de Categorías */}
      <div className="space-y-4">
        {menu.categories && menu.categories.length > 0 ? (
          menu.categories.map((category: any) => (
            <div
              key={category.id}
              className={`border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white ${
                dragOverItem === `cat-${category.id}`
                  ? 'border-blue-400 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer!.dropEffect = 'move';
                setDragOverItem(`cat-${category.id}`);
              }}
              onDragLeave={() => setDragOverItem(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverItem(null);
                handleDropCategory(category.id);
              }}
            >
              {/* Header Categoría */}
              <div
                className={`w-full flex items-center justify-between bg-white hover:bg-gray-50 text-gray-800 p-5 transition-all duration-300 group border-b border-gray-100`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedItem(`cat-${category.id}`);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform duration-200"
                  >
                    <GripVertical size={18} className="text-gray-400 flex-shrink-0 drop-shadow-sm" />
                  </div>

                  {/* Botón expandir/contraer - después del drag handle */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    title={expandedCategory === category.id ? 'Contraer' : 'Expandir'}
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 text-blue-600 ${
                        expandedCategory === category.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Nombre editable inline */}
                  {editingCategories[category.id] ? (
                    <input
                      type="text"
                      autoFocus
                      value={category.name}
                      onChange={(e) => {
                        updateCategory(category.id, e.target.value);
                        emitCategoryEditingEvent(category.id);
                      }}
                      onBlur={() => {
                        setEditingCategories({ ...editingCategories, [category.id]: false });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingCategories({ ...editingCategories, [category.id]: false });
                        } else if (e.key === 'Escape') {
                          setEditingCategories({ ...editingCategories, [category.id]: false });
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 font-bold text-lg bg-white border-b-2 border-blue-500 outline-none pb-1 transition-colors duration-200"
                    />
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategories({ ...editingCategories, [category.id]: true });
                      }}
                      className="font-bold text-xl cursor-text hover:bg-white/50 px-2 py-1 rounded transition-colors duration-200"
                    >
                      {category.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold">
                    {category.products ? category.products.length : 0} productos
                  </span>
                </div>
              </div>

              {/* Contenido expandido */}
              {expandedCategory === category.id && (
                <div className="p-6 bg-white space-y-5 border-t border-gray-100">
                  {/* Panel de variantes de categoría */}
                  {expandedCategoryVariants === category.id && (
                    <CategoryVariantPanel
                      category={category}
                      onUpdate={(variants: any) => {
                        updateCategoryVariants(category.id, variants);
                        emitCategoryEditingEvent(category.id);
                      }}
                    />
                  )}

                  {/* Productos existentes */}
                  {category.products && category.products.length > 0 && (
                    <div className="space-y-3">
                      {category.products.map((product: any) => (
                        <div
                          key={product.id}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer!.dropEffect = 'move';
                            setDragOverItem(`prod-${category.id}-${product.id}`);
                          }}
                          onDragLeave={(e) => {
                            e.stopPropagation();
                            setDragOverItem(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDropProduct(category.id, product.id);
                          }}
                          className={`bg-white border-2 rounded-xl p-5 transition-all duration-300 group relative ${
                            dragOverItem === `prod-${category.id}-${product.id}`
                              ? 'border-blue-400 shadow-md'
                              : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                          }`}
                        >
                          {dragOverItem === `prod-${category.id}-${product.id}` && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl"></div>
                          )}
                          {/* Fila 1: Handle drag + Nombre + botón expandir + botón eliminar */}
                          <div className="flex items-center justify-between gap-3 mb-3">
                            {/* Drag Handle */}
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggedItem(`prod||${category.id}||${product.id}`);
                                e.dataTransfer!.effectAllowed = 'move';
                              }}
                              onDragEnd={(e) => {
                                e.stopPropagation();
                              }}
                              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:scale-125 transition-transform duration-200 hover:drop-shadow-md"
                            >
                              <GripVertical size={18} />
                            </div>

                            {/* Botón expandir/contraer */}
                            <button
                              onClick={() => toggleProductExpanded(category.id, product.id)}
                              className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              title={isProductExpanded(category.id, product.id) ? 'Contraer' : 'Expandir'}
                            >
                              <ChevronDown
                                size={20}
                                className={`transition-transform duration-300 ${
                                  isProductExpanded(category.id, product.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            <input
                              type="text"
                              value={getProductEditState(category.id, product.id, product).name}
                              onChange={(e) => {
                                updateProductEditState(category.id, product.id, 'name', e.target.value);
                                emitProductEditingEvent(category.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveProductChanges(category.id, product.id);
                                }
                              }}
                              className={`flex-1 font-bold text-gray-900 bg-transparent border-b-2 outline-none pb-1 transition-colors duration-200 text-base ${
                                hasUnsavedChanges(category.id, product.id)
                                  ? 'border-amber-400 focus:border-amber-500'
                                  : 'border-gray-300 focus:border-blue-500'
                              }`}
                              placeholder="Nombre del producto"
                            />

                            <button
                              onClick={() => duplicateProduct(category.id, product.id)}
                              className="p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              title="Duplicar producto"
                            >
                              <Copy size={16} />
                            </button>

                            <button
                              onClick={() => deleteProduct(category.id, product.id)}
                              className="p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400"
                              title="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Fila 1.5: Image Upload */}
                          {isProductExpanded(category.id, product.id) && (
                            <div className="mb-5 pb-5 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Foto del Producto:</p>
                              <ImageUpload
                                currentImage={product.imageUrl}
                                onImageChange={(url) => {
                                  updateProduct(category.id, product.id, 'imageUrl', url);
                                  emitProductEditingEvent(category.id);
                                }}
                                productName={product.name || 'producto'}
                                businessId={businessId}
                                productId={product.id}
                                onStorageEvent={onImageStorageEvent}
                              />
                            </div>
                          )}

                          {/* Fila 2: Descripción + precio (si no hay variantes) */}
                          {isProductExpanded(category.id, product.id) && (
                            <div className="flex gap-4 items-end mb-5">
                              <input
                                type="text"
                                value={getProductEditState(category.id, product.id, product).description}
                                onChange={(e) => {
                                  updateProductEditState(category.id, product.id, 'description', e.target.value);
                                  emitProductEditingEvent(category.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveProductChanges(category.id, product.id);
                                  }
                                }}
                                placeholder="Descripción"
                                className={`flex-1 text-xs text-gray-600 bg-transparent border-b outline-none pb-1 transition-colors duration-200 ${
                                  hasUnsavedChanges(category.id, product.id)
                                    ? 'border-amber-400 focus:border-amber-500'
                                    : 'border-gray-300 focus:border-orange-500'
                                }`}
                              />

                              {/* Campo precio solo si NO hay variantes */}
                              {!product.hasVariants && (
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600 font-bold">$</span>
                                  <input
                                    type="text"
                                    value={getProductEditState(category.id, product.id, product).price || ''}
                                    onChange={(e) => {
                                      const input = e.target.value;
                                      // Permitir números decimales con . o ,
                                      if (input === '') {
                                        // Permitir campo vacío
                                        updateProductEditState(category.id, product.id, 'price', '');
                                        emitProductEditingEvent(category.id);
                                      } else {
                                        // Reemplazar , por . para normalizar
                                        const normalized = input.replace(',', '.');
                                        let value = parseFloat(normalized);
                                        // Solo actualizar si es un número válido y positivo
                                        if (!isNaN(value) && value >= 0 && normalized.match(/^\d+\.?\d*$/)) {
                                          updateProductEditState(category.id, product.id, 'price', value);
                                          emitProductEditingEvent(category.id);
                                        }
                                        // Si no es válido, no hacer nada (permite seguir escribiendo)
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveProductChanges(category.id, product.id);
                                      }
                                    }}
                                    placeholder="0.00"
                                    className={`w-16 text-blue-600 font-bold bg-transparent border-b-2 outline-none pb-1 transition-colors duration-200 text-sm ${
                                      hasUnsavedChanges(category.id, product.id)
                                        ? 'border-amber-400 focus:border-amber-500'
                                        : 'border-gray-300 focus:border-blue-500'
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fila 3: Toggle Variantes */}
                          {isProductExpanded(category.id, product.id) && (
                            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-sm font-semibold text-gray-700">Variantes:</span>
                              <button
                                onClick={() => {
                                  updateProduct(category.id, product.id, 'hasVariants', !product.hasVariants);
                                  emitProductEditingEvent(category.id);
                                }}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                  product.hasVariants ? 'bg-green-500 focus:ring-green-400' : 'bg-gray-300 focus:ring-gray-400'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                    product.hasVariants ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className="text-sm text-gray-700 font-medium">
                                {product.hasVariants ? '✓ Habilitado' : '○ Deshabilitado'}
                              </span>
                            </div>
                          )}

                          {/* Panel de variantes solo si hay variantes */}
                          {isProductExpanded(category.id, product.id) && product.hasVariants && (
                            <VariantPanel
                              product={product}
                              categoryId={category.id}
                              onUpdate={(variants: any) => {
                                updateVariants(category.id, product.id, variants);
                                emitProductEditingEvent(category.id);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón Agregar producto */}
                  <button
                    onClick={() => {
                      const newMenu = {
                        ...menu,
                        categories: menu.categories.map((c: any) =>
                          c.id === category.id
                            ? {
                                ...c,
                                products: [
                                  ...c.products,
                                  {
                                    id: Date.now(),
                                    name: 'Nuevo producto',
                                    price: 0,
                                    description: '',
                                    active: true,
                                    variants: {
                                      sizes: [],
                                      flavors: [],
                                      extras: [],
                                      combinations: [],
                                    },
                                    hasVariants: false,
                                  },
                                ],
                              }
                            : c
                        ),
                      };
                      onUpdate(newMenu);
                      // Emitir evento para que el preview se actualice a esta categoría
                      window.dispatchEvent(new CustomEvent('productCreated', { detail: { categoryId: category.id } }));
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-orange-400 rounded-lg hover:bg-orange-50 transition text-orange-600 font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Agregar producto
                  </button>

                  {/* Botón Eliminar categoría */}
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={18} />
                    Eliminar categoría
                  </button>

                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Sin categorías aún. ¡Crea una para comenzar!</p>
          </div>
        )}
      </div>
    </div>
  );
}

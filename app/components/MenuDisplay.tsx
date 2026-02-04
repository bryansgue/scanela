'use client';

import { useState, useEffect } from 'react';
import { resolvePublicAssetUrl } from '../../lib/assetUtils';

export default function MenuDisplay({
  menu,
  businessName,
  theme = 'orange',
  showFrame = true, // Mostrar marco iPhone
  onAddToCart, // Callback para agregar al carrito
  businessPlan = 'menu', // Plan del negocio
  templateIcon, // Icono de la plantilla (para landing)
  templateName, // Nombre de la plantilla (para landing)
  templateSubtitle, // Subtítulo de la plantilla (para landing)
  autoSelectFirstSize = false,
  autoSelectVariantOrder,
}: {
  menu: any;
  businessName: string;
  theme?: string;
  showFrame?: boolean;
  onAddToCart?: (product: any, sizeId?: number | null, combinationProductName?: string) => void;
  businessPlan?: 'free' | 'menu' | 'ventas';
  templateIcon?: string;
  templateName?: string;
  templateSubtitle?: string;
  autoSelectFirstSize?: boolean;
  autoSelectVariantOrder?: number[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: number | null }>({});
  const [enabledCombinations, setEnabledCombinations] = useState<{ [key: string]: boolean }>({});
  const [selectedCombinationOptions, setSelectedCombinationOptions] = useState<{ [key: string]: Set<string> }>({});

  // Inicializar categoría seleccionada cuando menu cambia
  useEffect(() => {
    if (selectedCategoryId === null && menu.categories && menu.categories.length > 0) {
      setSelectedCategoryId(menu.categories[0].id);
    }
  }, [menu.categories, selectedCategoryId]);

  useEffect(() => {
    if ((!autoSelectFirstSize && !autoSelectVariantOrder?.length) || !menu.categories) {
      return;
    }

    setSelectedSizes((prev) => {
      const updated = { ...prev };
      let hasChanges = false;
      let variantProductIndex = 0;

      menu.categories.forEach((category: any) => {
        category.products?.forEach((product: any) => {
          if (
            product.hasVariants &&
            product.variants?.sizes &&
            product.variants.sizes.length > 0 &&
            (updated[product.id] === undefined || updated[product.id] === null)
          ) {
            let desiredSizeId: number | undefined;

            if (autoSelectVariantOrder?.length) {
              const desiredIndex = autoSelectVariantOrder[variantProductIndex];
              if (desiredIndex !== undefined) {
                const clampedIndex = Math.min(Math.max(desiredIndex, 0), product.variants.sizes.length - 1);
                desiredSizeId = product.variants.sizes[clampedIndex]?.id;
              }
            }

            if (!desiredSizeId && autoSelectFirstSize) {
              desiredSizeId = product.variants.sizes[0].id;
            }

            if (desiredSizeId) {
              updated[product.id] = desiredSizeId;
              hasChanges = true;
            }

            variantProductIndex += 1;
          }
        });
      });

      return hasChanges ? updated : prev;
    });
  }, [autoSelectFirstSize, autoSelectVariantOrder, menu.categories]);

  const getThemeColors = (t: string) => {
    const themes: Record<string, { header: string; light: string; text: string; btn: string; border: string; gradientRgba: string }> = {
      orange: { header: 'from-orange-500 to-orange-600', light: 'bg-orange-100', text: 'text-orange-600', btn: 'bg-orange-500', border: 'border-orange-100', gradientRgba: 'rgba(255, 159, 64, 0.08)' },
      blue: { header: 'from-blue-500 to-blue-600', light: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-500', border: 'border-blue-100', gradientRgba: 'rgba(59, 130, 246, 0.08)' },
      green: { header: 'from-green-500 to-green-600', light: 'bg-green-100', text: 'text-green-600', btn: 'bg-green-500', border: 'border-green-100', gradientRgba: 'rgba(34, 197, 94, 0.08)' },
      red: { header: 'from-red-500 to-red-600', light: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-500', border: 'border-red-100', gradientRgba: 'rgba(239, 68, 68, 0.08)' },
      purple: { header: 'from-purple-500 to-purple-600', light: 'bg-purple-100', text: 'text-purple-600', btn: 'bg-purple-500', border: 'border-purple-100', gradientRgba: 'rgba(168, 85, 247, 0.08)' },
      pink: { header: 'from-pink-500 to-pink-600', light: 'bg-pink-100', text: 'text-pink-600', btn: 'bg-pink-500', border: 'border-pink-100', gradientRgba: 'rgba(236, 72, 153, 0.08)' },
      cyan: { header: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-100', text: 'text-cyan-600', btn: 'bg-cyan-500', border: 'border-cyan-100', gradientRgba: 'rgba(34, 211, 238, 0.08)' },
      lime: { header: 'from-lime-500 to-lime-600', light: 'bg-lime-100', text: 'text-lime-600', btn: 'bg-lime-500', border: 'border-lime-100', gradientRgba: 'rgba(132, 204, 22, 0.08)' },
      amber: { header: 'from-amber-500 to-amber-600', light: 'bg-amber-100', text: 'text-amber-600', btn: 'bg-amber-500', border: 'border-amber-100', gradientRgba: 'rgba(217, 119, 6, 0.08)' },
      indigo: { header: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-100', text: 'text-indigo-600', btn: 'bg-indigo-500', border: 'border-indigo-100', gradientRgba: 'rgba(99, 102, 241, 0.08)' },
      rose: { header: 'from-rose-500 to-rose-600', light: 'bg-rose-100', text: 'text-rose-600', btn: 'bg-rose-500', border: 'border-rose-100', gradientRgba: 'rgba(244, 63, 94, 0.08)' },
      teal: { header: 'from-teal-500 to-teal-600', light: 'bg-teal-100', text: 'text-teal-600', btn: 'bg-teal-500', border: 'border-teal-100', gradientRgba: 'rgba(20, 184, 166, 0.08)' },
    };
    
    // Si es un color HEX personalizado
    if (t && t.startsWith('#')) {
      const hexColor = t;
      // Convertir HEX a RGB para gradiente y rgba
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.08)`;
      const borderRgba = `rgba(${r}, ${g}, ${b}, 0.15)`; // Borde con baja opacidad como border-[color]-100
      
      return {
        header: 'from-custom-color to-custom-color',
        light: 'bg-custom-light',
        text: 'text-custom-text',
        btn: 'bg-custom-btn',
        border: 'border-custom-border',
        gradientRgba: rgbaColor,
        // Agregamos propiedades adicionales para colores custom
        customHex: hexColor,
        customRgba: `rgb(${r}, ${g}, ${b})`,
        customBorderColor: borderRgba, // Borde con baja opacidad
      };
    }
    
    return themes[t] || themes['orange'];
  };

  const colors = getThemeColors(theme);
  
  // Función auxiliar para obtener estilos de botón con color personalizado
  const getButtonStyle = () => {
    if ((colors as any).customHex) {
      return { backgroundColor: (colors as any).customRgba, color: 'white' };
    }
    return undefined;
  };

  // Función auxiliar para obtener clase de botón o style
  const getButtonClasses = () => {
    if ((colors as any).customHex) {
      return 'text-white shadow-md';
    }
    return `${colors.btn} text-white shadow-md`;
  };

  // Función auxiliar para obtener estilos de border con color personalizado
  const getBorderStyle = () => {
    if ((colors as any).customHex) {
      return { borderColor: (colors as any).customBorderColor };
    }
    return undefined;
  };

  // Función auxiliar para obtener clase de border o style
  const getBorderClasses = () => {
    if ((colors as any).customHex) {
      return '';
    }
    return colors.border;
  };

  // Función auxiliar para obtener estilos de texto con color personalizado
  const getTextStyle = () => {
    if ((colors as any).customHex) {
      return { color: (colors as any).customRgba };
    }
    return undefined;
  };

  // Función auxiliar para obtener clase de texto o style
  const getTextClasses = () => {
    if ((colors as any).customHex) {
      return '';
    }
    return colors.text;
  };
  
  // Crear categoría de productos destacados dinámicamente si está habilitada
  const categoriesWithFeatured = menu.enableFeaturedProducts && menu.categories
    ? [
        {
          id: 'featured',
          name: '⭐ Destacados',
          products: menu.categories
            .flatMap((cat: any) => cat.products || [])
            .filter((p: any) => p.featured),
        } as any,
        ...menu.categories,
      ]
    : menu.categories;

  const selectedCategory = categoriesWithFeatured?.find((c: any) => c.id === selectedCategoryId);
  
  // Si la categoría seleccionada es 'featured' pero no hay productos destacados, cambiar a la primera categoría
  useEffect(() => {
    if (selectedCategoryId === 'featured' && selectedCategory?.products?.length === 0) {
      if (menu.categories && menu.categories.length > 0) {
        setSelectedCategoryId(menu.categories[0].id);
      }
    }
  }, [menu.enableFeaturedProducts, menu.categories, selectedCategoryId, selectedCategory?.products?.length]);

  const getProductPrice = (product: any, sizeId?: number | null, combinationKey?: string) => {
    if (!product.hasVariants || !sizeId) {
      return product.price || 0;
    }

    const size = product.variants?.sizes?.find((s: any) => s.id === sizeId);
    const sizePrice = size?.price || 0;

    if (combinationKey && selectedCombinationOptions[combinationKey]?.size > 0) {
      const selectedProductId = Array.from(selectedCombinationOptions[combinationKey])[0];
      const combinedProduct = selectedCategory?.products?.find((p: any) => p.id.toString() === selectedProductId);
      
      if (combinedProduct) {
        const combinedPrice = combinedProduct.hasVariants ? 0 : (combinedProduct.price || 0);
        return Math.max(sizePrice, combinedPrice);
      }
    }

    return sizePrice;
  };

  const menuContent = (
    <>
      {/* Header */}
      <div 
        className={`text-white flex-shrink-0 flex items-center justify-between gap-4 h-24 overflow-hidden px-4 ${!((colors as any).customHex) ? `bg-gradient-to-r ${colors.header}` : ''}`}
        style={
          (colors as any).customHex 
            ? { background: `linear-gradient(to right, ${(colors as any).customRgba}, ${(colors as any).customRgba})` }
            : undefined
        }
      >
        {/* Mostrar icono y nombre de plantilla si está disponible (para landing) */}
        {templateIcon && templateName && (
          <>
            <div className="text-5xl flex-shrink-0">{templateIcon}</div>
            <div className="flex flex-col justify-center gap-0.5 flex-1 text-center">
              <p className="text-sm font-bold">{templateName}</p>
              {templateSubtitle && (
                <p className="text-xs font-light opacity-90">{templateSubtitle}</p>
              )}
            </div>
          </>
        )}

        {/* Mostrar solo icono si templateIcon existe pero templateName no */}
        {templateIcon && !templateName && (
          <div className="text-5xl">{templateIcon}</div>
        )}

        {/* Si NO hay template icon, mostrar los logos del negocio como antes */}
        {!templateIcon && menu.logoMode === 'logo-only' && menu.businessLogo && (
          <img 
            src={menu.businessLogo} 
            alt="Logo" 
            className="object-contain shadow-md"
            key={menu.businessLogo}
            style={{ 
              height: `${menu.logoSize || 100}%`,
              transform: `translate(${menu.logoOnlyOffsetX || 0}px, ${menu.logoOnlyOffsetY || 0}px)`,
            }}
          />
        )}

        {!templateIcon && menu.logoMode === 'logo-name' && (
          <div className="flex w-full gap-6 items-center px-4 py-3 h-24">
            <div 
              className="flex items-center justify-center w-1/3 h-24 overflow-hidden"
              style={{ 
                transform: `scale(${(menu.logoSize || 100) / 100}) translate(${menu.logoOffsetX || 0}px, ${menu.logoOffsetY || 0}px)`,
                transformOrigin: 'center' 
              }}
            >
              {menu.businessLogo && (
                <img 
                  src={menu.businessLogo} 
                  alt="Logo" 
                  className="object-contain shadow-md"
                  key={menu.businessLogo}
                />
              )}
            </div>
            <div className="flex items-center justify-center w-2/3 h-24">
              <div className="text-center">
                <h1 className="font-bold text-lg">{businessName}</h1>
                <p className="text-xs opacity-75">{menu.menuSubtitle || 'Menú Digital QR'}</p>
                {/* Redes Sociales */}
                {menu.enableSocialLinks && menu.socialLinks && Object.values(menu.socialLinks).some((s: any) => s?.enabled) && (
                  <div className="flex justify-center gap-2 mt-2">
                    {[
                      { key: 'facebook', icon: '/facebook.svg', label: 'Facebook' },
                      { key: 'instagram', icon: '/instagram.svg', label: 'Instagram' },
                      { key: 'tiktok', icon: '/tiktok.svg', label: 'TikTok' },
                      { key: 'x', icon: '/x.svg', label: 'X' },
                      { key: 'whatsapp', icon: '/whatsapp.png', label: 'WhatsApp' },
                    ].map((social) => {
                      const socialData = menu.socialLinks?.[social.key];
                      if (!socialData?.enabled) return null;
                      return (
                        <a
                          key={social.key}
                          href={socialData.url || '#'}
                          target={socialData.url ? '_blank' : undefined}
                          rel={socialData.url ? 'noopener noreferrer' : undefined}
                          title={social.label}
                          className="w-6 h-6 inline-flex items-center justify-center transition-all hover:scale-125 opacity-80 hover:opacity-100"
                        >
                          <img src={social.icon} alt={social.label} className="w-full h-full object-contain filter brightness-0 invert" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!templateIcon && menu.logoMode === 'name-only' && (
          <div className="text-center">
            <h1 className="font-bold text-lg">{businessName}</h1>
            <p className="text-xs opacity-75">{menu.menuSubtitle || 'Menú Digital QR'}</p>
            {/* Redes Sociales */}
            {menu.enableSocialLinks && menu.socialLinks && Object.values(menu.socialLinks).some((s: any) => s?.enabled) && (
              <div className="flex justify-center gap-2 mt-2">
                {[
                  { key: 'facebook', icon: '/facebook.svg', label: 'Facebook' },
                  { key: 'instagram', icon: '/instagram.svg', label: 'Instagram' },
                  { key: 'tiktok', icon: '/tiktok.svg', label: 'TikTok' },
                  { key: 'x', icon: '/x.svg', label: 'X' },
                  { key: 'whatsapp', icon: '/whatsapp.png', label: 'WhatsApp' },
                ].map((social) => {
                  const socialData = menu.socialLinks?.[social.key];
                  if (!socialData?.enabled) return null;
                  return (
                    <a
                      key={social.key}
                      href={socialData.url || '#'}
                      target={socialData.url ? '_blank' : undefined}
                      rel={socialData.url ? 'noopener noreferrer' : undefined}
                      title={social.label}
                      className="w-6 h-6 inline-flex items-center justify-center transition-all hover:scale-125 opacity-80 hover:opacity-100"
                    >
                      <img src={social.icon} alt={social.label} className="w-full h-full object-contain filter brightness-0 invert" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categorías */}
      {categoriesWithFeatured && categoriesWithFeatured.length > 0 && (
        <div 
          className={`flex-shrink-0 overflow-x-auto bg-white border-b-2 ${getBorderClasses()}`}
          style={getBorderStyle()}
        >
          <div className="flex gap-2 p-2">
            {categoriesWithFeatured.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all duration-300 ${
                  selectedCategoryId === category.id
                    ? `${getButtonClasses()} scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategoryId === category.id ? getButtonStyle() : undefined}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {selectedCategory && selectedCategory.products && selectedCategory.products.length > 0 ? (
          selectedCategory.products.map((product: any, idx: number) => {
            const productImageSrc = resolvePublicAssetUrl(product.imageUrl);
            return (
            <div
              key={product.id}
              className={`border-2 ${getBorderClasses()} rounded-lg overflow-hidden transition-all duration-500 ${
                !product.active ? 'opacity-50 grayscale' : 'hover:shadow-md'
              }`}
              style={{ 
                animation: `slideIn 0.4s ease-out ${idx * 0.1}s both`,
                ...getBorderStyle(),
                background: `linear-gradient(135deg, ${colors.gradientRgba}, white)`,
              }}
            >
              <div className="p-3 flex flex-col gap-2">
                {/* Fila 1: Imagen + Info */}
                <div className="flex gap-3">
                  {businessPlan !== 'free' && (
                    <div className="w-24 h-24 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-4xl shadow-md overflow-hidden bg-gray-300">
                      {product.imageUrl ? (
                        <img
                          src={productImageSrc}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          key={productImageSrc}
                        />
                      ) : (
                        <div className="text-3xl">📷</div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                        {product.description || 'Delicioso producto de nuestra cocina'}
                      </p>
                    </div>
                    
                    {product.hasVariants && product.variants?.sizes && product.variants.sizes.length > 0 ? (
                      selectedSizes[product.id] ? (
                        <div className="flex items-center justify-between mt-2">
                          <p className={`${getTextClasses()} font-bold text-base`} style={getTextStyle()}>
                            ${getProductPrice(product, selectedSizes[product.id], `${product.id}_combo`).toFixed(2)}
                          </p>
                          {onAddToCart && businessPlan === 'ventas' && (
                            <button
                              onClick={() => {
                                const combinationKey = `${product.id}_combo`;
                                const combinationName = enabledCombinations[combinationKey] && selectedCombinationOptions[combinationKey]?.size > 0
                                  ? Array.from(selectedCombinationOptions[combinationKey])[0]
                                  : undefined;
                                onAddToCart(product, selectedSizes[product.id], combinationName);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
                            >
                              + Agregar Pedido
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs mt-2 italic">Selecciona un tamaño</p>
                      )
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className={`${getTextClasses()} font-bold text-base`} style={getTextStyle()}>
                          ${product.price?.toFixed(2) || '0.00'}
                        </p>
                        {onAddToCart && businessPlan === 'ventas' && (
                          <button
                            onClick={() => {
                              const combinationKey = `${product.id}_combo`;
                              const combinationName = enabledCombinations[combinationKey] && selectedCombinationOptions[combinationKey]?.size > 0
                                ? Array.from(selectedCombinationOptions[combinationKey])[0]
                                : undefined;
                              onAddToCart(product, null, combinationName);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
                          >
                            + Agregar Pedido
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fila 2: Tamaños */}
                {product.hasVariants && product.variants?.sizes && product.variants.sizes.length > 0 && (
                  <div 
                    className={`w-full flex flex-wrap gap-2 pt-2 border-t ${getBorderClasses()}`}
                    style={getBorderStyle()}
                  >
                    {product.variants.sizes.map((size: any) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size.id })}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                          selectedSizes[product.id] === size.id
                            ? `${getButtonClasses()}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={selectedSizes[product.id] === size.id ? getButtonStyle() : undefined}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fila 3: Combinaciones */}
                {product.hasVariants && selectedSizes[product.id] && selectedCategory && selectedCategory.products && selectedCategory.products.length > 1 && (() => {
                  const selectedSize = product.variants?.sizes?.find((s: any) => s.id === selectedSizes[product.id]);
                  return selectedSize?.allowCombinations !== false;
                })() && (
                  <div 
                    className={`w-full pt-2 border-t ${getBorderClasses()}`}
                    style={getBorderStyle()}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-800">Combinar {selectedCategory?.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Mitad de este sabor + mitad de otro</p>
                        </div>
                        
                        {/* Toggle Switch */}
                        <button
                          onClick={() => {
                            setEnabledCombinations(prev => {
                              const newState = { ...prev };
                              const key = `${product.id}_combo`;
                              newState[key] = !newState[key];
                              return newState;
                            });
                            if (enabledCombinations[`${product.id}_combo`] && selectedCombinationOptions[`${product.id}_combo`]) {
                              setSelectedCombinationOptions(prev => {
                                const newState = { ...prev };
                                delete newState[`${product.id}_combo`];
                                return newState;
                              });
                            }
                          }}
                          className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enabledCombinations[`${product.id}_combo`]
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              enabledCombinations[`${product.id}_combo`] ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      {enabledCombinations[`${product.id}_combo`] && (
                        <div className="px-3 py-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Elige el otro sabor:</p>
                          <div className="flex overflow-x-auto gap-2 pb-2 -mx-3 px-3 scrollbar-hide">
                            {selectedCategory.products
                              .filter((p: any) => p.id !== product.id && p.active)
                              .map((otherProduct: any) => {
                                const isSelected = selectedCombinationOptions[`${product.id}_combo`]?.has(otherProduct.id.toString()) || false;

                                return (
                                  <button
                                    key={otherProduct.id}
                                    onClick={() => {
                                      setSelectedCombinationOptions(prev => {
                                        const key = `${product.id}_combo`;
                                        const newSet = new Set<string>();
                                        
                                        if (!isSelected) {
                                          newSet.add(otherProduct.id.toString());
                                        }
                                        
                                        return {
                                          ...prev,
                                          [key]: newSet
                                        };
                                      });
                                    }}
                                    className={`px-2 py-1.5 text-xs rounded-lg border transition-all whitespace-nowrap ${
                                      isSelected
                                        ? `${getButtonClasses()} font-semibold`
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                                    }`}
                                    style={isSelected ? getButtonStyle() : undefined}
                                  >
                                    {isSelected && '✓ '}{otherProduct.name}
                                  </button>
                                );
                              })}
                          </div>
                          
                          {(() => {
                            const selectedCount = selectedCombinationOptions[`${product.id}_combo`]?.size || 0;
                            const selectedProductName = selectedCount > 0 
                              ? Array.from(selectedCombinationOptions[`${product.id}_combo`] || [])[0]
                              : null;
                            const combinedProduct = selectedProductName 
                              ? selectedCategory?.products?.find((p: any) => p.id.toString() === selectedProductName)
                              : null;
                            
                            return selectedCount > 0 ? (
                              <p className="text-xs text-green-600 font-bold mt-2">
                                ✓ ½ {product.name} + ½ {combinedProduct?.name}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 italic mt-2">
                                Selecciona un sabor para combinar
                              </p>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-xs text-center">
              {menu.categories && menu.categories.length > 0
                ? 'Sin productos en esta categoría'
                : 'Sin categorías aún'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className={`border-t-2 ${getBorderClasses()} p-3 bg-white flex-shrink-0 text-center`}
        style={getBorderStyle()}
      >
        {menu.whatsappNumber && menu.whatsappNumber.trim() ? (
          <p className="font-semibold text-xs text-gray-700 mb-1">📞 {menu.whatsappNumber}</p>
        ) : null}
        {menu.businessHours && menu.businessHours.trim() ? (
          <p className="text-gray-500 text-xs mb-2">{menu.businessHours}</p>
        ) : null}
        {(businessPlan === 'free' || menu.showScanelaBranding !== false) && (
          <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-600">Scanela</span> ✨</p>
        )}
      </div>
    </>
  );

  if (showFrame) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-black rounded-3xl shadow-2xl overflow-hidden border-8 border-black flex flex-col" style={{ height: '680px' }}>
          <div className="w-full h-full bg-white overflow-hidden flex flex-col">
            {menuContent}
          </div>
        </div>
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col">
      {menuContent}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

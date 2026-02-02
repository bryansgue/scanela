"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart as ShoppingCartIcon, X } from "lucide-react";
import MenuDisplay from "./MenuDisplay";
import ShoppingCart from "./ShoppingCart";

interface MenuWithCartProps {
  menu: any;
  businessName: string;
  businessId: number;
  businessPlan: "free" | "menu" | "ventas";
  theme?: string;
  showFrame?: boolean;
}

export default function MenuDisplayWithCart({
  menu,
  businessName,
  businessId,
  businessPlan,
  theme = "orange",
  showFrame = false,
}: MenuWithCartProps) {
  const { items, setBusinessId, addItem, getItemCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // Establecer businessId en el contexto cuando cargue
  useEffect(() => {
    console.log('🏪 MenuDisplayWithCart - businessId:', businessId);
    if (businessId) {
      setBusinessId(businessId);
    } else {
      // Para testing, usar un ID de prueba
      setBusinessId(999);
    }
  }, [businessId, setBusinessId]);

  const itemCount = getItemCount();

  // Obtener colores del tema
  const getThemeColors = (t: string) => {
    const themes: Record<string, { btn: string; border: string; text: string }> = {
      orange: { btn: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
      blue: { btn: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
      green: { btn: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
      red: { btn: 'bg-red-500', border: 'border-red-500', text: 'text-red-600' },
      purple: { btn: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-600' },
      pink: { btn: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-600' },
      cyan: { btn: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-600' },
      lime: { btn: 'bg-lime-500', border: 'border-lime-500', text: 'text-lime-600' },
      amber: { btn: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600' },
      indigo: { btn: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600' },
      rose: { btn: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-600' },
      teal: { btn: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-600' },
    };
    return themes[t] || themes['orange'];
  };

  const themeColors = getThemeColors(theme);

  // Manejar agregar producto real al carrito
  const handleAddToCart = (product: any, sizeId?: number | null, combinationProductId?: string) => {
    // Obtener el precio basado en si tiene variantes o no
    let price = product.price || 0;
    
    if (product.hasVariants && sizeId && product.variants?.sizes) {
      const size = product.variants.sizes.find((s: any) => s.id === sizeId);
      price = size?.price || product.price || 0;
    }

    // Crear ID ÚNICO para cada pedido (cada clic es un pedido independiente)
    // Incluir timestamp para asegurar que sean totalmente únicos
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const itemId = `${product.id}-${sizeId || 'no-size'}-${combinationProductId || 'no-combo'}-${timestamp}-${random}`;
    
    // Obtener nombre del tamaño si aplica
    let sizeName = '';
    if (sizeId && product.variants?.sizes) {
      const size = product.variants.sizes.find((s: any) => s.id === sizeId);
      if (size) {
        sizeName = size.name;
      }
    }

    // Si hay combinación, agregar esa información al final con el tamaño
    let combinationName = undefined;
    if (combinationProductId && menu.categories) {
      // Encontrar el producto de la combinación en el menú
      for (const category of menu.categories) {
        const combinedProduct = category.products?.find((p: any) => p.id.toString() === combinationProductId);
        if (combinedProduct) {
          // Si hay tamaño, agrégalo al nombre de la combinación
          if (sizeName) {
            combinationName = `${combinedProduct.name} ${sizeName}`;
          } else {
            combinationName = combinedProduct.name;
          }
          break;
        }
      }
    }

    // Crear nombre del item
    let itemName = product.name;
    if (combinationName) {
      // Con combinación: "Pizza Peperona + Pizza Hawaiana Mediana"
      itemName = `${product.name} + ${combinationName}`;
    } else if (sizeName) {
      // Sin combinación pero con tamaño: "Pizza Margarita - Mediana"
      itemName = `${product.name} - ${sizeName}`;
    }

    addItem({
      id: itemId,
      name: itemName,
      price,
      quantity: 1,
      businessId,
      category: product.category || 'Sin categoría',
      imageUrl: product.imageUrl,
      combination: combinationName, // Guardar nombre de combinación
    });

    // Mostrar notificación en lugar de alert
    setNotification({
      message: `${itemName} agregado`,
      visible: true,
    });

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
      setNotification({ message: "", visible: false });
    }, 3000);
  };

  // Si es Plan Menu, mostrar solo el menú
  if (businessPlan === "menu") {
    return (
      <div className="w-full min-h-screen bg-white">
        <MenuDisplay 
          menu={menu} 
          businessName={businessName} 
          theme={theme}
          showFrame={showFrame}
          businessPlan="menu"
        />
      </div>
    );
  }

  // Si es Plan Ventas, mostrar menú + carrito
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Menú - 100% en mobile, 65% en desktop */}
      <div className="w-full md:w-3/5 lg:w-2/3 overflow-y-auto">
        <MenuDisplay 
          menu={menu} 
          businessName={businessName} 
          theme={theme}
          showFrame={showFrame}
          onAddToCart={handleAddToCart}
          businessPlan={businessPlan}
        />
      </div>

      {/* Carrito - hidden en mobile, 35% en desktop, 33% en lg */}
      <div className="hidden md:flex md:flex-col w-full md:w-2/5 lg:w-1/3 bg-white border-l-2 border-gray-200 h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl font-bold text-gray-900">🛒 Tu Carrito</h2>
          {itemCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">{itemCount} producto{itemCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <ShoppingCart />
        </div>
      </div>

      {/* Carrito flotante en mobile */}
      {itemCount > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg z-40 flex items-center justify-center"
        >
          <ShoppingCartIcon size={24} />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        </button>
      )}

      {/* Modal carrito en mobile */}
      {showCart && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-lg shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Tu Carrito</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <ShoppingCart />
            </div>
          </div>
        </div>
      )}

      {/* Notificación de producto agregado */}
      {notification.visible && (
        <div className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-4 ${themeColors.border} px-8 py-4 shadow-lg flex items-center justify-center`}>
          <span className={`font-semibold text-center text-lg ${themeColors.text}`}>{notification.message}</span>
        </div>
      )}
    </div>
  );
}

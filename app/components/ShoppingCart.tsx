"use client";

import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingCart as ShoppingCartIcon, Plus, Minus } from "lucide-react";
import Link from "next/link";

export default function ShoppingCart() {
  const { items, getTotal, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center">
        <ShoppingCartIcon size={56} className="text-gray-300 mb-4" />
        <p className="text-gray-600 text-lg font-semibold">Tu carrito está vacío</p>
        <p className="text-gray-400 text-sm mt-2">Agrega productos para comenzar tu orden</p>
      </div>
    );
  }

  const total = getTotal();
  const totalWithTax = total * 1.1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCartIcon size={24} />
          Tu Carrito
        </h2>
        <p className="text-blue-100 text-sm mt-1">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Lista de items - scrolleable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-3">
              {/* Imagen */}
              <div className="w-20 h-20 rounded-lg flex-shrink-0 bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-xs mt-2">${item.price.toFixed(2)} c/u</p>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-1 mt-2 bg-gray-100 rounded-lg w-fit p-1">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Disminuir cantidad"
                  >
                    <Minus size={14} className="text-gray-600" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Aumentar cantidad"
                  >
                    <Plus size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Subtotal y eliminar */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs">Subtotal</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen y botones */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg space-y-3">
        {/* Desglose de precios */}
        <div className="space-y-2 pb-3 border-b border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">IVA (10%):</span>
            <span className="font-semibold text-gray-900">${(total * 0.1).toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">Total:</span>
          <span className="font-bold text-blue-600 text-lg">${totalWithTax.toFixed(2)}</span>
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 px-3 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center text-sm"
          >
            Seguir
          </Link>
          <Link
            href="/checkout"
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm"
          >
            Pagar
          </Link>
        </div>
      </div>
    </div>
  );
}

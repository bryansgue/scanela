"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  businessId: number;
  category?: string;
  imageUrl?: string;
  combination?: string; // Para guardar la combinación si existe
}

interface CartContextType {
  items: CartItem[];
  businessId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setBusinessId: (businessId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hidratar carrito desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      const savedBusinessId = localStorage.getItem("cartBusinessId");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
          if (savedBusinessId) setBusinessId(parseInt(savedBusinessId));
        } catch (e) {
          console.error("Error loading cart:", e);
        }
      }
      setHydrated(true);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
      if (businessId) {
        localStorage.setItem("cartBusinessId", businessId.toString());
      }
    }
  }, [items, businessId, hydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === newItem.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prevItems, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartBusinessId");
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const setBusinessIdHandler = (newBusinessId: number) => {
    setBusinessId(newBusinessId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        businessId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        setBusinessId: setBusinessIdHandler,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

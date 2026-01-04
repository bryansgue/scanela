"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { UserPlanProvider } from "./context/UserPlanContext";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos (reducido)
      gcTime: 1000 * 60 * 10, // 10 minutos (garbage collection)
      retry: 1,
      refetchOnWindowFocus: false, // 🚀 No refetch al volver al tab
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPlanProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </UserPlanProvider>
    </QueryClientProvider>
  );
}

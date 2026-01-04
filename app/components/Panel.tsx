"use client";

import React from "react";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Panel estandarizado para toda la aplicación
 * Proporciona consistencia visual en todos los paneles
 */
export default function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur 
        p-8 rounded-xl shadow-lg 
        border border-gray-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}

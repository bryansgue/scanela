"use client";

import { ReactNode, memo } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  active: boolean;
  color: string;
  loading: boolean;
  onClick: () => void;
}

export default memo(function NetworkButton({
  icon,
  label,
  active,
  color,
  loading,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        w-full flex items-center justify-between p-4 rounded-xl border shadow-sm
        hover:shadow-md hover:scale-[1.01] transition-all duration-200
        cursor-pointer
        ${active ? "border-transparent text-white" : "border-gray-200 bg-white"}
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
      `}
      style={{ background: active ? color : undefined }}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`text-xl transition-all duration-200 ${
            active ? "brightness-0 invert" : ""
          }`}
        >
          {icon}
        </div>
        <span className="font-semibold">{label}</span>
      </div>

      {loading ? (
        <div
          className="
            h-5 w-5 border-2 border-white border-t-transparent 
            rounded-full animate-spin
          "
        ></div>
      ) : (
        <span
          className={`
            px-3 py-1 rounded-md text-xs font-semibold
            ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-700"}
          `}
        >
          {active ? "Desconectar" : "Conectar"}
        </span>
      )}
    </button>
  );
});

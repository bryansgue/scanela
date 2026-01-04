"use client";

import { useState } from "react";
import { updateUserProfile } from "@/lib/supabase/auth";
import Panel from "@/components/Panel";
import { Loader2, Check, X } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  provider: string;
}

interface Props {
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
}

export default function SettingsProfile({ user, onUserUpdate }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "El nombre no puede estar vacío" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await updateUserProfile({ full_name: fullName });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        const updatedUser = { ...user, fullName };
        onUserUpdate(updatedUser);
        setMessage({ type: "success", text: "Nombre actualizado correctamente" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al actualizar el nombre" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Mi Perfil</h2>

      {/* Campo Nombre Completo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isSaving}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Tu nombre completo"
        />
      </div>

      {/* Email (solo lectura) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">No puedes cambiar tu email</p>
      </div>

      {/* Método de Autenticación */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Autenticación</label>
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            {user.provider === "google" && "🔵 Google"}
            {user.provider === "github" && "⚫ GitHub"}
            {user.provider === "discord" && "🟣 Discord"}
            {user.provider === "email" && "✉️ Email y Contraseña"}
          </p>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? <Check size={20} /> : <X size={20} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Botón Guardar */}
      <button
        onClick={handleSaveName}
        disabled={isSaving || fullName === user.fullName}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Cambios"
        )}
      </button>
    </Panel>
  );
}

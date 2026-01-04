"use client";

import { useState } from "react";
import { changePassword } from "@/lib/supabase/auth";
import Panel from "@/components/Panel";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

interface Props {
  isExternalProvider: boolean;
}

export default function SettingsSecurity({ isExternalProvider }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async () => {
    // Validaciones
    if (!newPassword.trim()) {
      setMessage({ type: "error", text: "Ingresa una nueva contraseña" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await changePassword(newPassword);

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al cambiar la contraseña" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Seguridad</h2>

      {isExternalProvider ? (
        /* Si es proveedor externo (Google, GitHub, etc) */
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Autenticación mediante Proveedor Externo
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Tu cuenta está protegida por un proveedor de autenticación externo. No necesitas cambiar
                contraseña aquí.
              </p>
              <p className="text-xs text-blue-700">
                Si deseas cambiar tu contraseña o información de seguridad, hazlo directamente en la configuración
                de tu cuenta en el proveedor de autenticación.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Si es autenticación tradicional (email/contraseña) */
        <div>
          <p className="text-gray-600 text-sm mb-6">Cambia tu contraseña para mantener tu cuenta segura.</p>

          {/* Nueva Contraseña */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Mínimo 8 caracteres"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          {/* Confirmar Contraseña */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Repite la contraseña"
            />
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

          {/* Botón Cambiar Contraseña */}
          <button
            onClick={handleChangePassword}
            disabled={isSaving || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Actualizando...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </button>
        </div>
      )}
    </Panel>
  );
}

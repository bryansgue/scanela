"use client";

import Image from "next/image";
import { useState } from "react";
import { changePassword, updateUserProfile } from "@/lib/supabase/auth";
import Panel from "@/components/Panel";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  provider: string;
  providers: string[];
}

interface Props {
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
}

type StatusMessage = { type: "success" | "error"; text: string } | null;

const PROVIDER_META: Record<string, { label: string; hint: string; badge: string; icon: string }> = {
  email: {
    label: "Email y contraseña",
    hint: "Puedes actualizar tu contraseña directamente desde Scanela.",
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
    icon: "✉️",
  },
  google: {
    label: "Google",
    hint: "Inicio de sesión con tu cuenta de Google.",
    badge: "bg-red-50 text-red-700 border border-red-200",
    icon: "🔵",
  },
  github: {
    label: "GitHub",
    hint: "Inicio de sesión con GitHub.",
    badge: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: "⚫",
  },
  discord: {
    label: "Discord",
    hint: "Inicio de sesión con Discord.",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    icon: "🟣",
  },
  default: {
    label: "Proveedor externo",
    hint: "Inicio de sesión mediante un proveedor externo.",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: "🔐",
  },
};

export default function SettingsProfile({ user, onUserUpdate }: Props) {
  const [fullName, setFullName] = useState(user.fullName);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<StatusMessage>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<StatusMessage>(null);

  const authProviders = user.providers.length ? user.providers : [user.provider];
  const supportsPassword = authProviders.includes("email");

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      setProfileMessage({ type: "error", text: "El nombre no puede estar vacío" });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      const { error } = await updateUserProfile({ full_name: fullName });

      if (error) {
        setProfileMessage({ type: "error", text: error.message });
      } else {
        const updatedUser = { ...user, fullName };
        onUserUpdate(updatedUser);
        setProfileMessage({ type: "success", text: "Nombre actualizado correctamente" });
      }
    } catch (error) {
      console.error("Error al actualizar el nombre", error);
      setProfileMessage({ type: "error", text: "Error al actualizar el nombre" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setPasswordMessage({ type: "error", text: "Ingresa una nueva contraseña" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage(null);

    try {
      const { error } = await changePassword(newPassword);

      if (error) {
        setPasswordMessage({ type: "error", text: error.message });
      } else {
        setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña", error);
      setPasswordMessage({ type: "error", text: "Error al cambiar la contraseña" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getProviderMeta = (provider: string) => PROVIDER_META[provider] || PROVIDER_META.default;

  const primaryProviderMeta = getProviderMeta(authProviders[0]);

  const renderStatusMessage = (message: StatusMessage) => {
    if (!message) return null;
    return (
      <div
        className={`mt-4 mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}
      >
        {message.type === "success" ? <Check size={20} /> : <X size={20} />}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
    );
  };

  return (
    <Panel>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Tu cuenta</h2>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-8">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-2xl font-semibold border border-white shadow-inner">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt="Avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span>{user.email[0]?.toUpperCase() || "U"}</span>
          )}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-500">Nombre para tus menús y facturación</p>
          <p className="text-xl font-semibold text-gray-900">{user.fullName}</p>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* Campo Nombre Completo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isSavingProfile}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Tu nombre completo"
        />
      </div>

      {/* Email (solo lectura) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email principal</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">El email se usa para accesos y notificaciones</p>
      </div>

      {renderStatusMessage(profileMessage)}

      <button
        onClick={handleSaveName}
        disabled={isSavingProfile || fullName === user.fullName}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSavingProfile ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Cambios"
        )}
      </button>

      {/* Autenticación */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Métodos de acceso conectados</h3>
        <p className="text-sm text-gray-500 mb-4">
          Puedes iniciar sesión con cualquiera de los métodos listados.
        </p>
        <div className="space-y-3">
          {authProviders.map((provider) => {
            const meta = getProviderMeta(provider);
            return (
              <div
                key={provider}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-white border ${meta.badge}`}
              >
                <div className="text-xl leading-none">{meta.icon}</div>
                <div>
                  <p className="font-medium text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-600">{meta.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seguridad */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Contraseña y seguridad
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Protege tu cuenta de Scanela manteniendo actualizada tu información de acceso.
        </p>

        {supportsPassword ? (
          <div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            {renderStatusMessage(passwordMessage)}

            <button
              onClick={handleChangePassword}
              disabled={
                isSavingPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex gap-4">
            <AlertCircle size={32} className="text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Gestiona la seguridad desde {primaryProviderMeta.label}
              </p>
              <p className="text-sm text-blue-800">
                Esta cuenta usa autenticación externa. Actualiza tu contraseña o métodos de acceso desde la configuración de {primaryProviderMeta.label}.
              </p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

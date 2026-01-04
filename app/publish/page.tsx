"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import PrivateLayout from "../components/PrivateLayout";
import Spinner from "../components/Spinner";
import { useProfiles } from "../hooks/useProfiles";
import { useNetworks } from "../hooks/useNetworks";
import { Profile } from "../types/Profile";
import PublishForm from "./PublishForm";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PublishPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    profiles,
    selected,
    setSelected,
    loading: loadingProfiles,
  } = useProfiles(user?.id || null);

  const {
    networks,
  } = useNetworks(selected?.id ?? null);

  // ===== LOAD USER SESSION =====
  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    load();
  }, []);

  if (loading || loadingProfiles) {
    return <Spinner />;
  }

  if (!profiles || profiles.length === 0) {
    return (
      <PrivateLayout user={user}>
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-900">No hay perfiles</h3>
              <p className="text-yellow-800 text-sm mt-1">
                Debes crear al menos un perfil antes de poder publicar.
              </p>
            </div>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  const connectedNetworks = networks.filter((n) => n.is_connected);

  return (
    <PrivateLayout user={user}>
      <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Crear Publicación</h1>
            <p className="text-gray-600 mt-2">
              Selecciona un perfil, elige cómo quieres publicar y configura dónde se compartirá.
            </p>
          </div>

          {/* PROFILE SELECTOR */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selecciona Perfil
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {profiles.map((profile: Profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelected(profile)}
                  className={`
                    p-4 rounded-lg font-medium text-sm transition border-2
                    ${
                      selected?.id === profile.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                    }
                  `}
                >
                  {profile.profile_name}
                </button>
              ))}
            </div>
          </div>

          {selected && connectedNetworks.length > 0 && (
            <PublishForm
              profile={selected}
              networks={connectedNetworks}
              userId={user.id}
            />
          )}

          {selected && connectedNetworks.length === 0 && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
              <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Sin redes conectadas</h3>
                <p className="text-yellow-800 text-sm mt-1 mb-4">
                  El perfil "{selected.profile_name}" no tiene redes sociales conectadas. Conecta al menos una para poder publicar.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium text-sm"
                >
                  Ir a Dashboard y conectar red
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}

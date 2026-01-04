"use client";

import { useState, memo } from "react";
import { Loader2, Lock } from "lucide-react";
import { Profile } from "../../../types/Profile";
import ProfileCard from "./ProfileCard";
import { getProfileLimit } from "../../../lib/supabase/auth";
import { useUserPlan } from "../../../context/UserPlanContext";

interface Props {
  profiles: Profile[];
  selected: Profile | null;
  onSelect: (p: Profile) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, newName: string) => Promise<void>; 
}

function ProfileSidebarComponent({
  profiles,
  selected,
  onSelect,
  onCreate,
  onDelete,
  onEdit,
}: Props) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  
  // 🚀 Usar contexto en lugar de cargar plan aquí
  const { plan: userPlan, loading: loadingPlan } = useUserPlan();
  
  const profileLimit = userPlan ? getProfileLimit(userPlan as any) : 0;
  const canCreateMore = profiles.length < profileLimit;

  const handleCreate = async () => {
    if (!name.trim() || creating) return;

    setCreating(true);
    try {
      await onCreate(name.trim());
      // Dar tiempo para que se vea el spinner antes de limpiar
      await new Promise(resolve => setTimeout(resolve, 500));
      setName("");
    } catch (error) {
      console.error("Error creando perfil:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ======= CREAR NUEVO PERFIL ======= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Nuevo Perfil</h3>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {loadingPlan ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                Cargando...
              </span>
            ) : (
              `${profiles.length}/${profileLimit}`
            )}
          </span>
        </div>
        
        {!canCreateMore && !loadingPlan ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <Lock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Límite alcanzado</p>
              <p className="text-xs text-amber-700 mt-1">
                Has alcanzado el límite de {profileLimit} perfiles en tu plan
              </p>
              <a href="/settings" className="text-xs font-semibold text-amber-600 hover:text-amber-700 mt-2 inline-block">
                Mejorar plan →
              </a>
            </div>
          </div>
        ) : loadingPlan ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Cargando información del plan...</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ej: Mi Negocio, Personal..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !creating && canCreateMore && handleCreate()}
              disabled={creating}
              className={`border-2 border-gray-200 p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition ${
                creating ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
              }`}
            />

            <button
              onClick={handleCreate}
              disabled={creating || !name.trim() || !canCreateMore}
              className={`
                px-6 py-3 rounded-xl transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap min-w-fit
                ${
                  !name.trim() || !canCreateMore
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : creating
                    ? "bg-blue-600 text-white cursor-wait shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg cursor-pointer"
                }
              `}
            >
              {creating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                </>
              ) : (
                <>
                  <span>+</span> Crear
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ======= SEPARADOR ======= */}
      <div className="border-t border-gray-200 pt-6"></div>

      {/* ======= LISTA DE PERFILES ======= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Tus Perfiles</h3>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {profiles.length}
          </span>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">No tienes perfiles creados aún</p>
            <p className="text-gray-400 text-xs mt-2">Crea uno para comenzar</p>
          </div>
        ) : (
          <div className={`space-y-3 ${profiles.length > 4 ? "max-h-[400px] overflow-y-auto pr-2" : ""}`}>
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                selected={selected?.id === p.id}
                onClick={() => onSelect(p)}
                onDelete={() => onDelete(p.id)}
                onEdit={(newName) => onEdit(p.id, newName)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 🚀 Memoizar para evitar re-renders innecesarios
export default memo(ProfileSidebarComponent);

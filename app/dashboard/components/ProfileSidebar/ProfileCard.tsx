"use client";

import { useState, MouseEvent } from "react";
import { Profile } from "../../../types/Profile";
import { Trash2, Loader2, Pencil, Check } from "lucide-react";

interface Props {
  profile: Profile;
  selected: boolean;
  onClick: () => void;
  onDelete: () => Promise<void>;
  onEdit: (newName: string) => Promise<void>;
}

export default function ProfileCard({
  profile,
  selected,
  onClick,
  onDelete,
  onEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(profile.profile_name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await onEdit(newName.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (deleting) return;

    const ok = confirm(
      `¿Seguro que deseas eliminar el perfil "${profile.profile_name}"?`
    );
    if (!ok) return;

    setDeleting(true);
    
    try {
      await onDelete();
    } catch (error) {
      console.error("Error eliminando perfil:", error);
    }
    
    // No establecer deleting en false porque el componente se desmontará
    // setDeleting(false);
  };

  return (
    <div
      onClick={() => {
        if (!editing && !deleting) onClick();
      }}
      className={`
        group p-4 rounded-xl border cursor-pointer select-none
        transition-all duration-200 shadow-sm
        hover:shadow-md hover:bg-gray-50
        ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
        ${deleting ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <div className="flex justify-between items-center gap-2">
        {/* nombre o input editable */}
        {editing ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            className="border p-1 rounded-lg w-full"
            autoFocus
          />
        ) : (
          <p className="text-lg font-semibold truncate">
            {profile.profile_name}
          </p>
        )}

        <div className="flex items-center gap-1">
          {/* guardar */}
          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition disabled:opacity-50"
              title={saving ? "Guardando..." : "Guardar"}
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
            </button>
          )}

          {/* editar */}
          {!editing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="p-2 rounded-lg text-blue-500 hover:bg-blue-100 transition"
              title="Editar"
            >
              <Pencil size={18} />
            </button>
          )}

          {/* borrar */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`p-2 rounded-lg transition flex items-center justify-center w-10 h-10 ${
              deleting 
                ? "bg-red-100 cursor-wait" 
                : "text-red-500 hover:bg-red-100 hover:text-red-600"
            }`}
            title={deleting ? "Eliminando..." : "Eliminar"}
          >
            {deleting ? (
              <Loader2 size={20} className="animate-spin text-red-600" />
            ) : (
              <Trash2 size={20} />
            )}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        Redes conectadas: <b>{profile.connected_count ?? 0}</b>
      </p>
    </div>
  );
}

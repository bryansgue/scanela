"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfilesByUser, createProfile, deleteProfile, renameProfile } from "../lib/supabase/profiles";
import { Profile } from "../types/Profile";
import { useState } from "react";

export function useProfiles(userId: string | null) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Profile | null>(null);

  // 🚀 REACT QUERY: Cache automático inteligente
  const {
    data: profiles = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => (userId ? getProfilesByUser(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // � Mutation: crear perfil + auto-invalidar
  const { mutate: addProfile } = useMutation({
    mutationFn: (name: string) => createProfile(userId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
    },
  });

  // 🚀 Mutation: eliminar perfil
  const { mutate: removeProfile } = useMutation({
    mutationFn: (profileId: string) => deleteProfile(profileId),
    onSuccess: (_, profileId) => {
      const newList = profiles.filter((p) => p.id !== profileId);
      if (newList.length === 0) setSelected(null);
      else if (selected?.id === profileId) setSelected(newList[0]);
      queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
    },
  });

  // 🚀 Mutation: editar perfil
  const { mutate: editProfile } = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      renameProfile(id, userId!, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
    },
  });

  // Auto-seleccionar primer perfil
  if (profiles.length > 0 && !selected) {
    setSelected(profiles[0]);
  }

  return {
    profiles,
    selected,
    setSelected,
    loading,
    addProfile,
    removeProfile,
    editProfile: (id: string, newName: string) => editProfile({ id, newName }),
    reload: () => queryClient.invalidateQueries({ queryKey: ["profiles", userId] }),
  };
}

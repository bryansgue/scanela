"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNetworksByProfile, toggleNetwork } from "../lib/supabase/networks";
import { NetworkAccount } from "../types/NetworkAccount";
import { NetworkKey } from "../types/NetworkKey";
import { useMemo } from "react";

export function useNetworks(profileId: string | null) {
  const queryClient = useQueryClient();

  // 🚀 REACT QUERY: Cache automático
  const {
    data: networks = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["networks", profileId],
    queryFn: () => (profileId ? getNetworksByProfile(profileId) : Promise.resolve([])),
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // 🚀 Mutation: toggle network (wrapper para mantener compatibilidad)
  const { mutate: toggleMutation } = useMutation({
    mutationFn: (network: NetworkKey) => toggleNetwork(profileId!, network),
    onSuccess: () => {
      // Auto-refetch redes del perfil actual
      queryClient.invalidateQueries({ queryKey: ["networks", profileId] });
    },
  });

  // Wrapper que acepta el parámetro "current" pero lo ignora
  const toggle = (network: NetworkKey, _current?: boolean) => {
    toggleMutation(network);
  };

  // 🚀 Memoizar para evitar re-renders
  const memoizedNetworks = useMemo(() => networks, [networks]);

  return {
    networks: memoizedNetworks,
    loading,
    toggle,
    reload: () => queryClient.invalidateQueries({ queryKey: ["networks", profileId] }),
  };
}

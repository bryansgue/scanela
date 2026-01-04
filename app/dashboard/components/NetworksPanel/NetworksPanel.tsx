"use client";

import { useState, memo } from "react";
import SocialButtons from "../SocialButtons";
import { NetworkKey } from "../../../types/NetworkKey";
import { NetworkAccount } from "../../../types/NetworkAccount";

interface Props {
  profile: any;
  networks: NetworkAccount[];
  onToggle: (key: NetworkKey, current: boolean) => void;
}

function NetworksPanelComponent({ profile, networks, onToggle }: Props) {
  const [loadingId, setLoadingId] = useState<NetworkKey | null>(null);

  const handleToggle = async (network: NetworkKey, isConnected: boolean) => {
    if (loadingId) return;

    if (isConnected) {
      const ok = confirm(`¿Seguro que deseas desconectar ${network}?`);
      if (!ok) return;
    }

    setLoadingId(network);
    await onToggle(network, isConnected);
    setLoadingId(null);
  };

  // 🔥 Si no hay perfil, mostramos mensaje y dejamos de renderizar
  if (!profile) {
    return (
      <div className="text-center py-16 px-6">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-lg font-semibold text-gray-900 mb-2">Selecciona un perfil</p>
        <p className="text-gray-600 text-sm">Elige o crea un perfil para conectar tus redes sociales</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Redes Sociales
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Perfil: <span className="font-semibold text-gray-900">{profile?.profile_name || "Perfil sin nombre"}</span>
        </p>
      </div>

      <SocialButtons
        networks={networks}
        onToggle={handleToggle}
        loadingId={loadingId}
      />

      {networks.filter(n => n.is_connected).length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Tienes <span className="font-bold">{networks.filter(n => n.is_connected).length}</span> red{networks.filter(n => n.is_connected).length !== 1 ? 'es' : ''} conectada{networks.filter(n => n.is_connected).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// 🚀 Memoizar para evitar re-renders innecesarios
export default memo(NetworksPanelComponent);

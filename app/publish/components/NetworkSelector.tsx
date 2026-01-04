"use client";

import { NetworkAccount } from "../../types/NetworkAccount";
import Panel from "../../components/Panel";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Music,
  Linkedin,
  MessageCircle,
} from "lucide-react";

const networkIcons: Record<string, React.ReactNode> = {
  instagram: (
    <Image
      src="/instagram.svg"
      alt="Instagram"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
  facebook: (
    <Image
      src="/facebook.svg"
      alt="Facebook"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
  youtube: (
    <Image
      src="/youtube.svg"
      alt="YouTube"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
  tiktok: (
    <Image
      src="/tiktok.svg"
      alt="TikTok"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
  linkedin: (
    <Image
      src="/linkedin.svg"
      alt="LinkedIn"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
  threads: (
    <Image
      src="/threads.svg"
      alt="Threads"
      width={20}
      height={20}
      className="w-5 h-5"
    />
  ),
};

const networkColors: Record<string, string> = {
  instagram: "from-pink-500 to-orange-400",
  facebook: "from-blue-600 to-blue-400",
  youtube: "from-red-600 to-red-500",
  tiktok: "from-black to-gray-800",
  linkedin: "from-blue-700 to-blue-600",
  threads: "from-gray-900 to-gray-700",
};

export default function NetworkSelector({
  networks,
  selectedNetworks,
  onToggle,
}: {
  networks: NetworkAccount[];
  selectedNetworks: string[];
  onToggle: (networkId: string) => void;
}) {
  if (networks.length === 0) {
    return null;
  }

  return (
    <Panel>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Selecciona Redes Sociales
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {networks.map((network: NetworkAccount) => (
          <button
            key={network.id}
            type="button"
            onClick={() => onToggle(network.id)}
            className={`
              p-4 rounded-lg border-2 transition flex items-center gap-3
              ${
                selectedNetworks.includes(network.id)
                  ? `border-blue-600 bg-blue-50`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <div
              className="flex items-center justify-center"
            >
              {networkIcons[network.network]}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">
                {network.network.charAt(0).toUpperCase() +
                  network.network.slice(1)}
              </p>
              <p className="text-xs text-gray-600">
                {network.extra_data?.username || "Connected"}
              </p>
            </div>
            {selectedNetworks.includes(network.id) && (
              <div className="ml-auto text-blue-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </Panel>
  );
}

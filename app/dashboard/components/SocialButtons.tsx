"use client";

import { NetworkKey } from "../../types/NetworkKey";
import { NetworkAccount } from "../../types/NetworkAccount";
import NetworkButton from "./NetworksPanel/NetworkButton";
import Image from "next/image";

import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Hexagon,
} from "lucide-react";

interface Props {
  networks: NetworkAccount[];
  onToggle: (key: NetworkKey, current: boolean) => void;
  loadingId?: NetworkKey | null;
}

const NETWORKS = [
  {
    key: "instagram" as NetworkKey,
    label: "Instagram",
    color: "#E1306C",
    icon: (
      <Image
        src="/instagram.svg"
        alt="Instagram"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
  {
    key: "facebook" as NetworkKey,
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <Image
        src="/facebook.svg"
        alt="Facebook"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
  {
    key: "youtube" as NetworkKey,
    label: "YouTube",
    color: "#FF0000",
    icon: (
      <Image
        src="/youtube.svg"
        alt="YouTube"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
  {
    key: "tiktok" as NetworkKey,
    label: "TikTok",
    color: "#000000",
    icon: (
      <Image
        src="/tiktok.svg"
        alt="TikTok"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
  {
    key: "linkedin" as NetworkKey,
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <Image
        src="/linkedin.svg"
        alt="LinkedIn"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
  {
    key: "threads" as NetworkKey,
    label: "Threads",
    color: "#000000",
    icon: (
      <Image
        src="/threads.svg"
        alt="Threads"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    ),
  },
];

export default function SocialButtons({ networks, onToggle, loadingId }: Props) {
  return (
    <div className="space-y-3">
      {NETWORKS.map((net) => {
        const found = networks.find((n) => n.network === net.key);
        const active = found?.is_connected ?? false;

        return (
          <NetworkButton
            key={net.key}
            icon={net.icon}
            label={net.label}
            active={active}
            color={net.color}
            loading={loadingId === net.key}
            onClick={() => onToggle(net.key, active)}
          />
        );
      })}
    </div>
  );
}

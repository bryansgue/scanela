"use client";

import { User, CreditCard, AlertTriangle } from "lucide-react";
import Panel from "@/components/Panel";

interface SettingsSidebarProps {
  activeTab: "profile" | "plan" | "danger";
  onTabChange: (tab: "profile" | "plan" | "danger") => void;
}

export default function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  const tabs = [
    {
      id: "profile" as const,
      label: "Cuenta",
      icon: User,
      description: "Datos personales y accesos",
    },
    {
      id: "plan" as const,
      label: "Plan & Suscripción",
      icon: CreditCard,
      description: "Gestiona tu plan",
    },
    {
      id: "danger" as const,
      label: "Zona de Riesgo",
      icon: AlertTriangle,
      description: "Acciones irreversibles",
      variant: "danger",
    },
  ];

  return (
    <Panel className="h-fit">
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full px-4 py-3 rounded-lg transition-all text-left group ${
                isActive
                  ? tab.variant === "danger"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? tab.variant === "danger"
                        ? "text-red-600"
                        : "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      isActive
                        ? tab.variant === "danger"
                          ? "text-red-700"
                          : "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {tab.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

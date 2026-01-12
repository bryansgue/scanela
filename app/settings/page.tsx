"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrivateLayout from "../components/PrivateLayout";
import SettingsSidebar from "./components/SettingsSidebar";
import SettingsProfile from "./components/SettingsProfile";
import SettingsSecurity from "./components/SettingsSecurity";
import SettingsPlanSimple from "./components/SettingsPlanSimple";
import SettingsDanger from "./components/SettingsDanger";
import { getUserProfile, isAuthProvider } from "../lib/supabase/auth";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  provider: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "plan" | "security" | "danger"
  >("profile");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        if (!profile) {
          router.push("/login");
          return;
        }
        setUser(profile);
      } catch (err) {
        setError("Error al cargar los datos del usuario");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    const checkoutStatus = searchParams.get("checkout");

    if (requestedTab === "plan" || checkoutStatus) {
      setActiveTab("plan");
      if (checkoutStatus) {
        router.replace("/settings?tab=plan", { scroll: false });
      }
    }
  }, [router, searchParams]);

  const isExternalProvider = user ? isAuthProvider(user.provider) : false;

  if (loading) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-100 p-10 flex justify-center items-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando configuraciones...</p>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !user) {
    return (
      <PrivateLayout>
        <div className="min-h-screen bg-gray-100 p-10 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-10 text-center max-w-md">
            <p className="text-red-600 mb-4">{error || "Usuario no encontrado"}</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Volver al Login
            </button>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* Título con nombre completo */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Configuración de {user.fullName}
            </h1>
            <p className="text-gray-600 mt-2">{user.email}</p>
          </div>

          {/* Layout con Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SettingsSidebar activeTab={activeTab} onTabChange={(tab) => {
                setActiveTab(tab);
                router.replace(`/settings?tab=${tab}`, { scroll: false });
              }} />
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <SettingsProfile user={user} onUserUpdate={setUser} />
              )}
              {activeTab === "plan" && <SettingsPlanSimple />}
              {activeTab === "security" && (
                <SettingsSecurity isExternalProvider={isExternalProvider} />
              )}
              {activeTab === "danger" && <SettingsDanger />}
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase/client";
import {
  Home,
  Share2,
  User,
  Layers,
  Settings,
  LogOut,
  Bell,
  Search,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PrivateHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const isActive = (href: string) =>
    pathname === href
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-600 hover:bg-gray-100";

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header
      className="
        w-full bg-white 
        border-b border-gray-100 
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        h-16 flex items-center
      "
    >
      <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">

        {/* LEFT: Logo + Navigation */}
        <div className="flex items-center gap-10">

          {/* LOGO */}
          <Link href="/dashboard" className="text-3xl font-extrabold select-none">
            <span
              className="
                bg-gradient-to-r from-blue-600 to-purple-600
                bg-clip-text text-transparent
              "
            >
              Scanela
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/dashboard")}`}>
              <Home size={18} /> Dashboard
            </Link>

            <Link href="/publish" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/publish")}`}>
              <Share2 size={18} /> Publicar
            </Link>

            <Link href="/history" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/history")}`}>
              <Clock size={18} /> Historial
            </Link>

            <Link href="/dashboard/profiles" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/dashboard/profiles")}`}>
              <User size={18} /> Perfiles
            </Link>

            <Link href="/dashboard/networks" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/dashboard/networks")}`}>
              <Layers size={18} /> Redes
            </Link>

            <Link href="/dashboard/settings" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isActive("/dashboard/settings")}`}>
              <Settings size={18} /> Configuración
            </Link>
          </nav>

        </div>

        {/* RIGHT: Search + Notifications + User */}
        <div className="flex items-center gap-6">

          {/* SEARCH */}
          <div className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg w-64">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Buscar..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* NOTIFICATIONS */}
          <button className="relative hover:opacity-80">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* USER */}
          <div className="flex items-center gap-3 pr-4">
            <div
              className="
                w-9 h-9 rounded-full bg-gray-100 
                flex items-center justify-center 
                text-sm font-semibold text-gray-700 
                border border-gray-300 overflow-hidden
              "
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <span>{(user?.email?.[0] || "U").toUpperCase()}</span>
              )}
            </div>

            <div className="text-sm leading-tight hidden md:block">
              <p className="font-semibold">{user?.email}</p>
              <p className="text-gray-500 text-xs">Cuenta activa</p>
            </div>

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="hover:bg-gray-100 p-2 rounded-lg text-red-600 transition"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

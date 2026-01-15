"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase/client";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";

export default function PrivateHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const landingUrl = process.env.NEXT_PUBLIC_SITE_URL || "/";

  const isActive = (path: string) => pathname.startsWith(path);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO - LEFT */}
  <Link href={landingUrl} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scanela
            </h1>
            <p className="text-xs text-gray-500">Menús Digitales</p>
          </div>
        </Link>

        {/* NAV - CENTER */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 rounded-full px-2 py-2">

          <Link href="/dashboard"
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              isActive("/dashboard")
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link href="/settings"
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              isActive("/settings")
                ? "bg-white text-purple-600 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings size={18} />
            <span>Configuración</span>
          </Link>

        </nav>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center gap-3">

          {/* NOTIFICACIONES */}
          <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* USER MENU */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md overflow-hidden border border-white">
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
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                
                {/* USER INFO */}
                <div className="px-4 py-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                {/* MENU ITEMS */}
                <div className="py-2">
                  <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings size={16} />
                    <span>Configuración</span>
                  </Link>
                  
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100/50 mt-2 pt-2">
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

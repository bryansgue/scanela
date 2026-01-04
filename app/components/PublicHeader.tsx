"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import { LogOut } from "lucide-react";

export default function PublicHeader() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoadingUser(false);
    };
    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full py-6 border-b border-gray-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <h1
          className="
            text-3xl font-extrabold bg-gradient-to-r 
            from-blue-600 to-purple-600 bg-clip-text text-transparent
            cursor-pointer
          "
        >
          <Link href="/">Syncuenta</Link>
        </h1>

        {/* NAV RIGHT */}
        <nav className="flex items-center gap-6 text-gray-700 font-medium">

          <a href="#features" className="hover:text-blue-600 transition">Características</a>
          <a href="#plans" className="hover:text-blue-600 transition">Planes</a>
          <a href="#how" className="hover:text-blue-600 transition">Cómo funciona</a>

          {/* ESTADO DE SESIÓN */}
          {!loadingUser && (
            user ? (
              <div className="flex items-center gap-4">

                {/* DASHBOARD */}
                <Link
                  href="/dashboard"
                  className="px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                >
                  Dashboard
                </Link>

                {/* BOTÓN LOGOUT (ÍCONO IGUAL AL DASHBOARD) */}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-200 transition text-red-600"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>

              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-blue-600 font-semibold hover:text-blue-700 transition"
                >
                  Iniciar sesión
                </Link>

                <Link 
                  href="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )
          )}

        </nav>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import { LogOut, Menu, X } from "lucide-react";

const navigationLinks = [
  { href: "#features", label: "Características" },
  { href: "#plans", label: "Planes" },
  { href: "#how", label: "Cómo funciona" },
];

export default function PublicHeader() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoadingUser(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-gray-200/60 bg-white/85 py-4 backdrop-blur-xl sm:py-5">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* LOGO */}
        <h1
          className="
            text-3xl font-extrabold bg-gradient-to-r 
            from-blue-600 to-purple-600 bg-clip-text text-transparent
            cursor-pointer
          "
        >
          <Link href="/">Scanela</Link>
        </h1>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 text-gray-700 font-medium md:flex">
          {navigationLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-blue-600">
              {link.label}
            </a>
          ))}

          {!loadingUser && (
            user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-green-600 px-5 py-2 text-white shadow hover:bg-green-700 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-red-600 transition hover:bg-gray-200"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-xl border border-gray-200 bg-white/80 p-2 text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* MOBILE NAV PANEL */}
        <div
          className={`absolute left-0 right-0 top-full origin-top rounded-b-3xl border border-t border-gray-200/70 bg-white px-4 py-5 shadow-xl transition duration-200 md:hidden ${
            isMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-4 text-base font-semibold text-gray-800">
            {navigationLinks.map((link) => (
              <a
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-3 py-3 transition hover:bg-gray-100"
              >
                {link.label}
              </a>
            ))}

            {!loadingUser ? (
              user ? (
                <div className="mt-2 flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-green-600 px-4 py-3 text-center text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700"
                  >
                    Ir al Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-2xl border border-red-200 px-4 py-3 text-center font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-blue-200 px-4 py-3 text-center font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded-2xl bg-gray-100" />
                <div className="h-10 animate-pulse rounded-2xl bg-gray-100" />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

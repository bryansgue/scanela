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
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/95 via-[#020b1c]/90 to-transparent" />
      <div className="absolute inset-x-4 top-0 mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

        {/* LOGO */}
        <h1
          className="
            text-3xl font-extrabold bg-gradient-to-r 
            from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent
            cursor-pointer drop-shadow-[0_10px_30px_rgba(59,130,246,0.35)]
          "
        >
          <Link href="/">Scanela</Link>
        </h1>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 font-medium text-white/70 md:flex">
          {navigationLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}

          {!loadingUser && (
            user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-2 text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:shadow-xl"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-white/20 p-2 text-white/70 transition hover:bg-white/10"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 font-semibold text-white/80 transition hover:text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:shadow-xl"
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
          className="rounded-2xl border border-white/20 bg-white/10 p-2 text-white/80 shadow-sm transition hover:border-cyan-300 hover:text-white md:hidden"
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* MOBILE NAV PANEL */}
        <div
          className={`absolute left-0 right-0 top-full origin-top rounded-b-3xl border border-white/15 bg-[#040d1f]/95 px-4 py-5 text-white shadow-2xl shadow-cyan-500/10 backdrop-blur transition duration-200 md:hidden ${
            isMenuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-4 text-base font-semibold">
            {navigationLinks.map((link) => (
              <a
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl px-3 py-3 transition hover:bg-white/10"
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
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-center text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:shadow-xl"
                  >
                    Ir al Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-center font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-white/15 px-4 py-3 text-center font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:shadow-xl"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-10 animate-pulse rounded-2xl bg-white/10" />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

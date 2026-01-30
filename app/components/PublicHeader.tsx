"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import { LogOut, Menu, X } from "lucide-react";

const navigationLinks = [
  { id: "templates", label: "Plantillas" },
  { id: "how", label: "Cómo funciona" },
  { id: "pricing", label: "Precios" },
  { id: "faq", label: "Preguntas frecuentes" },
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

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false);

    const element = document.getElementById(id);
    if (!element) return;

    const yOffset = -90; // altura del header sticky
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/95 via-[#020b1c]/90 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* LOGO */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
          <Link href="/">Scanela</Link>
        </h1>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 font-medium text-white/70 md:flex">
          {navigationLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className="transition hover:text-white"
            >
              {link.label}
            </button>
          ))}

          {!loadingUser && (
            user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-5 py-2 text-slate-900 shadow-lg"
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
                  className="px-4 py-2 text-white/80 transition hover:text-white"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-slate-900 shadow-lg"
                >
                  Crear cuenta
                </Link>
              </>
            )
          )}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-2xl border border-white/20 bg-white/10 p-2 text-white md:hidden"
          aria-label="Abrir menú"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* MOBILE MENU */}
        <div
          className={`absolute left-0 right-0 top-full rounded-b-3xl border border-white/15 bg-[#040d1f]/95 px-4 py-5 text-white shadow-xl backdrop-blur transition md:hidden ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-3 font-semibold">
            {navigationLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className="rounded-2xl px-3 py-3 text-left transition hover:bg-white/10"
              >
                {link.label}
              </button>
            ))}

            {!loadingUser && !user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl border border-white/15 px-4 py-3 text-center font-semibold text-white/80"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center font-semibold text-slate-900"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

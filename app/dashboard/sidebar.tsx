"use client";

import { usePathname } from "next/navigation";
import { Home, Share2, User, Layers, Settings, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase/client";
import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/publish", label: "Publicar", icon: Share2 },
  { href: "/dashboard/profiles", label: "Perfiles", icon: User },
  { href: "/dashboard/networks", label: "Redes", icon: Layers },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm p-6 flex flex-col border-r border-gray-100">
      
      {/* LOGO */}
      <h1 className="text-3xl font-bold mb-10 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Scanela
      </h1>

      {/* LINKS */}
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition font-medium
                ${active ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition text-red-600 font-medium mt-6"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>

    </aside>
  );
}

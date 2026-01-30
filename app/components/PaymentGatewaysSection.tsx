"use client";

import { motion } from "framer-motion";
import { Store, Coffee, Layers, Zap } from "lucide-react";

export default function PaymentGatewaysSection() {
  return (
    <section
      className="
        relative overflow-hidden py-28
        bg-gradient-to-b
        from-slate-100
        via-white
        to-slate-50
      "
    >
      <div className="relative mx-auto max-w-7xl px-6">

        {/* ===== PARA QUIÉN ES ===== */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600">
            ¿PARA QUIÉN ES SCANELA?
          </p>

          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Diseñado para negocios{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              reales
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Scanela se adapta a distintos formatos gastronómicos sin procesos
            complejos ni desarrollos a medida.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FitCard
              icon={<Store />}
              title="Restaurantes"
              text="Cartas completas, precios claros y mejor experiencia para tus clientes."
            />
            <FitCard
              icon={<Coffee />}
              title="Cafeterías & heladerías"
              text="Menús visuales, rápidos y fáciles de actualizar."
            />
            <FitCard
              icon={<Layers />}
              title="Plazas & food courts"
              text="Gestiona múltiples locales y productos desde un solo panel."
            />
            <FitCard
              icon={<Zap />}
              title="Cadenas"
              text="Control centralizado y consistencia en todas tus sucursales."
            />
          </div>
        </div>

      </div>
    </section>
  );
}

/* =========================
   COMPONENTES
========================= */

function FitCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="
        rounded-2xl border border-slate-200
        bg-white/90 backdrop-blur
        p-6 text-center
        shadow-sm hover:shadow-md
      "
    >
      <div
        className="
          mx-auto mb-4 flex h-12 w-12 items-center justify-center
          rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600
          text-white
        "
      >
        {icon}
      </div>

      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </motion.div>
  );
}

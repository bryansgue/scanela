"use client";

import { motion } from "framer-motion";
import { UserPlus, Layers, Palette, Send } from "lucide-react";

const steps = [
  {
    title: "Crea tu cuenta",
    text: "Registra tu restaurante y accede al panel en segundos.",
    icon: UserPlus,
    accent: "from-cyan-500 to-sky-500",
  },
  {
    title: "Diseña tu menú",
    text: "Agrega categorías, precios, fotos y variantes con nuestro editor.",
    icon: Layers,
    accent: "from-sky-500 to-blue-600",
  },
  {
    title: "Personaliza la marca",
    text: "Elige plantillas, tipografías y QR que combinan con tu identidad.",
    icon: Palette,
    accent: "from-blue-600 to-indigo-600",
  },
  {
    title: "Comparte y cobra",
    text: "Publica tu código QR, recibe pedidos y pagos en tiempo real.",
    icon: Send,
    accent: "from-indigo-600 to-purple-600",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="
        relative overflow-hidden
        bg-gradient-to-b
        from-slate-50
        via-white
        to-slate-100
        py-28
      "
    >
      <div className="relative mx-auto max-w-6xl px-6">
        {/* HEADER */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-cyan-700">
            FLUJO COMPLETO
          </p>

          <h3 className="mt-4 text-4xl font-black text-slate-900">
            ¿Cómo funciona Scanela?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Crea, personaliza y comparte tu menú digital con QR en solo cuatro pasos.
          </p>
        </div>

        {/* STEPS */}
        <div className="relative mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* línea conectora */}
          <div
            className="
              absolute left-1/2 top-10 hidden
              h-[2px] w-[90%] -translate-x-1/2
              bg-gradient-to-r
              from-cyan-300
              via-sky-300
              to-indigo-300
              lg:block
            "
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="
                  group relative
                  rounded-3xl
                  border border-slate-200
                  bg-white/90
                  p-6
                  shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                  backdrop-blur
                  transition
                "
              >
                {/* número */}
                <span className="absolute -top-6 right-4 select-none text-7xl font-black text-slate-200">
                  {idx + 1}
                </span>

                {/* icono */}
                <div
                  className={`
                    relative flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-gradient-to-br ${step.accent}
                    text-white shadow-lg
                    transition-transform duration-300
                    group-hover:rotate-3
                  `}
                >
                  <Icon size={28} />
                </div>

                {/* contenido */}
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  Paso {idx + 1}
                </p>

                <h4 className="mt-2 text-xl font-bold text-slate-900">
                  {step.title}
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

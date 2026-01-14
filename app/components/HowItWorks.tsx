"use client";

import { motion } from "framer-motion";
import { UserPlus, Layers, Palette, Send } from "lucide-react";

const steps = [
  {
    title: "Crea tu cuenta",
    text: "Registra tu restaurante y accede al panel en segundos.",
    icon: <UserPlus size={32} />, 
    accent: "from-blue-500/20 to-blue-500/5",
  },
  {
    title: "Diseña tu menú",
    text: "Agrega categorías, precios, fotos y variantes con nuestro editor.",
    icon: <Layers size={32} />, 
    accent: "from-purple-500/20 to-purple-500/5",
  },
  {
    title: "Personaliza la marca",
    text: "Elige plantillas, tipografías y QR que combinan con tu identidad.",
    icon: <Palette size={32} />, 
    accent: "from-pink-500/20 to-pink-500/5",
  },
  {
    title: "Comparte y cobra",
    text: "Publica tu código QR, recibe pedidos y pagos en tiempo real.",
    icon: <Send size={32} />, 
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-white to-blue-50 py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-200/40 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-blue-500">FLUJO COMPLETO</p>
          <h3 className="mt-4 text-4xl font-black text-slate-900">¿Cómo funciona Scanela?</h3>
          <p className="mt-4 text-lg text-slate-600">
            Crea, personaliza y comparte tu menú digital con QR en cuatro pasos.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="relative rounded-3xl border border-white bg-white/80 p-6 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <div className={`absolute -left-4 top-6 hidden h-16 w-16 rounded-3xl bg-gradient-to-br ${step.accent} md:block`} />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg">
                {step.icon}
              </div>
              <p className="mt-6 text-sm font-semibold text-blue-500">Paso {idx + 1}</p>
              <h4 className="mt-2 text-2xl font-bold text-slate-900">{step.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

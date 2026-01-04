"use client";

import { motion } from "framer-motion";
import { UserPlus, Layers, Share2, Send, Clock } from "lucide-react";

interface StepIconProps {
  title: string;
  text: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  return (
    <section id="how" className="py-28 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h3 className="text-5xl font-extrabold mb-10">
          ¿Cómo funciona Scanela?
        </h3>

        <p className="text-xl text-gray-600 mx-auto mb-16">
          Cuatro pasos simples para crear y compartir tu menú digital.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-6">

          <StepIcon
            title="Crea tu cuenta"
            text="Accede a tu panel central."
            icon={<UserPlus size={40} strokeWidth={1.5} className="text-blue-600" />}
          />

          <Arrow />

          <StepIcon
            title="Diseña tu menú"
            text="Categorías, productos, precios y fotos."
            icon={<Layers size={40} strokeWidth={1.5} className="text-purple-600" />}
          />

          <Arrow />

          <StepIcon
            title="Personaliza el tema"
            text="Elige colores que reflejen tu marca."
            icon={<Share2 size={40} strokeWidth={1.5} className="text-pink-500" />}
          />

          <Arrow />

          <StepIcon
            title="Comparte con QR"
            text="Tus clientes acceden al menú al instante."
            icon={<Send size={40} strokeWidth={1.5} className="text-green-600" />}
          />

        </div>
      </div>
    </section>
  );
}

function StepIcon({ title, text, icon }: StepIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center max-w-xs"
    >
      <div className="p-4 rounded-full bg-gray-100 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
        {icon}
      </div>
      <h4 className="text-xl font-bold mt-4">{title}</h4>
      <p className="text-gray-600 mt-1 text-sm">{text}</p>
    </motion.div>
  );
}

function Arrow() {
  return (
    <svg className="hidden md:block w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-4-4l4 4-4 4" />
    </svg>
  );
}

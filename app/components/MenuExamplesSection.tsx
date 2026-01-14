"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MenuDisplay from "./MenuDisplay";

// Configuración de plantillas
const TEMPLATE_CONFIG = {
  pizzeria: {
    icon: "🍕",
    displayName: "Pizzería Artesanal",
    subtitle: "Pizzas auténticas y deliciosas",
    primaryColor: "orange" as const,
  },
  cafeteria: {
    icon: "☕",
    displayName: "Café & Pastelería",
    subtitle: "Café recién hecho cada mañana",
    primaryColor: "blue" as const,
  },
  heladeria: {
    icon: "🍦",
    displayName: "Heladería Premium",
    subtitle: "Helados artesanales con amor",
    primaryColor: "green" as const,
  },
  restaurante: {
    icon: "🥗",
    displayName: "Restaurante Gourmet",
    subtitle: "Comida saludable y fresca",
    primaryColor: "red" as const,
  },
  hamburgueseria: {
    icon: "🍔",
    displayName: "Hamburguesería Clásica",
    subtitle: "Las mejores hamburguesas en la ciudad",
    primaryColor: "purple" as const,
  },
  panaderia: {
    icon: "🥐",
    displayName: "Panadería Artesanal",
    subtitle: "Pan fresco todos los días",
    primaryColor: "pink" as const,
  },
};

interface Template {
  name: string;
  icon: string;
  businessName?: string;
  logoMode?: string;
  businessLogo?: string;
  logoSize?: number;
  themeColor?: string;
  whatsappNumber?: string;
  businessHours?: string;
  categories: Array<{
    id: number;
    name: string;
    products: Array<{
      id: number;
      name: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      active: boolean;
      hasVariants?: boolean;
      variants?: {
        sizes?: Array<{ id: number; name: string; price: number }>;
      };
    }>;
  }>;
}

export default function MenuExamplesSection() {
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/menu-templates.json');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const templateKeys = ['pizzeria', 'cafeteria', 'heladeria', 'restaurante', 'hamburgueseria', 'panaderia'];

  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-blue-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-orange-500">PLANTILLAS INTERACTIVAS</p>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Menús que venden <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">más</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Cientos de restaurantes usan Scanela para aumentar sus ventas. Mira cómo se ven las cartas digitales en un teléfono real.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-16">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Cargando menús...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {templateKeys.slice(2, 5).map((key, idx) => {
                const template = templates[key];
                const config = TEMPLATE_CONFIG[key as keyof typeof TEMPLATE_CONFIG];
                if (!template || !config) return null;
                return (
                  <MenuExampleCard
                    key={key}
                    template={template}
                    config={config}
                    index={idx}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-10 text-center shadow-[0_20px_80px_rgba(249,115,22,0.15)]"
        >
          <p className="text-base text-slate-700">
            ✨ Estos son menús reales creados en Scanela por nuestros clientes. Sube tu logo, importa tus productos y publica tu QR en minutos.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Actualiza precios y fotos sin depender de impresiones físicas.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MenuExampleCard({
  template,
  config,
  index,
}: {
  template: Template;
  config: (typeof TEMPLATE_CONFIG)[keyof typeof TEMPLATE_CONFIG];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative flex justify-center">
        <div className="absolute inset-0 -z-10 translate-y-6 scale-90 rounded-[50px] bg-gradient-to-br from-white to-orange-100 opacity-60 blur-3xl" />
        <div className="relative rounded-[44px] border-[6px] border-slate-900 bg-slate-900 p-2 shadow-[0_30px_120px_rgba(15,23,42,0.45)]" style={{ width: "min(410px, 90vw)", height: "min(820px, 185vw)" }}>
          <div className="absolute left-1/2 top-0 h-7 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
          <div className="relative h-full overflow-hidden rounded-[34px] bg-white">
            <MenuDisplay
              menu={template}
              businessName={template.name}
              theme={config.primaryColor}
              showFrame={false}
              businessPlan="menu"
              templateIcon={config.icon}
              templateName={config.displayName}
              templateSubtitle={config.subtitle}
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-white/70 px-4 py-1 text-xs font-semibold text-slate-600 shadow-lg">
            <span>{config.icon}</span>
            <span>{config.displayName}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

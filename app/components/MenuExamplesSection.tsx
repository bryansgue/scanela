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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4">
            Menús que venden <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">más</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cientos de restaurantes usan Scanela para aumentar sus ventas. Aquí te mostramos algunos ejemplos.
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando menús...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* BOTTOM MESSAGE */}
        <div className="text-center mt-16 bg-blue-50 rounded-2xl p-8">
          <p className="text-gray-700 mb-4">
            ✨ Estos son menús reales creados en Scanela por nuestros clientes
          </p>
          <p className="text-sm text-gray-600">
            Crea tu menú ahora y sé parte de los cientos de restaurantes exitosos
          </p>
        </div>
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      {/* IPHONE FRAME */}
      <div className="relative flex justify-center">
        {/* PHONE BEZEL */}
        <div className="bg-black rounded-3xl p-2 shadow-2xl border-4 border-black" style={{ width: '410px', height: '800px' }}>
          {/* NOTCH */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10"></div>

          {/* SCREEN - Usa MenuDisplay con los datos reales */}
          <div className="rounded-2xl h-full overflow-hidden bg-white">
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
        </div>
      </div>
    </motion.div>
  );
}

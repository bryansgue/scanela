"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import MenuDisplay from "./MenuDisplay";

export default function Hero() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any>({});
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/menu-templates.json');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  return (
    <section className="w-full pt-32 pb-32 px-6 text-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>

      {/* TELÉFONOS A LOS LADOS - Solo Desktop */}
      <div className="absolute inset-0 hidden lg:flex justify-between items-start pt-20 px-6 pointer-events-none">
        {/* TELÉFONO IZQUIERDO */}
        {!templatesLoading && templates.pizzeria && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center pointer-events-auto"
          >
            <div className="bg-black rounded-3xl p-2 shadow-2xl border-4 border-black" style={{ width: '410px', height: '800px' }}>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10"></div>
              <div className="rounded-2xl h-full overflow-hidden bg-white">
                <MenuDisplay
                  menu={templates.pizzeria}
                  businessName={templates.pizzeria.name}
                  theme="orange"
                  showFrame={false}
                  businessPlan="menu"
                  templateIcon="🍕"
                  templateName="Pizzería Artesanal"
                  templateSubtitle="Pizzas auténticas y deliciosas"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TELÉFONO DERECHO */}
        {!templatesLoading && templates.cafeteria && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center pointer-events-auto"
          >
            <div className="bg-black rounded-3xl p-2 shadow-2xl border-4 border-black" style={{ width: '410px', height: '800px' }}>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10"></div>
              <div className="rounded-2xl h-full overflow-hidden bg-white">
                <MenuDisplay
                  menu={templates.cafeteria}
                  businessName={templates.cafeteria.name}
                  theme="blue"
                  showFrame={false}
                  businessPlan="menu"
                  templateIcon="☕"
                  templateName="Café & Pastelería"
                  templateSubtitle="Café recién hecho cada mañana"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* ============================ */}
        {/*       HERO TEXT              */}
        {/* ============================ */}

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-900 drop-shadow-lg"
        >
          Crea menús digitales
          <br />
          <motion.span 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text"
          >
            para tu restaurante en minutos
          </motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-gray-600 mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Diseña menús profesionales, comparte con tus clientes mediante QR y gestiona múltiples restaurantes desde un único panel.
        </motion.p>

        {/* ============================ */}
        {/*       BOTONES SUAVES        */}
        {/* ============================ */}

        <div className="flex justify-center gap-5 mt-12 flex-wrap">

          {/* BOTÓN PRINCIPAL */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key="main-button"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="
                    min-w-[190px]
                    block text-center
                    px-8 py-4 rounded-xl 
                    bg-blue-600 text-white 
                    font-semibold shadow-lg 
                    hover:bg-blue-700 
                    transition transform hover:scale-[1.02]
                  "
                >
                  {user ? "Ir al Dashboard" : "Crear menú gratis"}
                </Link>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="placeholder-main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                className="min-w-[190px] h-14"
              />
            )}
          </AnimatePresence>

          {/* BOTÓN SECUNDARIO */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key="secondary-button"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                <Link
                  href={user ? "/pricing" : "/login"}
                  className="
                    min-w-[190px]
                    block text-center
                    px-8 py-4 rounded-xl 
                    bg-white border border-gray-300 
                    text-gray-800 font-semibold 
                    shadow hover:bg-gray-100 transition
                  "
                >
                  {user ? "Mejorar plan" : "Iniciar sesión"}
                </Link>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="placeholder-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                className="min-w-[190px] h-14"
              />
            )}
          </AnimatePresence>

        </div>

        {/* ============================ */}
        {/*   CARACTERÍSTICAS PRINCIPALES*/}
        {/* ============================ */}

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20"
        >
          <p className="text-gray-500 text-sm tracking-widest uppercase mb-8 font-semibold">
            ✨ Características principales
          </p>

          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { icon: "📱", label: "Menú Digital", color: "from-blue-400 to-blue-600" },
              { icon: "🔗", label: "Código QR", color: "from-green-400 to-green-600" },
              { icon: "🛒", label: "Carrito", color: "from-purple-400 to-purple-600" },
              { icon: "💳", label: "Pagos", color: "from-orange-400 to-orange-600" },
              { icon: "⚡", label: "Instantáneo", color: "from-pink-400 to-pink-600" },
            ].map((feature, idx) => (
              <motion.div 
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition transform`}>
                  {feature.icon}
                </div>
                <p className="text-sm text-gray-700 font-semibold">{feature.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

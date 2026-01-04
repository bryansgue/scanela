"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown } from "lucide-react";

export default function ScanelaPricingSection() {
  const [billing, setBilling] = useState<"monthly">("monthly");

  const plans = [
    {
      id: "free",
      name: "Scanela Free",
      icon: "🆓",
      monthly: 0,
      description: "Perfecto para comenzar",
      tagline: "Diseña tu menú completamente gratis",
      features: [
        "✅ Editor intuitivo de productos",
        "✅ Hasta 12 temas de color",
        "✅ Logo personalizado",
        "✅ Integración WhatsApp",
        "❌ QR descargable",
        "❌ Sistema de órdenes",
        "❌ Múltiples negocios",
      ],
      highlight: false,
      cta: "Crear menú gratis",
    },
    {
      id: "menu",
      name: "Scanela Menú",
      icon: "📋",
      monthly: 4.99,
      description: "Para restaurantes modernos",
      tagline: "Tu menú digital + QR compartible",
      features: [
        "✅ Todo lo de Free +",
        "✅ QR Descargable e Imprimible",
        "✅ Hasta 3 negocios activos",
        "✅ Sin límite de categorías",
        "✅ Preview en tiempo real",
        "✅ Analytics básicos",
        "✅ Soporte por email",
        "❌ Sistema de órdenes y pagos",
      ],
      highlight: false,
      cta: "Comenzar",
    },
    {
      id: "ventas",
      name: "Scanela Ventas",
      icon: "💳",
      monthly: 9.99,
      transactionFee: 0.08,
      description: "Para negocios que toman órdenes",
      tagline: "Menú digital + Carrito + Pagos",
      features: [
        "✅ Todo lo de Menú +",
        "✅ Hasta 5 negocios activos",
        "✅ Carrito de compras",
        "✅ Sistema de órdenes y pagos",
        "✅ Integración de pasarelas",
        "✅ Panel de órdenes recibidas",
        "✅ Analytics avanzados",
        "✅ Soporte prioritario",
      ],
      highlight: true,
      popular: true,
      cta: "Activar ahora",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4">
            Precios simples y <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">justos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu negocio. Puedes cambiar en cualquier momento sin penalizaciones.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">💡 ¿No estás seguro? Prueba gratis el plan Free</p>
          <p className="text-sm text-gray-500">Todos los planes incluyen soporte y acceso a nuevas funciones</p>
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  id: string;
  name: string;
  icon: string;
  monthly: number;
  transactionFee?: number;
  description: string;
  tagline: string;
  features: string[];
  highlight: boolean;
  popular?: boolean;
  cta: string;
}

function PricingCard({
  id,
  name,
  icon,
  monthly,
  transactionFee,
  description,
  tagline,
  features,
  highlight,
  popular,
  cta,
}: PricingCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl transition-all duration-300
        ${highlight
          ? "border-2 border-purple-500 shadow-2xl shadow-purple-200 scale-[1.02] bg-gradient-to-br from-purple-50 to-white"
          : "border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 bg-white"
        }
      `}
    >
      {/* POPULAR BADGE */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            🌟 Más Popular
          </span>
        </div>
      )}

      {/* CONTENT */}
      <div className="p-8 h-full flex flex-col">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
              <p className="text-xs text-gray-600">{description}</p>
            </div>
          </div>
          <p className="text-sm italic text-gray-700 bg-gray-50 p-3 rounded-lg">
            "{tagline}"
          </p>
        </div>

        {/* PRICE */}
        <div className="mb-6">
          {monthly === 0 ? (
            <p className="text-4xl font-extrabold text-gray-900">Gratis</p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  ${monthly}
                </span>
                <span className="text-gray-600">/mes</span>
              </div>
              {transactionFee !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                  + ${transactionFee.toFixed(2)} por venta
                </p>
              )}
            </>
          )}
        </div>

        {/* FEATURES */}
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 flex-shrink-0">
                {feature.startsWith("✅") ? (
                  <Check size={16} className="text-green-600 font-bold" />
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </span>
              <span className={feature.startsWith("❌") ? "text-gray-400 line-through" : ""}>
                {feature.replace("✅ ", "").replace("❌ ", "")}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA BUTTON */}
        <Link
          href={id === "free" ? "/register" : "/settings"}
          className={`
            block text-center py-3 rounded-lg font-semibold transition-all duration-300
            ${highlight
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:-translate-y-1"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }
          `}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

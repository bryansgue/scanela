"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Lock,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Star,
  Move,
  Palette,
  Link2,
  BadgeCheck,
} from "lucide-react";

const ANNUAL_DISCOUNT = 0.2;

/* =========================
   DATA
========================= */

const plans = [
  {
    id: "free",
    name: "Scanela Free",
    icon: Zap,
    monthly: 0,
    description: "Funciona, pero se ve genérico",
    tagline: "Ideal para empezar y probar Scanela",
    highlight: false,
    cta: "Crear menú gratis",
    features: [
      { label: "Menú digital accesible por QR", available: true },
      { label: "Actualización del menú en tiempo real", available: true },
      { label: "Diseño responsive", available: true },
      { label: "Crear y editar productos", available: true },
      { label: "URL estándar de Scanela", available: true },
      { label: "Imágenes de productos", available: false },
      { label: "Productos destacados", available: false },
      { label: "Orden manual de productos", available: false },
      { label: "Logo del negocio", available: false },
      { label: "Colores personalizados", available: false },
    ],
  },
  {
    id: "menu",
    name: "Scanela Menú",
    icon: Sparkles,
    monthly: 4.99,
    description: "Es tu menú, con tu marca",
    tagline: "Control total y apariencia profesional",
    highlight: true,
    popular: true,
    cta: "Activar plan Menú",
    features: [
      { label: "Todo lo del plan Free", available: true },
      { label: "URL personalizada", available: true, icon: Link2 },
      { label: "Imágenes de productos", available: true, icon: ImageIcon },
      { label: "Productos destacados", available: true, icon: Star },
      { label: "Reordenar productos y categorías", available: true, icon: Move },
      { label: "Logo del negocio", available: true, icon: BadgeCheck },
      { label: "Colores personalizados del menú", available: true, icon: Palette },
      { label: "Menú sin marca Scanela", available: true },
    ],
  },
];

/* =========================
   SECTION
========================= */

export default function ScanelaPricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  return (
    <section
      id="pricing"
      className="
        relative overflow-hidden py-24
        bg-gradient-to-b
        from-slate-100
        via-white
        to-slate-50
      "
    >
      {/* transición superior homogénea */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-200/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600">
            PRECIOS
          </p>

          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Precios simples y{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              justos
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Empieza gratis y ahorra más pagando anual.
          </p>

          <div className="mt-6">
            <BillingToggle billing={billing} setBilling={setBilling} />
          </div>
        </div>

        {/* CARDS */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600">
            💡 Puedes cambiar de plan o facturación en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================
   BILLING TOGGLE
========================= */

function BillingToggle({
  billing,
  setBilling,
}: {
  billing: "monthly" | "annual";
  setBilling: (v: "monthly" | "annual") => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
      <button
        onClick={() => setBilling("monthly")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
          billing === "monthly"
            ? "bg-slate-900 text-white"
            : "text-slate-500"
        }`}
      >
        Mensual
      </button>

      <button
        onClick={() => setBilling("annual")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
          billing === "annual"
            ? "bg-slate-900 text-white"
            : "text-slate-500"
        }`}
      >
        Anual
        <span className="ml-1 text-xs font-semibold text-green-600">
          -20%
        </span>
      </button>
    </div>
  );
}

/* =========================
   CARD
========================= */

function PricingCard({
  plan,
  billing,
}: {
  plan: any;
  billing: "monthly" | "annual";
}) {
  const Icon = plan.icon;
  const isFree = plan.monthly === 0;

  const monthlyPrice = plan.monthly;
  const annualPrice = plan.monthly * 12 * (1 - ANNUAL_DISCOUNT);
  const savings = monthlyPrice * 12 - annualPrice;

  return (
    <div
      className={`
        relative rounded-3xl transition-all
        ${
          plan.highlight
            ? "border-2 border-indigo-500 bg-white shadow-[0_25px_80px_rgba(79,70,229,0.25)]"
            : "border border-slate-200 bg-white shadow-md hover:-translate-y-1 hover:shadow-lg"
        }
      `}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
            ⭐ Más popular
          </span>
        </div>
      )}

      <div className="flex h-full flex-col p-6">
        {/* HEADER */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`rounded-xl p-2 ${
                plan.highlight
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Icon size={22} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-600">
                {plan.description}
              </p>
            </div>
          </div>

          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
            “{plan.tagline}”
          </p>
        </div>

        {/* PRICE */}
        <div className="mb-5">
          {isFree ? (
            <p className="text-3xl font-extrabold text-slate-900">
              Gratis
            </p>
          ) : billing === "annual" ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  ${(annualPrice / 12).toFixed(2)}
                </span>
                <span className="text-sm text-slate-600">/mes</span>
              </div>
              <p className="mt-1 text-xs font-medium text-green-600">
                Pagas ${annualPrice.toFixed(2)} al año · Ahorras $
                {savings.toFixed(2)}
              </p>
            </>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                ${monthlyPrice.toFixed(2)}
              </span>
              <span className="text-sm text-slate-600">/mes</span>
            </div>
          )}
        </div>

        {/* FEATURES */}
        <ul className="mb-6 flex-grow space-y-2">
          {plan.features.map((feature: any, idx: number) => {
            const FeatureIcon = feature.icon;
            return (
              <li
                key={idx}
                className={`flex gap-2 text-sm ${
                  feature.available
                    ? "text-slate-800"
                    : "text-slate-400 line-through"
                }`}
              >
                {feature.available ? (
                  <Check size={14} className="mt-0.5 text-green-600" />
                ) : (
                  <Lock size={14} className="mt-0.5 text-slate-400" />
                )}
                <span>
                  {FeatureIcon && plan.highlight && (
                    <FeatureIcon
                      size={13}
                      className="mr-1 inline text-indigo-600"
                    />
                  )}
                  {feature.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href={plan.id === "free" ? "/register" : "/settings"}
          className={`
            block rounded-xl py-3 text-center text-sm font-semibold transition
            ${
              plan.highlight
                ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-lg"
                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            }
          `}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  );
}

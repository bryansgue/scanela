"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  monthly: number;
  yearly: number;
  profiles: number;
  highlight?: boolean;
}

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const plans = [
    { name: "Basic", monthly: 12, yearly: 99, profiles: 2 },
    { name: "Pro", monthly: 29, yearly: 249, profiles: 5, highlight: true },
    { name: "Business", monthly: 79, yearly: 649, profiles: 10 },
  ];

  return (
    <section id="plans" className="py-32 bg-white text-center">
      <div className="max-w-6xl mx-auto px-6">

        <h3 className="text-5xl font-extrabold mb-6">
          Precios transparentes
        </h3>

        <p className="text-xl text-gray-600 mb-12">
          Diseñado para creadores, negocios y agencias.
        </p>

        {/* ==== BILLING TOGGLE ==== */}
        <div className="flex justify-center mb-16">
          <div className="bg-gray-200 p-2 rounded-full flex gap-2">
            
            {/* MENSUAL */}
            <button
              onClick={() => setBilling("monthly")}
              className={`
                px-6 py-2 rounded-full font-semibold transition
                ${billing === "monthly" ? "bg-white text-blue-600 shadow" : "text-gray-600"}
              `}
            >
              Mensual
            </button>

            {/* ANUAL */}
            <button
              onClick={() => setBilling("annual")}
              className={`
                px-6 py-2 rounded-full font-semibold transition
                ${billing === "annual" ? "bg-white text-blue-600 shadow" : "text-gray-600"}
              `}
            >
              Anual -40%
            </button>

          </div>
        </div>

        {/* ==== CARDS ==== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((p) => (
            <PricingCard
              key={p.name}
              name={p.name}
              monthly={p.monthly}
              yearly={p.yearly}
              profiles={p.profiles}
              highlight={p.highlight}
              billing={billing}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ====================================================================== */
/* ========================= PRICING CARD ================================ */
/* ====================================================================== */

interface CardProps extends PricingCardProps {
  billing: "monthly" | "annual";
}

function PricingCard({ name, monthly, yearly, profiles, highlight, billing }: CardProps) {
  const price = billing === "monthly" ? monthly : yearly;
  const monthlyEquivalent = (yearly / 12).toFixed(2);
  const savings = Math.round(((monthly * 12) - yearly));

  return (
    <div
      className={`
        p-8 rounded-2xl border shadow-lg relative
        ${highlight ? "border-purple-600 shadow-purple-200 scale-[1.03]" : "border-gray-200"}
        transition
      `}
    >
      {/* NAME */}
      <h4 className="text-3xl font-bold mb-2">{name}</h4>

      {/* PRICE */}
      <div className="flex flex-col items-center">
        <p className="
          text-4xl font-extrabold 
          bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text
        ">
          ${price}
        </p>

        <p className="text-gray-500 mt-1">
          /{billing === "monthly" ? "mes" : "año"}
        </p>

        {/* ANNUAL SAVINGS */}
        {billing === "annual" && (
          <p className="text-green-600 font-semibold mt-2 text-sm">
            Equivalente a ${monthlyEquivalent}/mes — Ahorra ${savings}
          </p>
        )}
      </div>

      {/* FEATURES */}
      <ul className="text-left mt-8 space-y-4">

        {/* unlimited uploads tooltip */}
        <TooltipItem
          label="Publicaciones ilimitadas"
          tooltipTitle="Límites por red social (24h)"
          tooltipContent={
            <CapsTable />
          }
        />

        <ListItem text="TikTok, Instagram, LinkedIn, YouTube, Facebook, X, Threads, Pinterest, Reddit, Bluesky" />
        <ListItem text="Programar publicaciones" />
        <ListItem text="Analytics" />

        {/* PROFILES tooltip */}
        <TooltipItem
          label={`${profiles} perfiles`}
          tooltipTitle="¿Qué son perfiles?"
          tooltipContent={
            <div>
              <p className="opacity-80 mb-2">
                Cada perfil permite conectar <strong>una cuenta por plataforma</strong>.
              </p>
              <ul className="list-disc list-inside opacity-80 space-y-1">
                <li>{profiles} TikTok accounts</li>
                <li>{profiles} Instagram accounts</li>
                <li>{profiles} YouTube channels</li>
                <li>…y así sucesivamente</li>
              </ul>
            </div>
          }
        />
      </ul>

      {/* CTA */}
      <Link
        href="/register"
        className={`
          block text-center mt-10 py-3 rounded-xl font-semibold
          ${highlight
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }
          transition
        `}
      >
        Probar 7 días gratis
      </Link>
    </div>
  );
}

/* ====================================================================== */
/* ======================= SMALL COMPONENTS ============================== */
/* ====================================================================== */

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-gray-700">
      ✔ <span>{text}</span>
    </li>
  );
}

function TooltipItem({
  label,
  tooltipTitle,
  tooltipContent,
}: {
  label: string;
  tooltipTitle: string;
  tooltipContent: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2 text-gray-700">
      ✔{" "}
      <span className="relative group cursor-pointer">
        {label}
        <span className="text-blue-600 font-bold ml-1">?</span>

        {/* Tooltip */}
        <div className="
          absolute left-0 bottom-full mb-3 w-80 p-4 rounded-xl bg-gray-900 
          text-white text-sm opacity-0 group-hover:opacity-100 transition 
          pointer-events-none shadow-xl z-30
        ">
          <p className="font-semibold mb-2">{tooltipTitle}</p>
          {tooltipContent}
        </div>
      </span>
    </li>
  );
}

function CapsTable() {
  return (
    <table className="w-full text-left text-xs mb-3 opacity-90">
      <tbody>
        <tr><td>Instagram</td><td className="text-right">50</td></tr>
        <tr><td>TikTok</td><td className="text-right">15</td></tr>
        <tr><td>LinkedIn</td><td className="text-right">150</td></tr>
        <tr><td>YouTube</td><td className="text-right">10</td></tr>
        <tr><td>Facebook</td><td className="text-right">25</td></tr>
        <tr><td>X / Twitter</td><td className="text-right">50</td></tr>
        <tr><td>Threads</td><td className="text-right">50</td></tr>
        <tr><td>Pinterest</td><td className="text-right">20</td></tr>
        <tr><td>Reddit</td><td className="text-right">40</td></tr>
      </tbody>
    </table>
  );
}

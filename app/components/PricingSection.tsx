"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <section id="plans" className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />
      <div className="absolute inset-x-0 top-10 mx-auto h-64 w-[80%] rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 opacity-30 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-orange-300">PLANES QUE ESCALAN</p>
        <h3 className="mt-6 text-4xl font-black md:text-5xl">
          Precios transparentes
        </h3>

        <p className="mt-4 text-lg text-slate-200">
          Diseñado para creadores, negocios y agencias.
        </p>

        {/* ==== BILLING TOGGLE ==== */}
        <div className="mt-10 flex justify-center">
          <div className="rounded-full bg-white/10 p-1 text-sm text-slate-300 backdrop-blur">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                billing === "monthly"
                  ? "bg-white text-slate-900 shadow-lg shadow-orange-500/20"
                  : "text-slate-300"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                billing === "annual"
                  ? "bg-white text-slate-900 shadow-lg shadow-orange-500/20"
                  : "text-slate-300"
              }`}
            >
              Anual -40%
            </button>
          </div>
        </div>

        {/* ==== CARDS ==== */}
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {plans.map((p, idx) => (
            <PricingCard
              key={p.name}
              name={p.name}
              monthly={p.monthly}
              yearly={p.yearly}
              profiles={p.profiles}
              highlight={p.highlight}
              billing={billing}
              index={idx}
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
  index: number;
}

function PricingCard({ name, monthly, yearly, profiles, highlight, billing, index }: CardProps) {
  const price = billing === "monthly" ? monthly : yearly;
  const monthlyEquivalent = (yearly / 12).toFixed(2);
  const savings = Math.round(((monthly * 12) - yearly));

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative rounded-3xl border border-white/10 bg-gradient-to-b p-[1px] ${
        highlight
          ? "from-white/80 via-white/40 to-purple-200/20"
          : "from-white/30 to-white/5"
      } shadow-[0_20px_80px_rgba(15,23,42,0.45)]`}
    >
      <div className="h-full rounded-[calc(24px)] bg-slate-900/60 p-8 text-left">
        {highlight && (
          <span className="mb-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Más elegido
          </span>
        )}
      {/* NAME */}
      <h4 className="text-3xl font-bold text-white">{name}</h4>

      {/* PRICE */}
      <div className="flex flex-col items-center">
        <p className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-4xl font-black text-transparent">
          ${price}
        </p>

        <p className="mt-1 text-sm text-slate-300">
          /{billing === "monthly" ? "mes" : "año"}
        </p>

        {/* ANNUAL SAVINGS */}
        {billing === "annual" && (
          <p className="mt-2 text-sm font-semibold text-emerald-300">
            Equivalente a ${monthlyEquivalent}/mes — Ahorra ${savings}
          </p>
        )}
      </div>

      {/* FEATURES */}
      <ul className="mt-8 space-y-4 text-white/80">

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
          className={`mt-10 block rounded-2xl py-3 text-center font-semibold transition ${
            highlight
              ? "bg-white text-slate-900 shadow-lg shadow-orange-500/20"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Probar 7 días gratis
        </Link>
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* ======================= SMALL COMPONENTS ============================== */
/* ====================================================================== */

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-orange-400">◆</span>
      <span>{text}</span>
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
    <li className="flex items-start gap-2">
      <span className="text-orange-400">◆</span>
      <span className="relative group cursor-pointer">
        {label}
        <span className="ml-1 font-bold text-orange-300">?</span>

        {/* Tooltip */}
        <div className="
          absolute left-0 bottom-full z-30 mb-3 w-80 rounded-2xl bg-slate-900/95 
          p-4 text-sm text-white opacity-0 shadow-2xl shadow-black/40 transition 
          duration-300 group-hover:opacity-100
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

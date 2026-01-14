"use client";

import { motion } from "framer-motion";
import { CreditCard, Lock, Zap, Globe } from "lucide-react";

export default function PaymentGatewaysSection() {
  const gateways = [
    {
      name: "Stripe",
      logo: "🟦",
      description: "Procesamiento seguro de pagos internacionales",
      features: [
        "Tarjetas de crédito/débito",
        "Billeteras digitales",
        "Transacciones 3D Secure",
        "Disputas y reembolsos",
      ],
      supported: true,
    },
    {
      name: "Mercado Pago",
      logo: "🟨",
      description: "La plataforma de pagos líder en LATAM",
      features: [
        "Tarjetas y billeteras",
        "Efectivo y dinero en cuenta",
        "Cuotas sin interés",
        "Transferencias bancarias",
      ],
      supported: true,
    },
    {
      name: "PayPal",
      logo: "🔵",
      description: "Pagos globales y confiables",
      features: [
        "Pagos con PayPal",
        "Checkout integrado",
        "Protección al comprador",
        "Soporte 24/7",
      ],
      supported: true,
    },
    {
      name: "Más opciones",
      logo: "🌍",
      description: "Estamos integrando más pasarelas constantemente",
      features: [
        "Apple Pay & Google Pay",
        "Billeteras digitales locales",
        "Criptomonedas (próxima fase)",
        "Sistema de facturación",
      ],
      supported: false,
    },
  ];

  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-cyan-300">COBRÁ SIN LÍMITES</p>
          <h2 className="mt-4 text-4xl font-black text-white">
            Pasarelas de pago <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">integradas</span>
          </h2>
          <p className="mt-5 text-lg text-slate-300 max-w-3xl mx-auto">
            Aceptá pagos con tarjeta, billeteras y transferencias. El dinero va directo a tu cuenta con la misma seguridad que usa un banco.
          </p>
        </div>

        {/* GATEWAY CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {gateways.map((gateway, idx) => (
            <PaymentGatewayCard key={idx} {...gateway} index={idx} />
          ))}
        </div>

        {/* SECURITY SECTION */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-12 text-white shadow-[0_40px_120px_rgba(2,6,23,0.65)] backdrop-blur">
          <h3 className="text-center text-2xl font-bold text-white">Seguridad de nivel bancario</h3>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <SecurityFeature
              icon={<Lock size={32} className="text-blue-600" />}
              title="Encriptación SSL"
              description="Todos los datos están encriptados end-to-end"
            />
            <SecurityFeature
              icon={<CreditCard size={32} className="text-purple-600" />}
              title="PCI DSS Compliant"
              description="Cumplimos con estándares internacionales"
            />
            <SecurityFeature
              icon={<Zap size={32} className="text-green-600" />}
              title="Pagos Instantáneos"
              description="Las transacciones se procesan en tiempo real"
            />
            <SecurityFeature
              icon={<Globe size={32} className="text-orange-600" />}
              title="Soporte Global"
              description="Múltiples monedas y métodos locales"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentGatewayCard({
  name,
  logo,
  description,
  features,
  supported,
  index,
}: {
  name: string;
  logo: string;
  description: string;
  features: string[];
  supported: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`rounded-3xl border border-white/5 bg-white/5 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-1 ${
        supported ? "" : "opacity-80"
      }`}
    >
      <div className="text-4xl">{logo}</div>
      <h4 className="mt-4 text-xl font-semibold">{name}</h4>
      <p className="mt-2 text-sm text-slate-200">{description}</p>

      <ul className="mt-6 space-y-2 text-sm text-white/80">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-300">●</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!supported && (
        <div className="mt-6 rounded-2xl border border-dashed border-white/30 bg-white/10 p-3 text-center text-xs font-semibold text-slate-200">
          🔜 Próximamente
        </div>
      )}
    </motion.div>
  );
}

function SecurityFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h4 className="mb-2 font-bold text-white">{title}</h4>
      <p className="text-sm text-slate-200">{description}</p>
    </div>
  );
}

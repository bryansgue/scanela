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
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold mb-4">
            Pasarelas de pago <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">integradas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acepta pagos de tus clientes de forma segura. Tu dinero llega directamente a tu cuenta.
          </p>
        </div>

        {/* GATEWAY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {gateways.map((gateway, idx) => (
            <PaymentGatewayCard key={idx} {...gateway} index={idx} />
          ))}
        </div>

        {/* SECURITY SECTION */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold mb-8 text-center">Seguridad de nivel bancario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* HOW IT WORKS */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8 text-center">¿Cómo funciona?</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
            <FlowStep
              number="1"
              title="Cliente ve el menú"
              description="Accede a tu menú por QR o enlace"
              icon="📱"
            />
            <Arrow />
            <FlowStep
              number="2"
              title="Selecciona productos"
              description="Agrega items al carrito"
              icon="🛒"
            />
            <Arrow />
            <FlowStep
              number="3"
              title="Realiza el pago"
              description="Paga de forma segura"
              icon="💳"
            />
            <Arrow />
            <FlowStep
              number="4"
              title="Tú recibes dinero"
              description="Directamente a tu cuenta"
              icon="✅"
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`
        rounded-xl p-6 border-2 transition-all duration-300
        ${supported
          ? "bg-white border-blue-200 hover:shadow-lg hover:border-blue-400"
          : "bg-gray-50 border-gray-200"
        }
      `}
    >
      <div className="text-4xl mb-3">{logo}</div>
      <h4 className="text-lg font-bold mb-2">{name}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="text-sm flex items-start gap-2">
            <span className="text-green-600 font-bold mt-0.5">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {!supported && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-700 font-semibold">
            🔜 Próximamente
          </p>
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
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
      <div className="text-4xl mb-3 text-center">{icon}</div>
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-4">
        {number}
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center">
      <span className="text-2xl text-gray-400">→</span>
    </div>
  );
}

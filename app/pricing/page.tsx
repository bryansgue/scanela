'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  ChevronLeft,
} from 'lucide-react';

const ANNUAL_DISCOUNT = 0.2;

const plans = [
  {
    id: 'free',
    name: 'Scanela Free',
    icon: Zap,
    monthly: 0,
    description: 'Funciona, pero se ve genérico',
    tagline: 'Ideal para empezar y probar Scanela',
    highlight: false,
    cta: 'Crear menú gratis',
    features: [
      { label: 'Menú digital accesible por QR', available: true },
      { label: 'Actualización del menú en tiempo real', available: true },
      { label: 'Diseño responsive', available: true },
      { label: 'Crear y editar productos', available: true },
      { label: 'URL estándar de Scanela', available: true },
      { label: 'Imágenes de productos', available: false },
      { label: 'Productos destacados', available: false },
      { label: 'Orden manual de productos', available: false },
      { label: 'Logo del negocio', available: false },
      { label: 'Colores personalizados', available: false },
      { label: 'Pagos integrados', available: false },
      { label: 'Reportes de ventas', available: false },
    ],
  },
  {
    id: 'menu',
    name: 'Scanela Menú',
    icon: Sparkles,
    monthly: 4.99,
    description: 'Es tu menú, con tu marca',
    tagline: 'Control total y apariencia profesional',
    highlight: true,
    popular: true,
    cta: 'Activar plan Menú',
    features: [
      { label: 'Todo lo del plan Free', available: true },
      { label: 'URL personalizada', available: true, icon: Link2 },
      { label: 'Imágenes de productos', available: true, icon: ImageIcon },
      { label: 'Productos destacados', available: true, icon: Star },
      { label: 'Reordenar productos y categorías', available: true, icon: Move },
      { label: 'Logo del negocio', available: true, icon: BadgeCheck },
      { label: 'Colores personalizados del menú', available: true, icon: Palette },
      { label: 'Menú sin marca Scanela', available: true },
      { label: 'Pagos integrados', available: false },
      { label: 'Reportes de ventas', available: false },
    ],
  },
];

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes cambiar de plan o cancelar en cualquier momento. Si cancelas dentro del mes, solo pagas los días que usaste.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express) a través de Stripe y LemonSqueezy. Los pagos se procesan de forma segura con encriptación SSL.',
  },
  {
    question: '¿Hay contrato o compromiso a largo plazo?',
    answer: 'No hay contratos obligatorios. Pagas mes a mes o anual si deseas el descuento del 20%. Puedes cancelar en cualquier momento.',
  },
  {
    question: '¿Qué pasa si cancelo mi suscripción?',
    answer: 'Tu menú y datos se desactivan, pero los conservamos durante 30 días por si deseas reactivar. Después se eliminan automáticamente.',
  },
  {
    question: '¿Incluye soporte técnico?',
    answer: 'Todos los planes incluyen soporte por email. Respondemos en máximo 24 horas. Los usuarios Pro tienen prioridad en atención.',
  },
  {
    question: '¿Hay descuentos para emprendedores o startups?',
    answer: 'Sí, contáctanos directamente para negociar planes especiales para emprendedores, ONGs o casos de uso especiales.',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.1),_transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900 mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <h1 className="text-5xl font-bold text-slate-900">
            Planes simples y{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              justos
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Empieza gratis y crece con Scanela. Solo pagas cuando vendes más.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        {/* Billing Toggle */}
        <div className="mb-16 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white p-1 shadow-md border border-slate-200">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                billing === 'monthly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensual
            </button>

            <button
              onClick={() => setBilling('annual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                billing === 'annual'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anual
              <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Ahorra 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-24 flex justify-center">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isFree = plan.monthly === 0;
            const monthlyPrice = plan.monthly;
            const annualPrice = plan.monthly * 12 * (1 - ANNUAL_DISCOUNT);
            const savings = monthlyPrice * 12 - annualPrice;

            return (
              <div
                key={plan.id}
                className={`
                  relative rounded-2xl transition-all duration-300
                  ${
                    plan.highlight
                      ? 'border-2 border-indigo-500 bg-white shadow-[0_25px_80px_rgba(79,70,229,0.2)]'
                      : 'border border-slate-200 bg-white shadow-md hover:-translate-y-1 hover:shadow-lg'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                      ⭐ POPULAR
                    </span>
                  </div>
                )}

                <div className="flex h-full flex-col p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          plan.highlight
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon size={24} />
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm italic text-slate-700 border border-slate-200">
                      "{plan.tagline}"
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {isFree ? (
                      <p className="text-4xl font-extrabold text-slate-900">
                        Gratis
                      </p>
                    ) : billing === 'annual' ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                            ${(annualPrice / 12).toFixed(2)}
                          </span>
                          <span className="text-sm text-slate-600">/mes</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-green-600">
                          Pagas ${annualPrice.toFixed(2)} al año
                        </p>
                        <p className="text-xs text-green-600/70">
                          Ahorras ${savings.toFixed(2)} respecto a mensual
                        </p>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                          ${monthlyPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-600">/mes</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 flex-grow space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex gap-3 text-sm font-medium ${
                          feature.available
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {feature.available ? (
                          <Check size={18} className="flex-shrink-0 text-green-600 mt-0.5" />
                        ) : (
                          <Lock size={18} className="flex-shrink-0 text-slate-300 mt-0.5" />
                        )}
                        <span>{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.id === 'free' ? '/register' : '/register'}
                    className={`
                      block rounded-xl py-3.5 text-center font-bold transition duration-300
                      ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }
                    `}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-24">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Comparativa detallada
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-md">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                    Característica
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                    Menú
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Menú digital por QR', free: true, menu: true },
                  { label: 'Productos ilimitados', free: false, menu: true },
                  { label: 'Imágenes de productos', free: false, menu: true },
                  { label: 'Logo personalizado', free: false, menu: true },
                  { label: 'Colores personalizados', free: false, menu: true },
                  { label: 'URL personalizada', free: false, menu: true },
                  { label: 'Soporte técnico', free: true, menu: true },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.free ? (
                        <Check size={20} className="mx-auto text-green-600" />
                      ) : (
                        <Lock size={20} className="mx-auto text-slate-300" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.menu ? (
                        <Check size={20} className="mx-auto text-green-600" />
                      ) : (
                        <Lock size={20} className="mx-auto text-slate-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-24">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
            Preguntas frecuentes
          </h2>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setExpandedFaq(expandedFaq === idx ? null : idx)
                }
                className="w-full text-left"
              >
                <div className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      {faq.question}
                    </h3>
                    <div
                      className={`flex-shrink-0 text-indigo-600 transition ${
                        expandedFaq === idx ? 'rotate-180' : ''
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>

                  {expandedFaq === idx && (
                    <p className="mt-4 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            ¿Listo para empezar?
          </h2>
          <p className="mt-3 text-lg text-indigo-100">
            Crea tu menú digital gratis hoy. No se requiere tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-indigo-600 transition hover:shadow-lg hover:scale-105"
          >
            Crear menú gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

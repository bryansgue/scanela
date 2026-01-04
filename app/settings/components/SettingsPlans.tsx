"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import Panel from "@/components/Panel";
import { updateUserPlan } from "@/lib/supabase/auth";
import { useUserPlan } from "@/context/UserPlanContext";
import type { UserPlan } from "@/lib/supabase/auth";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  features: { name: string; included: boolean }[];
  current: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    priceMonthly: 10.99,
    priceAnnual: 8.99,
    description: "Perfecto para comenzar",
    current: true,
    features: [
      { name: "2 perfiles", included: true },
      { name: "Hasta 5 redes conectadas", included: true },
      { name: "Publicar en una red a la vez", included: true },
      { name: "Historial limitado (30 días)", included: true },
      { name: "Soporte por email", included: true },
      { name: "Análitica básica", included: false },
      { name: "Programación de posts", included: false },
      { name: "Colaboración en equipo", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 24.99,
    priceAnnual: 19.99,
    description: "Para creadores activos",
    current: false,
    features: [
      { name: "5 perfiles", included: true },
      { name: "Redes ilimitadas", included: true },
      { name: "Publicación simultánea en múltiples redes", included: true },
      { name: "Historial completo", included: true },
      { name: "Soporte prioritario", included: true },
      { name: "Análitica básica", included: true },
      { name: "Programación de posts", included: true },
      { name: "Colaboración en equipo", included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 42.99,
    priceAnnual: 35.99,
    description: "Para equipos y agencias",
    current: false,
    features: [
      { name: "10 perfiles", included: true },
      { name: "Redes ilimitadas", included: true },
      { name: "Publicación simultánea en múltiples redes", included: true },
      { name: "Historial completo", included: true },
      { name: "Soporte 24/7 dedicado", included: true },
      { name: "Análitica avanzada", included: true },
      { name: "Programación de posts", included: true },
      { name: "Colaboración en equipo", included: true },
    ],
  },
];

export default function SettingsPlans() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🚀 Usar contexto en lugar de cargar plan aquí
  const { plan: currentPlanId } = useUserPlan();

  // Auto-actualizar estado de plans
  useEffect(() => {
    PLANS.forEach(p => {
      p.current = p.id === currentPlanId;
    });
  }, [currentPlanId]);

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlanId) {
      setSuccessMessage("Ya tienes este plan");
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      await updateUserPlan(planId as UserPlan);
      setSuccessMessage("Plan actualizado exitosamente ✅");
      PLANS.forEach(p => {
        p.current = p.id === planId;
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating plan:", error);
      setSuccessMessage("Error al actualizar el plan");
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Panel>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planes de Suscripción</h2>
        <p className="text-gray-600 mb-6">Elige el plan que mejor se adapte a tus necesidades</p>

        {/* Botón de período de facturación */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              billingPeriod === "monthly"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              billingPeriod === "annual"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Anual
          </button>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Grid de planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border-2 p-6 transition-all ${
                plan.current
                  ? "border-blue-600 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {plan.current && (
                <div className="mb-3 inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Plan Actual
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnual}
                </span>
                <span className="text-gray-600 ml-2">
                  /{billingPeriod === "monthly" ? "mes" : "mes (anual)"}
                </span>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || plan.current}
                className={`w-full py-2 rounded-lg font-semibold transition mb-6 ${
                  plan.current
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${loading && selectedPlan === plan.id ? "opacity-60" : ""}`}
              >
                {loading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Procesando...
                  </div>
                ) : plan.current ? (
                  "Plan Actual"
                ) : (
                  "Seleccionar"
                )}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check size={20} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 text-gray-400">✗</div>
                    )}
                    <span className={feature.included ? "text-gray-900" : "text-gray-500"}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

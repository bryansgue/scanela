"use client";

import { useState, useEffect } from "react";
import { Check, Calendar, Users, Loader2 } from "lucide-react";
import Panel from "@/components/Panel";
import { updateUserPlan } from "@/lib/supabase/auth";
import { useUserPlan } from "@/context/UserPlanContext";
import { supabase } from "@/lib/supabase/client";
import type { UserPlan } from "@/lib/supabase/auth";

interface Plan {
  id: string;
  name: string;
  icon: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  message: string;
  features: { name: string; included: boolean }[];
  popular?: boolean;
  transactionFee?: number;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Scanela Free",
    icon: "🆓",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Prueba sin límite de tiempo",
    message: "Diseña tu menú completamente gratis",
    features: [
      { name: "Editor intuitivo de productos", included: true },
      { name: "Preview en tiempo real", included: true },
      { name: "1 negocio activo", included: true },
      { name: "Sin límite de categorías y productos", included: true },
      { name: "12 temas de color personalizables", included: true },
      { name: "Logo del negocio personalizado", included: true },
      { name: "❌ QR BLOQUEADO", included: false },
      { name: "Link público de compartir", included: false },
      { name: "Integración WhatsApp", included: false },
      { name: "Sistema de órdenes y pagos", included: false },
    ],
  },
  {
    id: "menu",
    name: "Scanela",
    icon: "📋",
    priceMonthly: 4.99,
    priceAnnual: 49.90,
    description: "Para restaurantes que quieren un menú digital profesional",
    message: "Comparte tu menú por QR, sin imprimir",
    features: [
      { name: "✅ QR Descargable e Imprimible", included: true },
      { name: "Editor intuitivo de productos", included: true },
      { name: "Preview en tiempo real (simulador móvil)", included: true },
      { name: "Hasta 3 negocios activos", included: true },
      { name: "Sin límite de categorías y productos", included: true },
      { name: "12 temas de color personalizables", included: true },
      { name: "Logo del negocio personalizado", included: true },
      { name: "Integración WhatsApp", included: true },
      { name: "Analytics básicos", included: true },
      { name: "Soporte por email", included: true },
      { name: "Sistema de órdenes y pagos", included: false },
    ],
  },
  {
    id: "ventas",
    name: "Scanela Ventas",
    icon: "💳",
    priceMonthly: 9.99,
    priceAnnual: 99.90,
    transactionFee: 0.08,
    description: "Para negocios que quieren recibir órdenes y pagos",
    message: "Reduce filas: el cliente paga antes y solo retira",
    popular: true,
    features: [
      { name: "✅ Todo lo de Scanela +", included: true },
      { name: "Hasta 5 negocios activos", included: true },
      { name: "Carrito de compras", included: true },
      { name: "Sistema de órdenes y pagos", included: true },
      { name: "Integración de pagos en línea", included: true },
      { name: "Transmisión automática de órdenes", included: true },
      { name: "Confirmación de orden al cliente", included: true },
      { name: "Panel de órdenes recibidas", included: true },
      { name: "Historial de órdenes", included: true },
      { name: "Integración POS", included: true },
      { name: "Soporte prioritario por email", included: true },
    ],
  },
];

export default function SettingsPlan() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Usar contexto para obtener plan actual
  const { plan: currentPlanId, loading: loadingPlan, reload: reloadPlan } = useUserPlan();

  const handleSelectPlan = async (planId: string) => {
    if (currentPlanId === planId) {
      return; // No hacer nada si ya está en el plan
    }

    setLoading(true);
    setSelectedPlan(planId);
    setErrorMessage(null);

    try {
      // Actualizar en la BD
      await updateUserPlan(planId as UserPlan);

      // Limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("userPlan");
      }

      // Refrescar la sesión de Auth para obtener los datos actualizados
      await supabase.auth.refreshSession();
      
      // Esperar un poco más para asegurar propagación
      await new Promise(resolve => setTimeout(resolve, 200));

      // Recargar plan desde el contexto
      await reloadPlan();

      const planName = PLANS.find((p) => p.id === planId)?.name;
      setSuccessMessage(`¡Cambio exitoso! Ahora estás en ${planName}`);

      // Limpiar mensaje después de 4 segundos
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("Error al cambiar de plan:", error);
      setErrorMessage(
        `Error al cambiar de plan: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check size={20} className="text-green-600" />
          <p className="text-green-700 font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600 text-lg">⚠️</span>
          <p className="text-red-700 font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Plan Actual */}
      <Panel>
        <div className="border-b pb-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Tu Plan Actual</h3>
          <p className="text-gray-600">
            {loadingPlan
              ? "Cargando..."
              : `Estás usando ${
                  currentPlanId === "free"
                    ? "Scanela Free"
                    : currentPlanId === "menu"
                    ? "Scanela"
                    : "Scanela Ventas"
                }`}
          </p>
        </div>

        {loadingPlan ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-gray-600 ml-2">Cargando plan...</p>
          </div>
        ) : (
          <div
            className={`rounded-lg p-8 border-2 ${
              currentPlanId === "free"
                ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                : currentPlanId === "menu"
                ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300"
                : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">
                    {currentPlanId === "free" ? "🆓" : currentPlanId === "menu" ? "📋" : "💳"}
                  </span>
                  <h4 className="text-3xl font-bold text-gray-900">
                    {currentPlanId === "free" ? "Scanela Free" : currentPlanId === "menu" ? "Scanela" : "Scanela Ventas"}
                  </h4>
                </div>
                <p
                  className={`mb-6 text-lg font-medium ${
                    currentPlanId === "free"
                      ? "text-gray-700"
                      : currentPlanId === "menu"
                      ? "text-blue-700"
                      : "text-purple-700"
                  }`}
                >
                  {currentPlanId === "free"
                    ? "Diseña tu menú gratis, sin límite de tiempo"
                    : currentPlanId === "menu"
                    ? "Comparte tu menú por QR, sin imprimir"
                    : "Reduce filas: el cliente paga antes y solo retira"}
                </p>

                {/* Información de Suscripción */}
                {currentPlanId !== "free" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white bg-opacity-60 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">
                          Próxima Facturación
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        15 de Enero 2025
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Users size={16} />
                        <span className="text-sm font-medium">
                          Negocios Activos
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentPlanId === "menu" ? "1 / 3" : "1 / 5"}
                      </p>
                    </div>
                  </div>
                )}
                {currentPlanId === "free" && (
                  <div className="mt-6 p-4 bg-white bg-opacity-60 rounded-lg border border-gray-300">
                    <p className="text-sm text-gray-700">
                      <strong>Sin expiración:</strong> Diseña tu menú sin límite de tiempo. Actualiza a cualquier plan cuando quieras generar QR.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>

      {/* Comparar y Cambiar Planes */}
      <Panel>
        <div className="border-b pb-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Nuestros Planes
          </h3>
          <p className="text-gray-600">
            Elige el plan que mejor se adapta a tu negocio. Puedes cambiar en
            cualquier momento sin penalizaciones.
          </p>
        </div>

        {/* Cards de Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                plan.id === currentPlanId
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Badge "Plan Actual" */}
              {plan.id === currentPlanId && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  Plan Actual
                </div>
              )}

              {/* Badge "Popular" */}
              {plan.popular && plan.id !== currentPlanId && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                  Más Popular
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{plan.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-xs mb-2">{plan.description}</p>
                <p className="text-sm font-semibold text-gray-700 mb-4 italic">
                  "{plan.message}"
                </p>

                {/* Precio */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-gray-600 text-xs">/mes</span>
                </div>
                {plan.transactionFee !== undefined && (
                  <p className="text-xs text-gray-600 mb-4">
                    + ${plan.transactionFee.toFixed(2)} por venta
                  </p>
                )}
                <p className="text-xs text-gray-600 mb-4">
                  O ${plan.priceAnnual}/año
                </p>

                {/* Botón */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={
                    plan.id === currentPlanId || loading || loadingPlan
                  }
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.id === currentPlanId
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-not-allowed"
                      : loading && selectedPlan === plan.id
                      ? "bg-gray-300 text-gray-600 cursor-wait"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Procesando...
                    </>
                  ) : plan.id === currentPlanId ? (
                    "✓ Plan Actual"
                  ) : (
                    "Cambiar"
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-4 space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check
                        size={16}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <span className="text-gray-300 flex-shrink-0 mt-0.5 text-sm">
                        ✕
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        feature.included
                          ? "text-gray-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Información adicional */}
      <Panel>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Preguntas Frecuentes
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              ¿Puedo cambiar de plan en cualquier momento?
            </h4>
            <p className="text-gray-600 text-sm">
              Sí, puedes cambiar a otro plan en cualquier momento. El cambio se
              aplicará inmediatamente y se ajustarán los cobros según el nuevo
              plan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              ¿Qué diferencia hay entre los dos planes?
            </h4>
            <p className="text-gray-600 text-sm">
              Scanela Menú es para mostrar tu menú digital. Scanela Ventas
              incluye todo lo del plan Menú más órdenes, pagos y múltiples
              negocios.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              ¿Hay contrato a largo plazo?
            </h4>
            <p className="text-gray-600 text-sm">
              No, puedes cancelar en cualquier momento. No hay compromisos a
              largo plazo ni penalizaciones.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  Loader2,
  RefreshCw,
  Users,
  Banknote,
  Wallet,
} from "lucide-react";

import Panel from "@/components/Panel";
import { supabase } from "@/lib/supabase/client";
import { updateUserPlan, type UserPlan } from "@/lib/supabase/auth";
import { useUserPlan } from "@/context/UserPlanContext";

type BillingInterval = "monthly" | "annual";
type PaymentMethod = "stripe" | "paypal" | "bank";

interface Plan {
  id: UserPlan;
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

interface SubscriptionInfo {
  plan: string | null;
  plan_metadata?: { code?: string } | null;
  normalized_plan?: UserPlan;
  status?: string | null;
  billing_period?: string | null;
  cancel_at_period_end?: boolean | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  last_payment_status?: string | null;
  last_payment_at?: string | null;
  stripe_subscription_id?: string | null;
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
      { name: "Menú digital accesible por QR", included: true },
      { name: "Actualización del menú en tiempo real", included: true },
      { name: "Diseño responsive", included: true },
      { name: "Crear y editar productos", included: true },
      { name: "URL estándar de Scanela", included: true },
      { name: "Imágenes de productos", included: false },
      { name: "Productos destacados", included: false },
      { name: "Orden manual de productos", included: false },
      { name: "Logo del negocio", included: false },
      { name: "Colores personalizados", included: false },
    ],
  },
  {
    id: "menu",
  name: "Scanela Menus",
    icon: "📋",
    priceMonthly: 4.99,
    priceAnnual: 49.9,
    description: "Para restaurantes que quieren un menú digital profesional",
    message: "Comparte tu menú por QR, sin imprimir",
    features: [
      { name: "Todo lo del plan Free", included: true },
      { name: "URL personalizada", included: true },
      { name: "Imágenes de productos", included: true },
      { name: "Productos destacados", included: true },
      { name: "Reordenar productos y categorías", included: true },
      { name: "Logo del negocio", included: true },
      { name: "Colores personalizados del menú", included: true },
      { name: "Menú sin marca Scanela", included: true },
    ],
  },
  {
    id: "ventas",
    name: "Scanela Ventas",
    icon: "💳",
    priceMonthly: 9.99,
    priceAnnual: 99.9,
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

const PLAN_MESSAGES: Record<UserPlan, string> = {
  free: "Diseña tu menú gratis, sin límite de tiempo",
  menu: "Comparte tu menú por QR, sin imprimir",
  ventas: "Reduce filas: el cliente paga antes y solo retira",
};

const PLAN_BUTTON_STYLES: Record<Exclude<UserPlan, "free"> | "free", string> = {
  free:
    "bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300",
  menu:
    "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow hover:from-sky-600 hover:to-indigo-600",
  ventas:
    "bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 text-white shadow hover:from-purple-600 hover:via-violet-600 hover:to-fuchsia-600",
};

const BUSINESS_LIMITS: Record<UserPlan, string> = {
  free: "1 / 1",
  menu: "1 / 3",
  ventas: "1 / 5",
};

const INTERVAL_OPTIONS: { id: BillingInterval; name: string; helper: string }[] = [
  { id: "monthly", name: "Mensual", helper: "Paga mes a mes" },
  { id: "annual", name: "Anual", helper: "Ahorra 2 meses" },
];

const STATUS_nameS: Record<string, string> = {
  active: "Activa",
  trialing: "En prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impaga",
  incomplete: "Pendiente de pago",
  incomplete_expired: "Expirada",
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: typeof CreditCard;
  included: boolean;
}[] = [
  {
    id: "stripe",
    name: "Tarjeta débito o crédito",
    description: "Procesado por Stripe (incluye Google Pay / Apple Pay).",
    icon: CreditCard,
    included: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Paga con tu saldo o tarjeta guardada en PayPal.",
    icon: Wallet,
    included: true,
  },
  {
    id: "bank",
    name: "Transferencia Banco Pichincha / Deuna",
    description: "Paga con la app Deuna y envía tu comprobante.",
    icon: Banknote,
    included: true,
  },
];

const BUTTON_FEEDBACK_CLASSES =
  "transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus:outline-none";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatInterval = (interval?: string | null) =>
  interval === "annual" || interval === "year" ? "Anual" : "Mensual";

export default function SettingsPlan() {
  const { plan: currentPlanId, loading: loadingPlan, reload: reloadPlan } = useUserPlan();
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("stripe");
  const [cancelLoading, setCancelLoading] = useState(false);

  const paypalRedirectUrl = process.env.NEXT_PUBLIC_PAYPAL_REDIRECT_URL;
  const bankRedirectUrl = process.env.NEXT_PUBLIC_MERCADO_PAGO_REDIRECT_URL;

  const getAuthHeaders = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {} as Record<string, string>;
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    } as Record<string, string>;
  }, []);

  const normalizedPlan = subscription?.normalized_plan ?? null;
  const subscriptionStatus = subscription?.status ?? null;
  const shouldApplySubscriptionPlan =
    normalizedPlan && subscriptionStatus
      ? ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus)
      : false;

  const effectivePlan: UserPlan = (shouldApplySubscriptionPlan
    ? normalizedPlan
    : currentPlanId) ?? "free";
  const canCancelSubscription = Boolean(
    subscription?.stripe_subscription_id &&
      subscription?.status &&
      subscription.status !== "canceled" &&
      normalizedPlan &&
      normalizedPlan !== "free"
  );
  const hasActivePaidSubscription = canCancelSubscription;
  const displayStatus = shouldApplySubscriptionPlan ? subscription?.status : null;
  const displayBillingPeriod = shouldApplySubscriptionPlan ? subscription?.billing_period : null;
  const nextBillingDateRaw = subscription?.current_period_end;
  const showNextBillingDate =
    Boolean(displayStatus && displayStatus !== "canceled" && nextBillingDateRaw);
  const formattedNextBillingDate = showNextBillingDate
    ? formatDate(nextBillingDateRaw)
    : null;
  const isCancellationScheduled = Boolean(subscription?.cancel_at_period_end);
  const currentPlan = useMemo(
    () => PLANS.find((plan) => plan.id === effectivePlan) ?? PLANS[0],
    [effectivePlan]
  );

  const loadSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      setFetchError(null);
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/billing/subscription", {
        headers: authHeaders,
      });
      if (response.status === 401) {
        setSubscription(null);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener la suscripción");
      }
      setSubscription(data.subscription);
    } catch (error) {
      console.error("[settings] Error cargando suscripción", error);
      setFetchError(
        error instanceof Error ? error.message : "No se pudo leer la suscripción"
      );
    } finally {
      setSubscriptionLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const confirmDowngradeIfNeeded = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar tu suscripción? Seguirá activa hasta que termine el periodo pagado."
    );
    return confirmed;
  };

  const confirmImmediateCancellation = () =>
    window.confirm(
      "¿Quieres cancelar de inmediato? Perderás el acceso al plan pagado al instante y el tiempo restante no es reembolsable."
    );

  const startPaddleCheckout = useCallback(
    async (planId: UserPlan) => {
      setErrorMessage(null);
      setLoadingCheckout(true);
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch("/api/billing/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ planId, interval: billingInterval }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "No se pudo iniciar el checkout");
        }

        if (!payload.url) {
          throw new Error("Paddle no devolvió una URL de checkout");
        }

        window.location.href = payload.url;
      } catch (error) {
        console.error("[settings] Error al cambiar de plan", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Error desconocido al cambiar de plan"
        );
      } finally {
        setLoadingCheckout(false);
        setSelectedPlan(null);
        setShowPaymentModal(false);
      }
    },
    [billingInterval, getAuthHeaders]
  );

  const requestSubscriptionCancellation = useCallback(async (options?: { immediate?: boolean }) => {
    if (cancelLoading) return false;
    if (!subscription?.stripe_subscription_id) {
      setErrorMessage("No encontramos una suscripción activa para cancelar.");
      return false;
    }

    setCancelLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    setSuccessMessage(null);
    const immediate = Boolean(options?.immediate);

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
        headers: immediate
          ? { "Content-Type": "application/json", ...authHeaders }
          : authHeaders,
        body: immediate ? JSON.stringify({ immediate: true }) : undefined,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo cancelar la suscripción");
      }

      if (immediate) {
        setSuccessMessage(
          payload.message ??
            "Cancelamos tu suscripción de inmediato. Ya estás en Scanela Free."
        );
        await supabase.auth.refreshSession();
        await reloadPlan();
      } else {
        setInfoMessage(
          payload.message ??
            "Tu suscripción se cancelará al final del periodo actual. Recibirás un correo de confirmación."
        );
      }
      await loadSubscription();
      return true;
    } catch (error) {
      console.error("[settings] Error al cancelar suscripción", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Ocurrió un error al cancelar la suscripción"
      );
      return false;
    } finally {
      setCancelLoading(false);
    }
  }, [
    cancelLoading,
    getAuthHeaders,
    loadSubscription,
    reloadPlan,
    subscription?.stripe_subscription_id,
  ]);

  const handleSelectPlan = async (planId: UserPlan) => {
    if (planId === currentPlanId || loadingCheckout) return;

    setInfoMessage(null);

    if (planId === "free") {
      if (shouldApplySubscriptionPlan && normalizedPlan && normalizedPlan !== "free") {
        const confirmed = await confirmDowngradeIfNeeded();
        if (!confirmed) return;
        await requestSubscriptionCancellation();
        return;
      }

      setLoadingCheckout(true);
      try {
        await updateUserPlan("free");
        await supabase.auth.refreshSession();
        await reloadPlan();
        await loadSubscription();
        setSuccessMessage("Te movimos a Scanela Free.");
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (error) {
        console.error("[settings] Error al cambiar a Free", error);
        setErrorMessage(
          error instanceof Error ? error.message : "No se pudo actualizar el plan"
        );
      } finally {
        setLoadingCheckout(false);
      }
      return;
    }

    setSelectedPlan(planId);
    setSelectedPaymentMethod("stripe");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || loadingCheckout) return;

    if (selectedPaymentMethod === "stripe") {
      await startPaddleCheckout(selectedPlan);
      return;
    }

    setShowPaymentModal(false);
    setSelectedPlan(null);

    if (selectedPaymentMethod === "paypal") {
      if (paypalRedirectUrl && typeof window !== "undefined") {
        window.open(paypalRedirectUrl, "_blank", "noopener,noreferrer");
        setInfoMessage("Abrimos PayPal en una pestaña nueva. Completa el pago y vuelve para confirmar.");
      } else {
        setInfoMessage(
          "Estamos preparando el checkout con PayPal. Escríbenos por soporte para finalizar tu suscripción con este método."
        );
      }
      return;
    }

    if (selectedPaymentMethod === "bank") {
      if (bankRedirectUrl && typeof window !== "undefined") {
        window.open(bankRedirectUrl, "_blank", "noopener,noreferrer");
      }
      setInfoMessage(
        "Para pagar con la app Deuna / Banco Pichincha, realiza la transferencia en tu app y envíanos el comprobante a soporte@scanela.com para activar tu plan manualmente."
      );
      return;
    }
  };

  const handleCancelSubscription = useCallback(async () => {
    if (!hasActivePaidSubscription) return;
    const confirmed = await confirmDowngradeIfNeeded();
    if (!confirmed) return;
    await requestSubscriptionCancellation();
  }, [hasActivePaidSubscription, requestSubscriptionCancellation]);

  const handleCancelNow = useCallback(async () => {
    if (!hasActivePaidSubscription || !isCancellationScheduled) return;
    const confirmed = confirmImmediateCancellation();
    if (!confirmed) return;
    await requestSubscriptionCancellation({ immediate: true });
  }, [
    hasActivePaidSubscription,
    isCancellationScheduled,
    requestSubscriptionCancellation,
  ]);

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check size={20} className="text-green-600" />
          <p className="text-green-700 font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600" />
          <p className="text-red-700 font-semibold">{errorMessage}</p>
        </div>
      )}

      {infoMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <CreditCard size={18} className="text-blue-600" />
          <p className="text-blue-700 text-sm">{infoMessage}</p>
          <button
            onClick={() => setInfoMessage(null)}
            className={`ml-auto text-xs font-semibold text-blue-600 hover:underline ${BUTTON_FEEDBACK_CLASSES}`}
          >
            Cerrar
          </button>
        </div>
      )}

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-6 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Tu Plan Actual</h3>
            <p className="text-gray-600">
              {loadingPlan
                ? "Cargando..."
                : `Estás usando ${currentPlan.name}`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={loadSubscription}
              disabled={subscriptionLoading}
              className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${BUTTON_FEEDBACK_CLASSES}`}
            >
              <RefreshCw size={16} className={subscriptionLoading ? "animate-spin" : ""} />
              Actualizar datos
            </button>
            {canCancelSubscription && (
              <button
                onClick={isCancellationScheduled ? handleCancelNow : handleCancelSubscription}
                disabled={cancelLoading}
                className={`inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 ${BUTTON_FEEDBACK_CLASSES}`}
              >
                {cancelLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <AlertTriangle size={16} />
                )}
                {isCancellationScheduled ? "Cancelar ahora" : "Cancelar suscripción"}
              </button>
            )}
          </div>
        </div>

        <div
          className={`rounded-lg p-8 border-2 transition-colors ${
            effectivePlan === "free"
              ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
              : effectivePlan === "menu"
              ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300"
              : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">{currentPlan.icon}</span>
            <div>
              <h4 className="text-3xl font-bold text-gray-900">{currentPlan.name}</h4>
              <p
                className={`mt-2 text-lg font-medium ${
                  effectivePlan === "free"
                    ? "text-gray-700"
                    : effectivePlan === "menu"
                    ? "text-blue-700"
                    : "text-purple-700"
                }`}
              >
                {PLAN_MESSAGES[effectivePlan]}
              </p>
            </div>
          </div>

          {fetchError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {fetchError}
            </div>
          )}

          {subscription?.cancel_at_period_end && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertTriangle size={16} />
              {formattedNextBillingDate
                ? `Tu suscripción seguirá activa hasta ${formattedNextBillingDate}. Ese día pasarás automáticamente a Scanela Free.`
                : "Tu suscripción se cancelará al final del periodo actual."}
            </div>
          )}

          {subscriptionLoading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-gray-600">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              Sincronizando con Paddle...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-6">
              <div className="rounded-lg bg-white/70 p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Calendar size={16} /> Próxima facturación
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formattedNextBillingDate ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-white/70 p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <CreditCard size={16} /> Estado
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {displayStatus
                    ? STATUS_nameS[displayStatus] || displayStatus
                    : "Sin suscripción"}
                </p>
                <p className="text-xs text-gray-500">{formatInterval(displayBillingPeriod)}</p>
              </div>
              <div className="rounded-lg bg-white/70 p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Users size={16} /> Negocios activos permitidos
                </div>
                <p className="text-xl font-semibold text-gray-900">{BUSINESS_LIMITS[effectivePlan]}</p>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="flex flex-col gap-4 border-b pb-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Nuestros Planes</h3>
            <p className="text-gray-600">
              Elige el plan que mejor se adapta a tu negocio. El pago se gestiona con Paddle y puedes cancelar en cualquier momento.
            </p>
          </div>
          <div className="relative inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-1 text-sm font-medium text-indigo-800 shadow-inner">
            {INTERVAL_OPTIONS.map((option) => {
              const isActive = billingInterval === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setBillingInterval(option.id)}
                  className={`relative flex-1 rounded-full px-5 py-2 transition-colors ${BUTTON_FEEDBACK_CLASSES} ${
                    isActive ? "text-indigo-900" : "text-indigo-400"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="intervalToggle"
                      className="absolute inset-0 rounded-full bg-white shadow-lg ring-1 ring-indigo-200"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 block font-semibold">{option.name}</span>
                  <span
                    className={`relative z-10 text-xs font-normal ${
                      isActive ? "text-indigo-500" : "text-indigo-300"
                    }`}
                  >
                    {option.helper}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {PLANS.filter((plan) => plan.id !== "ventas").map((plan) => {
            const isCurrent = plan.id === effectivePlan;
            const monthlyPrice = plan.priceMonthly;
            const annualPrice = plan.priceMonthly * 12 * 0.8; // 20% descuento
            const savings = monthlyPrice * 12 - annualPrice;
            const displayPrice = billingInterval === "monthly" ? monthlyPrice : annualPrice / 12;
            const priceSuffix = "/mes";
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  isCurrent
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                    Plan Actual
                  </div>
                )}
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-bold text-white">
                    Más Popular
                  </div>
                )}

                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-3xl">{plan.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  <p className="mb-2 text-xs text-gray-600">{plan.description}</p>
                  <p className="mb-4 text-sm font-semibold text-gray-700 italic">“{plan.message}”</p>
                  <div className="mb-4">
                    {monthlyPrice === 0 ? (
                      <span className="text-3xl font-bold text-gray-900">Gratis</span>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                            ${displayPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-600">{priceSuffix}</span>
                        </div>
                        {billingInterval === "annual" && (
                          <p className="mt-1 text-xs font-medium text-green-600">
                            Pagas ${annualPrice.toFixed(2)} al año · Ahorras ${savings.toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {plan.transactionFee !== undefined && (
                    <p className="mb-4 text-xs text-gray-600">
                      + ${plan.transactionFee.toFixed(2)} por venta
                    </p>
                  )}

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingCheckout || loadingPlan}
                    aria-disabled={isCurrent}
                    className={`w-full rounded-lg py-2 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${BUTTON_FEEDBACK_CLASSES} ${
                      isCurrent
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        : PLAN_BUTTON_STYLES[plan.id]
                    } enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl ${
                      loadingCheckout && selectedPlan === plan.id
                        ? "cursor-wait opacity-70"
                        : ""
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {loadingCheckout && selectedPlan === plan.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Procesando...
                      </>
                    ) : isCurrent ? (
                      "✓ Plan Actual"
                    ) : plan.id === "free" ? (
                      "Cambiar a Free"
                    ) : billingInterval === "annual" ? (
                      "Elegir plan anual"
                    ) : (
                      "Elegir plan mensual"
                    )}
                  </button>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                      ) : (
                        <span className="mt-0.5 flex-shrink-0 text-sm text-gray-300">✕</span>
                      )}
                      <span
                        className={`text-xs ${
                          feature.included ? "text-gray-700 font-medium" : "text-gray-400"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-sm text-gray-600">
              Sí, puedes cambiar a otro plan cuando quieras. El cambio se realiza mediante Stripe y se refleja inmediatamente.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">¿Cuál es la diferencia entre Scanela y Scanela Ventas?</h4>
            <p className="text-sm text-gray-600">
              Scanela Menú es ideal para mostrar tu carta y compartir QR. Scanela Ventas incluye órdenes, pagos y hasta 5 negocios.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">¿Hay contratos o penalizaciones?</h4>
            <p className="text-sm text-gray-600">
              No. Puedes cancelar en cualquier momento desde Stripe y tu plan se mantendrá activo hasta el final del periodo pagado.
            </p>
          </div>
        </div>
      </Panel>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  Método de pago
                </p>
                <h4 className="mt-1 text-2xl font-bold text-gray-900">
                  {PLANS.find((plan) => plan.id === selectedPlan)?.name ?? "Plan seleccionado"}
                </h4>
                <p className="text-sm text-gray-500">
                  Elige cómo deseas pagar para continuar con la activación.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                }}
                className={`text-2xl leading-none text-gray-400 hover:text-gray-600 ${BUTTON_FEEDBACK_CLASSES}`}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => method.included && setSelectedPaymentMethod(method.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${BUTTON_FEEDBACK_CLASSES} ${
                      method.included
                        ? isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-200"
                        : "cursor-not-allowed border-dashed border-gray-200 bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                        method.included ? "bg-indigo-500" : "bg-gray-300"
                      }`}
                    >
                      <Icon size={22} />
                    </span>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          method.included ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {method.name}
                      </p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    {method.id === "stripe" && (
                      <span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold uppercase text-white">
                        Recomendado
                      </span>
                    )}
                    {!method.included && (
                      <span className="text-xs font-semibold uppercase text-gray-400">
                        Pronto
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                }}
                className={`rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 ${BUTTON_FEEDBACK_CLASSES}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loadingCheckout}
                className={`inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60 ${BUTTON_FEEDBACK_CLASSES}`}
              >
                {loadingCheckout && <Loader2 size={16} className="animate-spin" />}
                    {selectedPaymentMethod === "stripe" ? "Continuar con Paddle" : "Muy pronto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

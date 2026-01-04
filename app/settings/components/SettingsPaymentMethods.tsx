"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import Panel from "@/components/Panel";
import { supabase } from "@/lib/supabase/client";
import {
  getPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  type PaymentType,
} from "@/lib/payment/helpers";

interface PaymentMethod {
  id: string;
  type: PaymentType;
  display_name: string;
  last_four?: string;
  expiry_date?: string;
  email?: string;
  is_default: boolean;
  created_at: string;
}

export default function SettingsPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar métodos de pago
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      setErrorMessage("Error al cargar los métodos de pago");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      setDeleting(id);
      await deletePaymentMethod(id);

      setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
      setSuccessMessage("Método de pago eliminado");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      setErrorMessage("Error al eliminar el método de pago");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const currentDefault = paymentMethods.find((m) => m.is_default);
      if (currentDefault) {
        // La función setDefaultPaymentMethod se encarga de esto
      }

      await setDefaultPaymentMethod(id);

      // Recargar métodos de pago
      await loadPaymentMethods();
      setSuccessMessage("Método de pago predeterminado actualizado");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating default method:", error);
      setErrorMessage("Error al actualizar el método predeterminado");
    }
  };

  const getPaymentTypeLabel = (type: PaymentType): string => {
    const labels: Record<PaymentType, string> = {
      credit_card: "Tarjeta de Crédito",
      paypal: "PayPal",
      mercado_pago: "Mercado Pago",
    };
    return labels[type];
  };

  const getPaymentTypeIcon = (type: PaymentType) => {
    switch (type) {
      case "credit_card":
        return "💳";
      case "paypal":
        return "🅿️";
      case "mercado_pago":
        return "🟡";
      default:
        return "💰";
    }
  };

  const getPaymentDetails = (method: PaymentMethod): string => {
    switch (method.type) {
      case "credit_card":
        return method.last_four ? `•••• ${method.last_four}` : "Tarjeta de crédito";
      case "paypal":
        return method.email || "PayPal";
      case "mercado_pago":
        return method.email || "Mercado Pago";
      default:
        return "Método de pago";
    }
  };

  if (loading) {
    return (
      <Panel>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={28} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Métodos de Pago
              </h2>
              <p className="text-gray-600">
                Gestiona tus métodos de pago para las suscripciones
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Agregar Método
          </button>
        </div>

        {/* Mensajes */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Lista de métodos de pago */}
        {paymentMethods.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <CreditCard size={48} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No tienes métodos de pago agregados</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Agregar tu primer método
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 flex items-center justify-between transition-all ${
                  method.is_default
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">
                    {getPaymentTypeIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {getPaymentTypeLabel(method.type)}
                      </p>
                      {method.is_default && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                          <Check size={12} />
                          Predeterminado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getPaymentDetails(method)}
                    </p>
                    {method.expiry_date && (
                      <p className="text-xs text-gray-500">
                        Vence: {method.expiry_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Usar esta
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMethod(method.id)}
                    disabled={deleting === method.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === method.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para agregar método */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Agregar Método de Pago
              </h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedType("credit_card")}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedType === "credit_card"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <p className="font-semibold text-gray-900">Tarjeta de Crédito</p>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, American Express
                  </p>
                </button>

                <button
                  onClick={() => setSelectedType("paypal")}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedType === "paypal"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🅿️</div>
                  <p className="font-semibold text-gray-900">PayPal</p>
                  <p className="text-sm text-gray-600">
                    Paga de forma segura con tu cuenta PayPal
                  </p>
                </button>

                <button
                  onClick={() => setSelectedType("mercado_pago")}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedType === "mercado_pago"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🟡</div>
                  <p className="font-semibold text-gray-900">Mercado Pago</p>
                  <p className="text-sm text-gray-600">
                    Usa tu billetera de Mercado Pago
                  </p>
                </button>
              </div>

              {selectedType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Serás redirigido a {getPaymentTypeLabel(selectedType)} para completar
                    el proceso de forma segura.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedType(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedType) {
                      // TODO: Integrar con Stripe, PayPal, Mercado Pago
                      alert(
                        `Redirigiendo a ${getPaymentTypeLabel(selectedType)}...`
                      );
                      // setShowModal(false);
                      // setSelectedType(null);
                    }
                  }}
                  disabled={!selectedType}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

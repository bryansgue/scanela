"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, businessId, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Datos del cliente
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">No hay productos para procesar el pago</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al menú
          </Link>
        </div>
      </div>
    );
  }

  const total = getTotal();
  const totalWithTax = total * 1.1;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async () => {
    // Validar formulario
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage("Por favor completa todos los campos requeridos");
      return;
    }

    // Si es domicilio, validar dirección
    if (deliveryType === "delivery" && !formData.address) {
      setErrorMessage("Por favor ingresa una dirección de entrega");
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // 1. Crear la orden
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: deliveryType === "delivery" ? formData.address : "Retiro en local",
          deliveryType,
          notes: formData.notes,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: totalWithTax,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Error al crear la orden");
      }

      const order = await orderResponse.json();

      // 2. Procesar el pago (MOCK)
      const paymentResponse = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: totalWithTax,
          email: formData.email,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Error al procesar el pago");
      }

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        setPaymentStatus("success");
        clearCart();

        // Redirigir a confirmación en 2 segundos
        setTimeout(() => {
          router.push(`/order-confirmation/${order.id}`);
        }, 2000);
      } else {
        setPaymentStatus("error");
        setErrorMessage(paymentResult.message || "El pago fue rechazado");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={18} />
          Volver al menú
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Datos de Entrega</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Tipo de entrega *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                      deliveryType === "pickup"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🏪 Retiro en local
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all border-2 ${
                      deliveryType === "delivery"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🚚 Domicilio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {deliveryType === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle 123, Departamento 4B"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notas especiales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Alergias, preferencias, etc."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Mensajes de estado */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold text-sm">¡Pago exitoso!</p>
                  <p className="text-green-700 text-sm">Redirigiendo a confirmación...</p>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de orden */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de Orden</h2>

            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA (10%):</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">${totalWithTax.toFixed(2)}</span>
              </div>
            </div>

            {/* Método de pago simulado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-2">Método de Pago</p>
              <p className="text-sm text-blue-800">💳 Tarjeta de Crédito (SIMULADO)</p>
              <p className="text-xs text-blue-700 mt-2">
                🧪 Este es un pago de prueba. No se cobrarán fondos reales.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || paymentStatus === "success"}
              className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                loading || paymentStatus === "success"
                  ? "bg-gray-300 text-gray-900 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando pago...
                </>
              ) : (
                `Pagar $${totalWithTax.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

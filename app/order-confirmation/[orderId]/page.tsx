"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, FileText, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error("Orden no encontrada");
        }

        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || "No se pudo cargar la orden"}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al menú
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Orden Confirmada!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Tu pago ha sido procesado exitosamente
          </p>

          {/* Order Number */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
            <p className="text-2xl font-bold text-blue-600 break-all">{orderId}</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles del Pedido</h2>

            <div className="space-y-4">
              {/* Cliente */}
              <div className="flex gap-3">
                <Mail size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{order.customer_email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold text-gray-900">{order.customer_phone}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-semibold text-gray-900">{order.customer_address}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha y Hora</p>
                  <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Productos ({itemCount})
            </h2>

            <div className="space-y-3">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between border-b pb-3 last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${(order.total / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">IVA (10%):</span>
                <span className="font-semibold">${((order.total / 1.1) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-green-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span
              className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${
                order.status === "completed" ? "bg-green-600" : "bg-yellow-600"
              }`}
            >
              {order.status === "completed" ? "✅ Pagado" : "⏳ Pendiente"}
            </span>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm font-semibold text-gray-900 mb-2">Notas Especiales</p>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-green-800">
              🎉 Tu orden ha sido enviada al restaurante. Se pondrán en contacto contigo en breve para confirmar
              el tiempo de entrega.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${order.customer_email}?subject=Confirmaci%C3%B3n%20de%20Orden%20%23${orderId}`}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📧 Ver Confirmación por Email
            </a>
            <Link
              href="/"
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
            >
              Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

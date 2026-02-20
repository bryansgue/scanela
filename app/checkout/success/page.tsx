"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("_ptxn");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!transactionId) {
      setStatus("error");
      setMessage("No transaction ID found");
      return;
    }

    // Aquí iría la lógica para verificar el pago con Paddle
    // Por ahora, asumimos que si llegamos aquí, es exitoso
    console.log("[Checkout Success] Transaction ID:", transactionId);

    // Simular verificación del pago
    setTimeout(() => {
      setStatus("success");
      setMessage("¡Pago procesado correctamente!");
    }, 1500);
  }, [transactionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-blue-600 mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando tu pago...</h1>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error en el pago</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/settings?tab=plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a intentar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago completado!</h1>
        <p className="text-gray-600 mb-2">ID de transacción: {transactionId}</p>
        <p className="text-gray-600 mb-6">Tu suscripción ha sido activada correctamente.</p>
        
        <div className="space-y-3">
          <Link
            href="/settings?tab=plan"
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver mi plan
          </Link>
          <Link
            href="/"
            className="block px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-blue-600 mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h1>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

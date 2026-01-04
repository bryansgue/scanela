import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, email } = body;

    if (!orderId || !amount || !email) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // SIMULACIÓN DE PAGO
    // En producción aquí irían las llamadas a Stripe, Mercado Pago, etc.
    
    // Simular diferentes resultados según el email de prueba
    const testEmails = {
      "fail@test.com": false, // Este email simulará un pago rechazado
      "decline@test.com": false,
    };

    // 70% de probabilidad de éxito en pagos reales
    const isSuccessful = 
      email in testEmails ? (testEmails as Record<string, boolean>)[email] : Math.random() > 0.3;

    // Simular latencia de red
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isSuccessful) {
      return NextResponse.json({
        success: true,
        orderId: orderId,
        amount: amount,
        email: email,
        transactionId: `MOCK_${Date.now()}`,
        message: "Pago procesado exitosamente",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        orderId: orderId,
        message: "La tarjeta fue rechazada. Intenta con otro método de pago.",
        code: "CARD_DECLINED",
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Error al procesar el pago",
        message: "Ocurrió un error inesperado. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

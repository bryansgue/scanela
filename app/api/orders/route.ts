import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
      items,
      total,
    } = body;

    // Validar datos requeridos
    if (!businessId || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    // Crear la orden en Supabase
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          business_id: businessId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          notes: notes || null,
          items: items, // Guardar como JSON
          total: total,
          status: "pending", // Estado inicial: pendiente de pago
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      total: data.total,
      message: "Orden creada exitosamente",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

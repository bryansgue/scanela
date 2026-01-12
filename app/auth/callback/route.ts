import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import { planMetadata, planToDb } from "@/lib/plans";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log("🔵 Callback recibido. code =", code);

  // Si no hay código → no hay forma de intercambiar sesión
  if (!code) {
    console.log("❌ No se recibió código OAuth");
    return NextResponse.redirect("http://localhost:3000/login");
  }

  const supabase = createRouteHandlerClient({ cookies });

  // Intercambiar el código por una sesión
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("🟣 Intercambio de código:", { data, error });

  if (error) {
    console.error("❌ Error al intercambiar código:", error.message);
    return NextResponse.redirect("http://localhost:3000/login");
  }

  // ✅ Crear suscripción inicial si no existe
  const userId = data.user?.id;
  if (userId) {
    try {
      // Verificar si ya existe suscripción
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single();

      // Si no existe, crear nueva
      if (!existing) {
        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días después

        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan: planToDb("free"),
            plan_source: "manual",
            plan_metadata: planMetadata("free"),
            billing_period: "monthly",
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: endDate.toISOString(),
          });

        if (insertError) {
          console.error("❌ Error creando suscripción:", insertError);
        } else {
          console.log("✅ Suscripción inicial creada para usuario:", userId);
        }
      }
    } catch (error) {
      console.error("Error en createInitialSubscription:", error);
      // No lanzar error, solo loguear
    }
  }

  console.log("🟢 Sesión creada correctamente. Redirigiendo a dashboard…");

  return NextResponse.redirect("http://localhost:3000/dashboard");
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { planFromDb, planFromMetadata } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = getSupabaseAdminClient();
    const { user, error: authError } = await getUserFromAuthHeader(admin);

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const {
      data,
      error: subscriptionError,
    } = await admin
      .from("subscriptions")
      .select(
        "plan,plan_metadata,status,billing_period,plan_source,cancel_at_period_end,current_period_start,current_period_end,last_payment_status,last_payment_at,stripe_subscription_id,stripe_price_id,stripe_customer_id,stripe_checkout_session_id,trial_ends_at,updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("[Billing][subscription] Error obteniendo suscripción:", subscriptionError);
      return NextResponse.json({ error: "No se pudo obtener la suscripción" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        ...data,
        normalized_plan: planFromMetadata(data.plan_metadata) ?? planFromDb(data.plan),
      },
    });
  } catch (err) {
    console.error("[Billing][subscription] Error inesperado:", err);
    return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
  }
}

async function getUserFromAuthHeader(admin: SupabaseClient) {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization") ?? headerStore.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "Missing token" } as const;
  }

  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
  const { data, error } = await admin.auth.getUser(accessToken);

  if (error || !data.user) {
    return { user: null, error: error?.message ?? "Invalid token" } as const;
  }

  return { user: data.user, error: null } as const;
}

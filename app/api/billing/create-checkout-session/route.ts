import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import {
  createPaddleCheckout,
  createOrGetPaddleCustomer,
  mapPaddlePriceIdToPlan,
} from "@/lib/paddleServer";
import { planMetadata, planToDb } from "@/lib/plans";

const SUPPORTED_PLANS = ["menu", "ventas"];
const SUPPORTED_INTERVALS = ["monthly", "annual"];

const serialize = (payload: unknown) => JSON.parse(JSON.stringify(payload ?? null));

function resolveOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { planId, interval = "monthly" } = body;

    if (!planId || !SUPPORTED_PLANS.includes(planId)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    if (!interval || !SUPPORTED_INTERVALS.includes(interval)) {
      return NextResponse.json({ error: "Intervalo inválido" }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { user, error } = await getUserFromAuthHeader(admin);

    if (error || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Note: Paddle customer will be created automatically during checkout
    // No need to create it beforehand

    // Get Price ID from environment
    const priceIdKey =
      interval === "monthly"
        ? `PADDLE_PRICE_${planId.toUpperCase()}_MONTHLY`
        : `PADDLE_PRICE_${planId.toUpperCase()}_ANNUAL`;

    const priceId = process.env[priceIdKey];

    if (!priceId) {
      console.error(`[checkout] Missing environment variable: ${priceIdKey}`);
      return NextResponse.json(
        { error: "Plan configuration error" },
        { status: 500 }
      );
    }

    // Create Paddle checkout
    const checkout = await createPaddleCheckout(
      user.id,
      priceId,
      interval as "monthly" | "annual"
    ).catch(error => {
      console.error("[checkout] Detailed error from Paddle:", {
        message: error.message,
        status: error.status,
        body: error.body,
      });
      throw error;
    });

    const origin = resolveOrigin();

    // Save subscription record in Supabase (use only columns that exist)
    const subscriptionPayload = {
      user_id: user.id,
      plan: planToDb(planId as "menu" | "ventas"),
      plan_source: "paddle",
      billing_period: interval,
      status: "incomplete",
      plan_metadata: planMetadata(planId as "menu" | "ventas"),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (upsertError) {
      console.error("[checkout] Error guardando suscripción:", upsertError);
      return NextResponse.json({
        error: "No se pudo preparar la suscripción",
      }, { status: 500 });
    }

    // Try to update paddle columns if they exist
    try {
      await admin
        .from("subscriptions")
        .update({
          paddle_price_id: priceId,
          paddle_checkout_id: checkout.checkoutId,
          paddle_customer_id: user.id,
        })
        .eq("user_id", user.id);
    } catch (paddleColError) {
      // Columns might not exist yet - that's OK
      console.log("[checkout] Paddle columns might not exist yet");
    }

    // Log event
    await admin.from("payment_events").insert({
      user_id: user.id,
      event_type: "checkout.created",
      payload: serialize({ checkoutId: checkout.checkoutId, priceId }),
    });

    console.log(`[checkout] Created checkout for user ${user.id}:`, checkout.checkoutId);

    return NextResponse.json({
      url: checkout.checkoutUrl,
      checkoutId: checkout.checkoutId,
    });
  } catch (err) {
    console.error("[checkout] Error inesperado:", err);
    return NextResponse.json(
      { error: "No se pudo crear el checkout" },
      { status: 500 }
    );
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

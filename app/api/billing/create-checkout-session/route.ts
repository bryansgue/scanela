import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { getPriceId, stripe, type StripePlanId, type StripePlanInterval } from "../../../../lib/stripeServer";
import { planMetadata, planToDb } from "@/lib/plans";

const SUPPORTED_PLANS: StripePlanId[] = ["menu", "ventas"];
const SUPPORTED_INTERVALS: StripePlanInterval[] = ["monthly", "annual"];

const serialize = (payload: unknown) => JSON.parse(JSON.stringify(payload ?? null));

function assertPlanId(value: unknown): value is StripePlanId {
  return typeof value === "string" && SUPPORTED_PLANS.includes(value as StripePlanId);
}

function assertInterval(value: unknown): value is StripePlanInterval {
  return typeof value === "string" && SUPPORTED_INTERVALS.includes(value as StripePlanInterval);
}

function resolveOrigin(request: NextRequest) {
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
  return origin || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { planId, interval = "monthly" } = body;

    if (!assertPlanId(planId)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    if (!assertInterval(interval)) {
      return NextResponse.json({ error: "Intervalo inválido" }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    const { user, error } = await getUserFromAuthHeader(admin);

    if (error || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const {
      data: subscription,
      error: subscriptionError,
    } = await admin
      .from("subscriptions")
      .select("id,user_id,stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("[Billing][checkout] Error consultando suscripción:", subscriptionError);
      return NextResponse.json({ error: "No se pudo crear la sesión." }, { status: 500 });
    }

    let stripeCustomerId = subscription?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;
    }

    let priceId: string;
    try {
      priceId = getPriceId(planId, interval);
    } catch (priceError) {
      const message = priceError instanceof Error ? priceError.message : "No se pudo determinar el precio";
      console.error("[Billing][checkout] Configuración de Stripe incompleta:", priceError);
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const origin = resolveOrigin(request);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      locale: "es-419",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/settings?checkout=success`,
      cancel_url: `${origin}/settings?checkout=canceled`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
        planId,
        interval,
        priceId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          planId,
          interval,
          priceId,
        },
      },
    });

    if (!session.url) {
      console.error("[Billing][checkout] Sesión creada sin URL", session.id);
      return NextResponse.json({ error: "Stripe no devolvió una URL" }, { status: 500 });
    }

    const subscriptionPayload = {
      user_id: user.id,
      plan: planToDb(planId),
      plan_source: "stripe",
      billing_period: interval,
      status: "incomplete",
      stripe_price_id: priceId,
      stripe_checkout_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      plan_metadata: planMetadata(planId),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await admin
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "user_id" });

    if (upsertError) {
      console.error("[Billing][checkout] Error guardando suscripción:", upsertError);
      return NextResponse.json({ error: "No se pudo preparar la suscripción" }, { status: 500 });
    }

    await admin.from("payment_events").insert({
      user_id: user.id,
      event_type: "checkout.session.created",
      stripe_id: session.id,
      payload: serialize(session),
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[Billing][checkout] Error inesperado:", err);
    return NextResponse.json({ error: "No se pudo crear el checkout" }, { status: 500 });
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

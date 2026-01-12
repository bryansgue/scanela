import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { stripe } from "../../../../lib/stripeServer";
import { planMetadata, planToDb } from "@/lib/plans";

const epochToIso = (value?: number | null) =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdminClient();
    const { user, error } = await getUserFromAuthHeader(admin);

    if (error || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { immediate } = (await request.json().catch(() => ({}))) as {
      immediate?: boolean;
    };
    const cancelImmediately = Boolean(immediate);

    const {
      data: subscription,
      error: subscriptionError,
    } = await admin
      .from("subscriptions")
      .select("id,stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("[Billing][cancel] Error leyendo suscripción:", subscriptionError);
      return NextResponse.json({ error: "No se pudo leer la suscripción" }, { status: 500 });
    }

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa para cancelar" },
        { status: 400 }
      );
    }

    const stripeSubscription = cancelImmediately
      ? ((await stripe.subscriptions.cancel(subscription.stripe_subscription_id)) as Stripe.Subscription)
      : ((await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })) as Stripe.Subscription);
    const currentPeriodEnd =
      (stripeSubscription as Stripe.Subscription & { current_period_end?: number | null })
        .current_period_end ?? null;

    const baseUpdate = {
      cancel_at_period_end: cancelImmediately
        ? stripeSubscription.cancel_at_period_end ?? false
        : stripeSubscription.cancel_at_period_end ?? true,
      status: stripeSubscription.status,
      current_period_end: epochToIso(currentPeriodEnd),
      updated_at: new Date().toISOString(),
    };

    const immediateUpdate = cancelImmediately
      ? {
          plan: planToDb("free"),
          plan_metadata: planMetadata("free"),
          plan_source: "stripe",
        }
      : {};

    await admin
      .from("subscriptions")
      .update({
        ...baseUpdate,
        ...immediateUpdate,
      })
      .eq("id", subscription.id);

    if (cancelImmediately) {
      try {
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: { plan: "free" },
        });
      } catch (metadataError) {
        console.error("[Billing][cancel] Error bajando metadata a Free:", metadataError);
      }
    }

    await admin.from("payment_events").insert({
      user_id: user.id,
      event_type: cancelImmediately
        ? "subscription.cancelled.immediate"
        : "subscription.cancelled.request",
      stripe_id: stripeSubscription.id,
      payload: {
        cancel_at_period_end: cancelImmediately
          ? false
          : true,
        cancelled_immediately: cancelImmediately,
      },
    });

    return NextResponse.json(
      cancelImmediately
        ? {
            message: "Cancelamos tu suscripción de inmediato. Ya estás en Scanela Free.",
            cancel_at: epochToIso(currentPeriodEnd),
          }
        : {
            message: "Tu suscripción se cancelará al final del periodo actual.",
            cancel_at: epochToIso(currentPeriodEnd),
          }
    );
  } catch (err) {
    console.error("[Billing][cancel] Error inesperado:", err);
    return NextResponse.json({ error: "No se pudo cancelar la suscripción" }, { status: 500 });
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

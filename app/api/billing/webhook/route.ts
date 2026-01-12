import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import {
	resolvePlanFromPriceId,
	stripe,
	type StripePlanId,
	type StripePlanInterval,
} from "../../../../lib/stripeServer";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { normalizeInterval, planMetadata, planToDb } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const serialize = (payload: unknown) => JSON.parse(JSON.stringify(payload ?? null));
type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

const epochToIso = (value?: number | null) =>
	typeof value === "number" ? new Date(value * 1000).toISOString() : null;

function determinePlan(
	metadataPlan?: string | null,
	priceId?: string | null
): StripePlanId {
	if (metadataPlan === "menu" || metadataPlan === "ventas") {
		return metadataPlan;
	}
	const resolved = resolvePlanFromPriceId(priceId || undefined);
	return resolved?.plan ?? "menu";
}

function determineInterval(
	metadataInterval?: string | null,
	stripeInterval?: string | null,
	priceId?: string | null
): StripePlanInterval {
	if (metadataInterval === "annual" || metadataInterval === "monthly") {
		return metadataInterval;
	}
	if (stripeInterval) {
		return normalizeInterval(stripeInterval);
	}
	const resolved = resolvePlanFromPriceId(priceId || undefined);
	return resolved?.interval ?? "monthly";
}

async function resolveUserId(
	admin: AdminClient,
	payload: Stripe.Event.Data.Object | null
) {
	if (!payload || typeof payload !== "object") return null;

	const directMetadata = (payload as { metadata?: Record<string, unknown> }).metadata;
	if (directMetadata && typeof directMetadata.supabase_user_id === "string") {
		return directMetadata.supabase_user_id;
	}

	const customerField = (payload as { customer?: string | Stripe.Customer }).customer;
	const customerId = typeof customerField === "string" ? customerField : customerField?.id;

	if (customerId) {
		const { data } = await admin
			.from("subscriptions")
			.select("user_id")
			.eq("stripe_customer_id", customerId)
			.maybeSingle();
		if (data?.user_id) return data.user_id;
	}

	const subscriptionField = (payload as { subscription?: string | Stripe.Subscription }).subscription;
	const subscriptionId =
		typeof subscriptionField === "string"
			? subscriptionField
			: subscriptionField?.id || (payload as Stripe.Subscription | null)?.id;

	if (subscriptionId) {
		const { data } = await admin
			.from("subscriptions")
			.select("user_id")
			.eq("stripe_subscription_id", subscriptionId)
			.maybeSingle();
		if (data?.user_id) return data.user_id;
	}

	return null;
}

async function logEvent(
	admin: AdminClient,
	event: Stripe.Event,
	userId: string | null
) {
	try {
		await admin.from("payment_events").insert({
			user_id: userId,
			event_type: event.type,
			stripe_id: (event.data.object as { id?: string })?.id ?? event.id,
			payload: serialize(event.data.object),
		});
	} catch (err) {
		console.error("[Billing][webhook] Error registrando evento:", err);
	}
}

async function persistSubscription(
	admin: AdminClient,
	data: {
		userId: string | null;
		subscriptionId?: string | null;
		customerId?: string | null;
		payload: Record<string, unknown>;
	}
) {
	const cleanedPayload = Object.fromEntries(
		Object.entries({ ...data.payload, updated_at: new Date().toISOString() }).filter(
			([, value]) => value !== undefined
		)
	);

	try {
		if (data.userId) {
			await admin
				.from("subscriptions")
				.upsert(
					{
						user_id: data.userId,
						...cleanedPayload,
					},
					{ onConflict: "user_id" }
				);
			return;
		}

		if (data.subscriptionId) {
			await admin
				.from("subscriptions")
				.update(cleanedPayload)
				.eq("stripe_subscription_id", data.subscriptionId);
			return;
		}

		if (data.customerId) {
			await admin
				.from("subscriptions")
				.update(cleanedPayload)
				.eq("stripe_customer_id", data.customerId);
		}
	} catch (err) {
		console.error("[Billing][webhook] Error guardando suscripción:", err);
	}
}

async function updateUserPlanMetadata(
	admin: AdminClient,
	userId: string | null,
	plan: StripePlanId | "free"
) {
	if (!userId) return;
	try {
		await admin.auth.admin.updateUserById(userId, {
			user_metadata: { plan },
		});
	} catch (err) {
		console.error("[Billing][webhook] Error actualizando metadata de usuario:", err);
	}
}

async function handleCheckoutCompleted(
	admin: AdminClient,
	session: Stripe.Checkout.Session,
	userId: string | null
) {
	const supabaseUserId =
		(session.metadata?.supabase_user_id as string | undefined) || userId;
	if (!supabaseUserId) return;

	const priceId = (session.metadata?.priceId as string | undefined) ?? null;
	const plan = determinePlan(session.metadata?.planId as string, priceId);
	const interval = determineInterval(session.metadata?.interval as string, null, priceId);
	const subscriptionId =
		typeof session.subscription === "string"
			? session.subscription
			: session.subscription?.id ?? null;
	const customerId =
		typeof session.customer === "string"
			? session.customer
			: session.customer?.id ?? null;

	await persistSubscription(admin, {
		userId: supabaseUserId,
		subscriptionId,
		customerId,
		payload: {
			plan: planToDb(plan),
			plan_metadata: planMetadata(plan),
			plan_source: "stripe",
			billing_period: interval,
			status: session.payment_status === "paid" ? "active" : "pending",
			stripe_checkout_session_id: session.id,
			stripe_subscription_id: subscriptionId,
			stripe_customer_id: customerId,
			stripe_price_id: priceId,
		},
	});

	if (session.payment_status === "paid") {
		await updateUserPlanMetadata(admin, supabaseUserId, plan);
	}
}

async function handleSubscriptionSync(
	admin: AdminClient,
	subscription: Stripe.Subscription,
	userId: string | null,
	eventType: string
) {
	const supabaseUserId = subscription.metadata?.supabase_user_id || userId;
	const customerId =
		typeof subscription.customer === "string"
			? subscription.customer
			: subscription.customer?.id ?? null;
	const priceId = subscription.items.data[0]?.price?.id ?? null;
	const periodFields = subscription as {
		current_period_start?: number | null;
		current_period_end?: number | null;
	};
	const plan =
		eventType === "customer.subscription.deleted"
			? "free"
			: determinePlan(subscription.metadata?.planId as string, priceId);
	const interval =
		eventType === "customer.subscription.deleted"
			? "monthly"
			: determineInterval(
					subscription.metadata?.interval as string,
					subscription.items.data[0]?.price?.recurring?.interval,
					priceId
				);

	await persistSubscription(admin, {
		userId: supabaseUserId,
		subscriptionId: subscription.id,
		customerId,
		payload: {
			plan: plan === "free" ? planToDb("free") : planToDb(plan as StripePlanId),
			plan_metadata: planMetadata(plan === "free" ? "free" : (plan as StripePlanId)),
			plan_source: "stripe",
			billing_period: interval,
			status:
				eventType === "customer.subscription.deleted" ? "canceled" : subscription.status,
			stripe_customer_id: customerId,
			stripe_subscription_id: subscription.id,
			stripe_price_id: priceId,
					current_period_start: epochToIso(periodFields.current_period_start),
					current_period_end: epochToIso(periodFields.current_period_end),
			cancel_at_period_end: subscription.cancel_at_period_end ?? false,
			trial_ends_at: epochToIso(subscription.trial_end),
		},
	});

	await updateUserPlanMetadata(admin, supabaseUserId, plan === "free" ? "free" : (plan as StripePlanId));
}

async function handleInvoiceEvent(
	admin: AdminClient,
	invoice: Stripe.Invoice,
	userId: string | null,
	eventType: string
) {
	const customerId =
		typeof invoice.customer === "string"
			? invoice.customer
			: invoice.customer?.id ?? null;

	const status =
		eventType === "invoice.payment_succeeded"
			? "paid"
			: invoice.status ?? "open";
	const paidAt =
		invoice.status_transitions?.paid_at || invoice.created
			? epochToIso(invoice.status_transitions?.paid_at || invoice.created)
			: new Date().toISOString();

	const query = admin
		.from("subscriptions")
		.update({
			last_payment_status: status,
			last_payment_at: paidAt,
			updated_at: new Date().toISOString(),
		});

	if (customerId) {
		query.eq("stripe_customer_id", customerId);
	} else if (userId) {
		query.eq("user_id", userId);
	} else {
		return;
	}

	await query;
}

export async function POST(request: NextRequest) {
	if (!webhookSecret) {
		console.error("[Billing][webhook] Falta STRIPE_WEBHOOK_SECRET");
		return NextResponse.json({ error: "Stripe no configurado" }, { status: 500 });
	}

	const signature = request.headers.get("stripe-signature");
	if (!signature) {
		return NextResponse.json({ error: "Sin firma" }, { status: 400 });
	}

	const rawBody = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
	} catch (err) {
		console.error("[Billing][webhook] Firma inválida:", err);
		return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
	}

	const admin = getSupabaseAdminClient();
	const stripeObject = event.data.object;
	const userId = await resolveUserId(admin, stripeObject);

	await logEvent(admin, event, userId);

	try {
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutCompleted(admin, stripeObject as Stripe.Checkout.Session, userId);
				break;
			case "customer.subscription.created":
			case "customer.subscription.updated":
			case "customer.subscription.deleted":
				await handleSubscriptionSync(admin, stripeObject as Stripe.Subscription, userId, event.type);
				break;
			case "invoice.payment_succeeded":
			case "invoice.payment_failed":
				await handleInvoiceEvent(admin, stripeObject as Stripe.Invoice, userId, event.type);
				break;
			default:
				break;
		}
	} catch (err) {
		console.error("[Billing][webhook] Error procesando evento:", event.type, err);
		return NextResponse.json({ error: "Error procesando evento" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}

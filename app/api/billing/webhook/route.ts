import { NextResponse } from "next/server";
import {
	verifyPaddleWebhookSignature,
	parsePaddleWebhookEvent,
	mapPaddlePriceIdToPlan,
	getBillingIntervalFromPriceId,
	type PaddleWebhookEvent,
} from "@/lib/paddleServer";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { planMetadata, planToDb, normalizeInterval } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const serialize = (payload: unknown) => JSON.parse(JSON.stringify(payload ?? null));
type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

async function resolveUserId(
	admin: AdminClient,
	event: PaddleWebhookEvent
): Promise<string | null> {
	const customerId = (event.data as any).customer_id;
	
	if (customerId) {
		// Try to find user by paddle customer ID
		const { data } = await admin
			.from("subscriptions")
			.select("user_id")
			.eq("paddle_customer_id", customerId)
			.maybeSingle();
		if (data?.user_id) return data.user_id;
	}

	// If it's a subscription event, try to find by subscription ID
	const subscriptionId = (event.data as any).subscription_id || (event.data as any).id;
	if (subscriptionId && event.event_type.includes("subscription")) {
		const { data } = await admin
			.from("subscriptions")
			.select("user_id")
			.eq("paddle_subscription_id", subscriptionId)
			.maybeSingle();
		if (data?.user_id) return data.user_id;
	}

	return null;
}

async function logEvent(
	admin: AdminClient,
	event: PaddleWebhookEvent,
	userId: string | null
) {
	try {
		await admin.from("payment_events").insert({
			user_id: userId,
			event_type: event.event_type,
			paddle_id: event.event_id,
			payload: serialize(event.data),
		});
	} catch (err) {
		console.error("[webhook] Error registrando evento:", err);
	}
}

async function persistSubscription(
	admin: AdminClient,
	data: {
		userId: string | null;
		subscriptionId?: string | null;
		customerId?: string | null;
		payload: Record<string, any>;
	}
) {
	// Filter to only include columns that are guaranteed to exist
	const safePayload = {
		updated_at: new Date().toISOString(),
	} as Record<string, any>;

	// Add columns that we know exist
	if (data.payload.plan !== undefined) safePayload.plan = data.payload.plan;
	if (data.payload.plan_metadata !== undefined) safePayload.plan_metadata = data.payload.plan_metadata;
	if (data.payload.status !== undefined) safePayload.status = data.payload.status;
	if (data.payload.billing_period !== undefined) safePayload.billing_period = data.payload.billing_period;
	if (data.payload.cancel_at_period_end !== undefined) safePayload.cancel_at_period_end = data.payload.cancel_at_period_end;
	if (data.payload.current_period_start !== undefined) safePayload.current_period_start = data.payload.current_period_start;
	if (data.payload.current_period_end !== undefined) safePayload.current_period_end = data.payload.current_period_end;
	if (data.payload.last_payment_status !== undefined) safePayload.last_payment_status = data.payload.last_payment_status;
	if (data.payload.last_payment_at !== undefined) safePayload.last_payment_at = data.payload.last_payment_at;
	if (data.payload.plan_source !== undefined) safePayload.plan_source = data.payload.plan_source;

	try {
		if (data.userId) {
			await admin
				.from("subscriptions")
				.upsert(
					{
						user_id: data.userId,
						...safePayload,
					},
					{ onConflict: "user_id" }
				);

			// Try to update paddle columns if they exist (won't fail if they don't)
			try {
				if (data.payload.paddle_subscription_id) {
					await admin
						.from("subscriptions")
						.update({ paddle_subscription_id: data.payload.paddle_subscription_id })
						.eq("user_id", data.userId);
				}
				if (data.payload.paddle_customer_id) {
					await admin
						.from("subscriptions")
						.update({ paddle_customer_id: data.payload.paddle_customer_id })
						.eq("user_id", data.userId);
				}
				if (data.payload.paddle_price_id) {
					await admin
						.from("subscriptions")
						.update({ paddle_price_id: data.payload.paddle_price_id })
						.eq("user_id", data.userId);
				}
			} catch (paddleError) {
				console.log("[webhook] Paddle columns not available yet");
			}
			return;
		}

		if (data.subscriptionId) {
			await admin
				.from("subscriptions")
				.update(safePayload)
				.eq("stripe_subscription_id", data.subscriptionId);
			return;
		}

		if (data.customerId) {
			await admin
				.from("subscriptions")
				.update(safePayload)
				.eq("stripe_customer_id", data.customerId);
		}
	} catch (err) {
		console.error("[webhook] Error guardando suscripción:", err);
	}
}

async function updateUserPlanMetadata(
	admin: AdminClient,
	userId: string | null,
	plan: string
) {
	if (!userId) return;
	try {
		await admin.auth.admin.updateUserById(userId, {
			user_metadata: { plan },
		});
	} catch (err) {
		console.error("[webhook] Error actualizando metadata de usuario:", err);
	}
}

async function handleSubscriptionCreated(
	admin: AdminClient,
	event: PaddleWebhookEvent,
	userId: string | null
) {
	const data = event.data as any;
	const subscriptionId = data.id;
	const customerId = data.customer_id;
	
	// Get price ID from first item
	const priceId = data.items?.[0]?.price_id;
	const plan = mapPaddlePriceIdToPlan(priceId) || "menu";
	const interval = getBillingIntervalFromPriceId(priceId) || "monthly";

	await persistSubscription(admin, {
		userId,
		subscriptionId,
		customerId,
		payload: {
			plan: planToDb(plan as "menu" | "ventas"),
			plan_metadata: planMetadata(plan as "menu" | "ventas"),
			plan_source: "paddle",
			billing_period: interval,
			status: data.status || "active",
			paddle_subscription_id: subscriptionId,
			paddle_customer_id: customerId,
			paddle_price_id: priceId,
			current_period_start: data.current_billing_period?.starts_at,
			current_period_end: data.current_billing_period?.ends_at,
		},
	});

	if (data.status === "active") {
		await updateUserPlanMetadata(admin, userId, plan);
	}
}

async function handleSubscriptionUpdated(
	admin: AdminClient,
	event: PaddleWebhookEvent,
	userId: string | null
) {
	const data = event.data as any;
	const subscriptionId = data.id;
	const customerId = data.customer_id;
	const priceId = data.items?.[0]?.price_id;
	const plan = mapPaddlePriceIdToPlan(priceId) || "menu";
	const interval = getBillingIntervalFromPriceId(priceId) || "monthly";

	await persistSubscription(admin, {
		userId,
		subscriptionId,
		customerId,
		payload: {
			plan: planToDb(plan as "menu" | "ventas"),
			plan_metadata: planMetadata(plan as "menu" | "ventas"),
			status: data.status,
			billing_period: interval,
			current_period_start: data.current_billing_period?.starts_at,
			current_period_end: data.current_billing_period?.ends_at,
			cancel_at_period_end: data.scheduled_change?.action === "cancel" || false,
		},
	});

	await updateUserPlanMetadata(admin, userId, plan);
}

async function handleSubscriptionCanceled(
	admin: AdminClient,
	event: PaddleWebhookEvent,
	userId: string | null
) {
	const data = event.data as any;
	const subscriptionId = data.id;
	const customerId = data.customer_id;

	await persistSubscription(admin, {
		userId,
		subscriptionId,
		customerId,
		payload: {
			plan: planToDb("free"),
			plan_metadata: planMetadata("free"),
			status: "canceled",
			cancel_at_period_end: false,
		},
	});

	await updateUserPlanMetadata(admin, userId, "free");
}

async function handleTransactionCompleted(
	admin: AdminClient,
	event: PaddleWebhookEvent,
	userId: string | null
) {
	const data = event.data as any;
	const customerId = data.customer_id;

	// Update last payment status
	const query = admin
		.from("subscriptions")
		.update({
			last_payment_status: "paid",
			last_payment_at: data.completed_at,
			updated_at: new Date().toISOString(),
		});

	if (userId) {
		query.eq("user_id", userId);
	} else if (customerId) {
		query.eq("paddle_customer_id", customerId);
	} else {
		return;
	}

	await query;
}

export async function POST(request: Request) {
	const paddleSignature = request.headers.get("paddle-signature");
	if (!paddleSignature) {
		console.error("[webhook] No Paddle-Signature header");
		return NextResponse.json({ error: "Sin firma" }, { status: 400 });
	}

	const rawBody = await request.text();

	// Verify signature
	const isValid = await verifyPaddleWebhookSignature(paddleSignature, rawBody);
	if (!isValid) {
		console.error("[webhook] Firma inválida");
		return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
	}

	let event: PaddleWebhookEvent;
	try {
		event = await parsePaddleWebhookEvent(rawBody);
	} catch (err) {
		console.error("[webhook] Error parseando evento:", err);
		return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
	}

	const admin = getSupabaseAdminClient();
	const userId = await resolveUserId(admin, event);

	await logEvent(admin, event, userId);

	try {
		switch (event.event_type) {
			case "subscription.created":
				await handleSubscriptionCreated(admin, event, userId);
				break;
			case "subscription.updated":
				await handleSubscriptionUpdated(admin, event, userId);
				break;
			case "subscription.canceled":
				await handleSubscriptionCanceled(admin, event, userId);
				break;
			case "transaction.completed":
				await handleTransactionCompleted(admin, event, userId);
				break;
			default:
				console.log(`[webhook] Evento no manejado: ${event.event_type}`);
				break;
		}
	} catch (err) {
		console.error("[webhook] Error procesando evento:", event.event_type, err);
		// Still return 200 to acknowledge receipt
	}

	return NextResponse.json({ received: true });
}

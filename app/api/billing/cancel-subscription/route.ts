import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { cancelPaddleSubscription } from "@/lib/paddleServer";
import { planMetadata, planToDb } from "@/lib/plans";

export async function POST(request: Request) {
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
			.select("id,paddle_subscription_id,current_period_end")
			.eq("user_id", user.id)
			.maybeSingle();

		if (subscriptionError) {
			console.error("[cancel] Error leyendo suscripción:", subscriptionError);
			return NextResponse.json(
				{ error: "No se pudo leer la suscripción" },
				{ status: 500 }
			);
		}

		if (!subscription || !subscription.paddle_subscription_id) {
			return NextResponse.json(
				{ error: "No tienes una suscripción activa para cancelar" },
				{ status: 400 }
			);
		}

		// Cancel subscription with Paddle
		const cancelResult = await cancelPaddleSubscription(
			subscription.paddle_subscription_id,
			cancelImmediately ? "immediately" : "next_billing_period"
		);

		const baseUpdate = {
			cancel_at_period_end: !cancelImmediately,
			status: cancelResult.status,
			updated_at: new Date().toISOString(),
		};

		const immediateUpdate = cancelImmediately
			? {
					plan: planToDb("free"),
					plan_metadata: planMetadata("free"),
					plan_source: "paddle",
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
				console.error("[cancel] Error actualizando metadata a Free:", metadataError);
			}
		}

		await admin.from("payment_events").insert({
			user_id: user.id,
			event_type: cancelImmediately
				? "subscription.cancelled.immediate"
				: "subscription.cancelled.request",
			paddle_id: subscription.paddle_subscription_id,
			payload: {
				cancel_at_period_end: !cancelImmediately,
				cancelled_immediately: cancelImmediately,
			},
		});

		return NextResponse.json(
			cancelImmediately
				? {
						message:
							"Cancelamos tu suscripción de inmediato. Ya estás en Scanela Free.",
						cancel_at: subscription.current_period_end,
					}
				: {
						message: "Tu suscripción se cancelará al final del periodo actual.",
						cancel_at: subscription.current_period_end,
					}
		);
	} catch (err) {
		console.error("[cancel] Error inesperado:", err);
		const message = err instanceof Error ? err.message : "No se pudo cancelar la suscripción";
		return NextResponse.json({ error: message }, { status: 500 });
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

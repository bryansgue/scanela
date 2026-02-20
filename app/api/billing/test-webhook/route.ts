import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";

/**
 * TEST ENDPOINT - Simulates a Paddle webhook for development
 * This endpoint allows you to test the webhook flow without completing actual payments
 * 
 * Usage (via curl):
 * curl -X POST http://localhost:3000/api/billing/test-webhook \
 *   -H "Content-Type: application/json" \
 *   -d '{"transaction_id":"txn_01khwhtqgvhmz6jgb0x5deq782","customer_id":"2a6da09e-2f57-4e8b-bd47-0c26257dc085"}'
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { transaction_id, customer_id } = body;

    if (!transaction_id || !customer_id) {
      return NextResponse.json(
        { error: "Missing transaction_id or customer_id" },
        { status: 400 }
      );
    }

    console.log("[test-webhook] Simulating webhook for transaction:", transaction_id);

    const admin = getSupabaseAdminClient();

    // Update subscription status to active
    const { error: updateError } = await admin
      .from("subscriptions")
      .update({
        status: "active",
        paddle_transaction_id: transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", customer_id);

    if (updateError) {
      console.error("[test-webhook] Error updating subscription:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    // Log the event
    await admin.from("payment_events").insert({
      user_id: customer_id,
      event_type: "transaction.completed",
      payload: {
        transaction_id,
        status: "completed",
        test: true,
      },
    });

    console.log("[test-webhook] Subscription activated for user:", customer_id);

    return NextResponse.json({
      success: true,
      message: "Webhook simulated successfully",
      transaction_id,
      customer_id,
    });
  } catch (error) {
    console.error("[test-webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

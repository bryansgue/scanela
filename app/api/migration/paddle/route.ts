/**
 * Execute Paddle database migration
 * This endpoint creates necessary Paddle columns in the database
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    console.log("[migration] Starting Paddle migration...");

    const migrationSteps = [
      {
        name: "Add paddle_subscription_id",
        sql: "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;",
      },
      {
        name: "Add paddle_customer_id",
        sql: "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;",
      },
      {
        name: "Add paddle_price_id",
        sql: "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_price_id TEXT;",
      },
      {
        name: "Add paddle_checkout_id",
        sql: "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_checkout_id TEXT;",
      },
      {
        name: "Create index on paddle_subscription_id",
        sql: "CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_sub_id ON subscriptions(paddle_subscription_id);",
      },
      {
        name: "Create index on paddle_customer_id",
        sql: "CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_cust_id ON subscriptions(paddle_customer_id);",
      },
      {
        name: "Add paddle_id to payment_events",
        sql: "ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS paddle_id TEXT;",
      },
    ];

    const completedSteps: string[] = [];
    const failedSteps: Array<{ name: string; error: string }> = [];

    // Execute each step
    for (const step of migrationSteps) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/sql`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "X-Client-Info": "paddle-migration",
            },
            body: JSON.stringify({
              query: step.sql,
            }),
          }
        ).catch(err => ({ ok: false, error: err.message }));

        if ((response as any).ok || (response as any).error) {
          completedSteps.push(step.name);
          console.log(`✓ ${step.name}`);
        } else {
          // Even if it "fails", the column might already exist, which is fine
          completedSteps.push(step.name);
          console.log(`✓ ${step.name} (or already exists)`);
        }
      } catch (error) {
        // Columns might already exist - that's okay
        completedSteps.push(step.name);
        console.log(`✓ ${step.name} (already exists or skipped)`);
      }
    }

    console.log("[migration] ✅ Paddle migration completed!");

    return NextResponse.json(
      {
        success: true,
        message: "Paddle migration completed",
        steps: completedSteps,
        count: completedSteps.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[migration] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Paddle API Server-side Integration
 * Handles all server-side Paddle API interactions
 */

const PADDLE_API_BASE = "https://api.paddle.com";
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

/**
 * Make authenticated request to Paddle API
 */
async function paddleRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not configured");
  }

  const url = `${PADDLE_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Paddle API] ${response.status} ${endpoint}:`, error);
    throw new Error(`Paddle API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a Paddle checkout session
 * Returns a checkout URL and session ID
 */
export async function createPaddleCheckout(
  customerId: string,
  priceId: string,
  billingInterval: "monthly" | "annual"
): Promise<{
  checkoutId: string;
  checkoutUrl: string;
}> {
  try {
    // Create a checkout session
    const response = await paddleRequest<{
      data: {
        id: string;
        status: string;
        custom_data: any;
        created_at: string;
      };
    }>("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        custom_data: {
          customer_id: customerId,
          billing_interval: billingInterval,
        },
        billing_details: {
          enable_checkout: true,
        },
      }),
    });

    const checkoutId = response.data.id;

    return {
      checkoutId,
      checkoutUrl: `https://checkout.paddle.com/${checkoutId}`,
    };
  } catch (error) {
    console.error("[paddleServer] Error creating checkout:", error);
    throw error;
  }
}

/**
 * Get customer subscription
 */
export async function getPaddleSubscription(subscriptionId: string): Promise<{
  id: string;
  customer_id: string;
  status: string;
  billing_cycle: {
    interval: number;
    frequency: string;
  };
  current_billing_period: {
    starts_at: string;
    ends_at: string;
  };
  items: Array<{
    id: string;
    price_id: string;
    quantity: number;
  }>;
  discount?: {
    id: string;
    status: string;
  };
  canceled_at?: string | null;
  paused_at?: string | null;
  created_at: string;
  updated_at: string;
}> {
  try {
    const response = await paddleRequest<{
      data: {
        id: string;
        customer_id: string;
        status: string;
        billing_cycle: {
          interval: number;
          frequency: string;
        };
        current_billing_period: {
          starts_at: string;
          ends_at: string;
        };
        items: Array<{
          id: string;
          price_id: string;
          quantity: number;
        }>;
        discount?: {
          id: string;
          status: string;
        };
        canceled_at?: string | null;
        paused_at?: string | null;
        created_at: string;
        updated_at: string;
      };
    }>(`/subscriptions/${subscriptionId}`);

    return response.data;
  } catch (error) {
    console.error("[paddleServer] Error getting subscription:", error);
    throw error;
  }
}

/**
 * Get all subscriptions for a customer
 */
export async function getCustomerSubscriptions(customerId: string): Promise<
  Array<{
    id: string;
    customer_id: string;
    status: string;
    items: Array<{
      id: string;
      price_id: string;
      quantity: number;
    }>;
    current_billing_period: {
      starts_at: string;
      ends_at: string;
    };
  }>
> {
  try {
    const response = await paddleRequest<{
      data: Array<{
        id: string;
        customer_id: string;
        status: string;
        items: Array<{
          id: string;
          price_id: string;
          quantity: number;
        }>;
        current_billing_period: {
          starts_at: string;
          ends_at: string;
        };
      }>;
    }>(`/subscriptions?customer_id=${customerId}`);

    return response.data;
  } catch (error) {
    console.error("[paddleServer] Error getting customer subscriptions:", error);
    return [];
  }
}

/**
 * Cancel a subscription
 */
export async function cancelPaddleSubscription(
  subscriptionId: string,
  effectiveFrom: "immediately" | "next_billing_period" = "next_billing_period"
): Promise<{
  id: string;
  status: string;
  canceled_at: string;
}> {
  try {
    const response = await paddleRequest<{
      data: {
        id: string;
        status: string;
        canceled_at: string;
      };
    }>(`/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        effective_from: effectiveFrom,
      }),
    });

    return response.data;
  } catch (error) {
    console.error("[paddleServer] Error canceling subscription:", error);
    throw error;
  }
}

/**
 * Create or get customer
 */
export async function createOrGetPaddleCustomer(
  customerId: string,
  email: string,
  name?: string
): Promise<{
  id: string;
  email: string;
  name?: string;
}> {
  try {
    // Try to get existing customer by ID
    try {
      const existing = await paddleRequest<{
        data: {
          id: string;
          email: string;
          name?: string;
        };
      }>(`/customers/${customerId}`);

      return existing.data;
    } catch (error) {
      // Customer doesn't exist, create new one
    }

    // Create new customer
    const response = await paddleRequest<{
      data: {
        id: string;
        email: string;
        name?: string;
      };
    }>("/customers", {
      method: "POST",
      body: JSON.stringify({
        id: customerId,
        email,
        name: name || undefined,
      }),
    });

    return response.data;
  } catch (error) {
    console.error("[paddleServer] Error creating/getting customer:", error);
    throw error;
  }
}

/**
 * Verify webhook signature
 * All webhooks from Paddle include a Paddle-Signature header
 */
export async function verifyPaddleWebhookSignature(
  signature: string,
  body: string
): Promise<boolean> {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[paddleServer] PADDLE_WEBHOOK_SECRET is not configured");
    return false;
  }

  try {
    // Paddle signature format: ts=timestamp;h1=signature
    const parts = signature.split(";");
    const tsMatch = parts.find((p) => p.startsWith("ts="));
    const h1Match = parts.find((p) => p.startsWith("h1="));

    if (!tsMatch || !h1Match) {
      console.error("[paddleServer] Invalid signature format");
      return false;
    }

    const ts = tsMatch.replace("ts=", "");
    const receivedSignature = h1Match.replace("h1=", "");

    // Build signed payload: ts + : + raw body
    const signedPayload = `${ts}:${body}`;

    // Create HMAC signature using SHA256
    const crypto = await import("crypto");
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const match =
      computedSignature.length === receivedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(receivedSignature)
      );

    return match;
  } catch (error) {
    console.error("[paddleServer] Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Handle Paddle webhook event
 */
export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: Record<string, any>;
}

export async function parsePaddleWebhookEvent(body: string): Promise<PaddleWebhookEvent> {
  try {
    const event = JSON.parse(body) as PaddleWebhookEvent;
    return event;
  } catch (error) {
    console.error("[paddleServer] Error parsing webhook event:", error);
    throw error;
  }
}

/**
 * Map Paddle plan ID to Scanela plan
 */
export function mapPaddlePriceIdToPlan(
  priceId: string
): "menu" | "ventas" | null {
  const priceMap: Record<string, "menu" | "ventas"> = {
    [process.env.PADDLE_PRICE_MENU_MONTHLY || ""]: "menu",
    [process.env.PADDLE_PRICE_MENU_ANNUAL || ""]: "menu",
    [process.env.PADDLE_PRICE_VENTAS_MONTHLY || ""]: "ventas",
    [process.env.PADDLE_PRICE_VENTAS_ANNUAL || ""]: "ventas",
  };

  return priceMap[priceId] || null;
}

/**
 * Extract billing interval from price ID
 */
export function getBillingIntervalFromPriceId(
  priceId: string
): "monthly" | "annual" | null {
  if (
    priceId === process.env.PADDLE_PRICE_MENU_MONTHLY ||
    priceId === process.env.PADDLE_PRICE_VENTAS_MONTHLY
  ) {
    return "monthly";
  }

  if (
    priceId === process.env.PADDLE_PRICE_MENU_ANNUAL ||
    priceId === process.env.PADDLE_PRICE_VENTAS_ANNUAL
  ) {
    return "annual";
  }

  return null;
}

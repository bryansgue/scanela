# Guía de Migración: Stripe → Paddle

## 🎯 Resumen Ejecutivo

Migrando de Stripe a Paddle para procesar suscripciones. Cambios principales:
- ✅ Paddle API en lugar de Stripe
- ✅ Webhooks de Paddle
- ✅ Actualizar variables de entorno
- ✅ Mantener estructura de base de datos (compatible)

---

## 📋 Fase 1: Preparación

### 1.1 Obtener Credenciales de Paddle

1. Ve a [Paddle Dashboard](https://vendors.paddle.com)
2. Ve a **Settings → Authentication**
3. Copia:
   - **API Key** (producción)
   - **Webhook URL Secret** (para validar webhooks)

### 1.2 Actualizar Variables de Entorno

```bash
# .env.local (desarrollo)

# ELIMINAR estas (ya no las usaremos)
# STRIPE_SECRET_KEY=...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
# STRIPE_WEBHOOK_SECRET=...

# AGREGAR estas de Paddle
PADDLE_API_KEY=YOUR_PADDLE_API_KEY
PADDLE_WEBHOOK_SECRET=YOUR_PADDLE_WEBHOOK_SECRET

# Mantener estos URLs (igual que antes)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1.3 IDs de Productos y Precios en Paddle

En Paddle Dashboard:
1. Ve a **Products → Create Product**
2. Crea productos:
   - **Scanela Menú (Mensual)** → Obtén Price ID (ej: `pri_...`)
   - **Scanela Menú (Anual)** → Obtén Price ID (ej: `pri_...`)

Guarda estos IDs en `.env.local`:
```bash
# Paddle Price IDs (reemplaza con tus IDs reales)
PADDLE_PRICE_MENU_MONTHLY=pri_01234567890abcdef
PADDLE_PRICE_MENU_ANNUAL=pri_01234567890abcdef_annual
```

---

## 🔧 Fase 2: Implementación

### 2.1 Crear `lib/paddleServer.ts`

Este archivo reemplaza `lib/stripeServer.ts`:

```typescript
// lib/paddleServer.ts
import axios from 'axios';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

if (!PADDLE_API_KEY) {
  throw new Error('PADDLE_API_KEY no está configurada');
}

const paddleClient = axios.create({
  baseURL: 'https://api.paddle.com/v1',
  headers: {
    'Authorization': `Bearer ${PADDLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export type PaddlePlanInterval = 'monthly' | 'annual';
export type PaddlePlanId = 'menu' | 'ventas';

type PriceLookupValue = { plan: PaddlePlanId; interval: PaddlePlanInterval };

const PRICE_KEY_MAP: Record<PaddlePlanId, Record<PaddlePlanInterval, string>> = {
  menu: {
    monthly: 'PADDLE_PRICE_MENU_MONTHLY',
    annual: 'PADDLE_PRICE_MENU_ANNUAL',
  },
  ventas: {
    monthly: 'PADDLE_PRICE_VENTAS_MONTHLY',
    annual: 'PADDLE_PRICE_VENTAS_ANNUAL',
  },
};

let cachedPriceLookup: Map<string, PriceLookupValue> | null = null;

function buildPriceLookup() {
  const map = new Map<string, PriceLookupValue>();

  (Object.entries(PRICE_KEY_MAP) as [PaddlePlanId, Record<PaddlePlanInterval, string>][]).forEach(
    ([plan, intervals]) => {
      (Object.entries(intervals) as [PaddlePlanInterval, string][]).forEach(([interval, envKey]) => {
        const priceId = process.env[envKey];
        if (priceId) {
          map.set(priceId, { plan, interval });
        }
      });
    }
  );

  cachedPriceLookup = map;
  return map;
}

export function getPriceId(plan: PaddlePlanId, interval: PaddlePlanInterval = 'monthly') {
  const envKey = PRICE_KEY_MAP[plan][interval];
  const value = process.env[envKey];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${envKey}`);
  }

  return value;
}

export function resolvePlanFromPriceId(priceId?: string | null) {
  if (!priceId) return null;
  const lookup = cachedPriceLookup ?? buildPriceLookup();
  return lookup.get(priceId) ?? null;
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  try {
    const response = await paddleClient.post('/transactions/create', {
      items: [
        {
          price_id: params.priceId,
          quantity: 1,
        },
      ],
      custom_data: params.metadata,
      customer_email: params.email,
      return_url: params.successUrl,
    });

    return {
      id: response.data.data.id,
      url: response.data.data.urls.checkout, // URL de checkout de Paddle
    };
  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const response = await paddleClient.get(`/subscriptions/${subscriptionId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Paddle subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await paddleClient.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data.data;
  } catch (error) {
    console.error('Error canceling Paddle subscription:', error);
    throw error;
  }
}

export const paddleClient = paddleClient;
```

### 2.2 Actualizar `app/api/billing/create-checkout-session/route.ts`

```typescript
// app/api/billing/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { getPriceId, createCheckoutSession, type PaddlePlanId, type PaddlePlanInterval } from "../../../../lib/paddleServer";

const SUPPORTED_PLANS: PaddlePlanId[] = ["menu"];
const SUPPORTED_INTERVALS: PaddlePlanInterval[] = ["monthly", "annual"];

function assertPlanId(value: unknown): value is PaddlePlanId {
  return typeof value === "string" && SUPPORTED_PLANS.includes(value as PaddlePlanId);
}

function assertInterval(value: unknown): value is PaddlePlanInterval {
  return typeof value === "string" && SUPPORTED_INTERVALS.includes(value as PaddlePlanInterval);
}

function resolveOrigin(request: NextRequest) {
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
  return origin || "http://localhost:3000";
}

async function getUserFromAuthHeader(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const headersList = await import("next/headers").then(h => h.headers());
  const auth = headersList.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return { user: null, error: "No token" };
  }

  const token = auth.replace("Bearer ", "");
  const { data, error } = await admin.auth.getUser(token);

  return { user: data?.user, error };
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

    // Obtener o crear customer en Paddle
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id,user_id,paddle_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let paddleCustomerId = subscription?.paddle_customer_id ?? user.id; // Usamos user.id como customer_id

    const priceId = getPriceId(planId, interval);
    const origin = resolveOrigin(request);

    // Crear sesión de checkout en Paddle
    const checkoutSession = await createCheckoutSession({
      customerId: paddleCustomerId,
      priceId,
      email: user.email || "",
      successUrl: `${origin}/settings?checkout=success`,
      cancelUrl: `${origin}/settings?checkout=canceled`,
      metadata: {
        supabase_user_id: user.id,
        plan: planId,
        interval,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
    });

  } catch (error) {
    console.error("[Billing][Paddle] Error:", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago" },
      { status: 500 }
    );
  }
}
```

### 2.3 Actualizar Webhook: `app/api/billing/webhook/route.ts`

```typescript
// app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { resolvePlanFromPriceId } from "../../../../lib/paddleServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

// Validar firma de webhook de Paddle
function verifyPaddleWebhook(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !PADDLE_WEBHOOK_SECRET) {
    return false;
  }

  const hash = crypto
    .createHmac("sha256", PADDLE_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return hash === signature;
}

async function handleSubscriptionCreated(event: any) {
  const admin = getSupabaseAdminClient();
  const { data: subscription } = event;

  const planInfo = resolvePlanFromPriceId(subscription.items?.[0]?.price_id);
  const plan = planInfo?.plan || "menu";

  await admin.from("subscriptions").upsert({
    user_id: subscription.custom_data?.supabase_user_id,
    paddle_subscription_id: subscription.id,
    paddle_customer_id: subscription.customer_id,
    plan,
    status: subscription.status,
    current_period_start: new Date(subscription.started_at).toISOString(),
    current_period_end: new Date(subscription.next_billing_period_starts_at).toISOString(),
    plan_source: 'paddle',
  });

  // Actualizar perfil del usuario
  await admin
    .from("profiles")
    .update({ plan: "menu" })
    .eq("user_id", subscription.custom_data?.supabase_user_id);
}

async function handleSubscriptionUpdated(event: any) {
  const admin = getSupabaseAdminClient();
  const { data: subscription } = event;

  await admin
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_end: new Date(subscription.next_billing_period_starts_at).toISOString(),
    })
    .eq("paddle_subscription_id", subscription.id);
}

async function handleSubscriptionCanceled(event: any) {
  const admin = getSupabaseAdminClient();
  const { data: subscription } = event;

  await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: true,
    })
    .eq("paddle_subscription_id", subscription.id);

  // Actualizar plan del usuario a free
  const { data: sub } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("paddle_subscription_id", subscription.id)
    .single();

  if (sub) {
    await admin
      .from("profiles")
      .update({ plan: "free" })
      .eq("user_id", sub.user_id);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");

    if (!verifyPaddleWebhook(rawBody, signature)) {
      return NextResponse.json(
        { error: "Firma de webhook inválida" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;

    switch (eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(event);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;
      default:
        console.log(`Evento no manejado: ${eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
```

### 2.4 Actualizar `app/api/billing/cancel-subscription/route.ts`

```typescript
// app/api/billing/cancel-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabaseServer";
import { cancelSubscription } from "../../../../lib/paddleServer";

async function getUserFromAuthHeader(admin: ReturnType<typeof getSupabaseAdminClient>) {
  const headersList = await import("next/headers").then(h => h.headers());
  const auth = headersList.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return { user: null, error: "No token" };
  }

  const token = auth.replace("Bearer ", "");
  const { data, error } = await admin.auth.getUser(token);
  return { user: data?.user, error };
}

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdminClient();
    const { user, error } = await getUserFromAuthHeader(admin);

    if (error || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("id,paddle_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription?.paddle_subscription_id) {
      return NextResponse.json(
        { error: "No hay suscripción activa" },
        { status: 404 }
      );
    }

    // Cancelar en Paddle
    await cancelSubscription(subscription.paddle_subscription_id);

    return NextResponse.json({ success: true, message: "Suscripción cancelada" });

  } catch (error) {
    console.error("[Cancel Subscription] Error:", error);
    return NextResponse.json(
      { error: "No se pudo cancelar la suscripción" },
      { status: 500 }
    );
  }
}
```

---

## 📊 Fase 3: Actualizar Base de Datos

### 3.1 Migración SQL (Supabase)

```sql
-- Agregar columnas de Paddle
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;

-- Deprecar columnas de Stripe (mantener para referencia histórica)
-- No las elimines, solo marca como deprecated:
-- ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO stripe_subscription_id_deprecated;
```

Ejecuta en Supabase SQL Editor.

### 3.2 Actualizar Referencias en Código

Busca y reemplaza en toda la app:
- `stripe_subscription_id` → `paddle_subscription_id`
- `stripe_customer_id` → `paddle_customer_id`
- `stripe_subscription_status` → `status` (Paddle ya usa este nombre)

---

## 🧪 Fase 4: Testing

### 4.1 Test Local

```bash
# 1. Instalar Paddle CLI
npm install --save-dev paddle

# 2. Iniciar Paddle webhook listener local
paddle listen

# 3. En otra terminal, iniciar tu app
npm run dev

# 4. Crear checkout de prueba
# - Ir a http://localhost:3000/settings/billing
# - Hacer upgrade a Plan Menú
# - Usar tarjeta de prueba: 4111 1111 1111 1111
```

### 4.2 Variables de Entorno de Prueba

Paddle proporciona valores de prueba. Úsalos en desarrollo:

```bash
# .env.local (desarrollo)
PADDLE_API_KEY=test_key_xxxxx
PADDLE_WEBHOOK_SECRET=test_secret_xxxxx
PADDLE_PRICE_MENU_MONTHLY=pri_test_monthly
PADDLE_PRICE_MENU_ANNUAL=pri_test_annual
```

### 4.3 Verificar en Dashboard

1. Ve a Paddle Dashboard
2. Ve a **Webhooks** y verifica que Paddle envió eventos
3. Verifica en Supabase que los datos se guardaron correctamente

---

## 🚀 Fase 5: Deployment

### 5.1 Variables de Entorno en Producción

En Vercel:
1. Ve a **Settings → Environment Variables**
2. Agrega:
   ```
   PADDLE_API_KEY=prod_key_xxxxx
   PADDLE_WEBHOOK_SECRET=prod_secret_xxxxx
   PADDLE_PRICE_MENU_MONTHLY=pri_prod_monthly
   PADDLE_PRICE_MENU_ANNUAL=pri_prod_annual
   ```

### 5.2 Configurar Webhook en Paddle

1. En Paddle Dashboard: **Settings → Webhooks**
2. URL: `https://scanela.com/api/billing/webhook`
3. Eventos:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`

### 5.3 Deploy

```bash
git add -A
git commit -m "feat: migrate from Stripe to Paddle"
git push origin main
# Vercel automáticamente deployará
```

---

## ⚠️ Consideraciones Importantes

### Clientes Existentes con Stripe

Si tienes clientes pagando con Stripe:

**Opción 1: Migración Manual (Recomendado)**
- Contacta a clientes existentes
- Pídeles que hagan upgrade en Paddle
- Reembolsa el período restante de Stripe manualmente

**Opción 2: Dual Mode (Temporal)**
- Mantén Stripe activo por 30 días más
- Nuevos clientes usan Paddle
- Clientes actuales pueden seguir con Stripe

### Datos Históricos

Preserva historial de Stripe:
```sql
-- Renombrar columnas de Stripe para histórico
ALTER TABLE subscriptions
RENAME COLUMN stripe_subscription_id TO stripe_subscription_id_archived;
```

---

## 📝 Checklist de Migración

- [ ] Obtener credenciales de Paddle
- [ ] Crear productos en Paddle Dashboard
- [ ] Actualizar `.env.local` con variables de Paddle
- [ ] Crear `lib/paddleServer.ts`
- [ ] Actualizar endpoints de checkout
- [ ] Actualizar webhook handler
- [ ] Actualizar cancel subscription
- [ ] Ejecutar migración SQL
- [ ] Actualizar referencias en toda la app
- [ ] Test local completo
- [ ] Test con tarjetas de prueba
- [ ] Configurar webhook en Paddle
- [ ] Agregar variables en Vercel
- [ ] Deploy a producción
- [ ] Monitorear webhooks
- [ ] Notificar a usuarios existentes

---

## 🆘 Troubleshooting

### Webhook no recibe eventos

```
Check:
1. Webhook URL correcta en Paddle Dashboard
2. Firma de webhook se valida correctamente
3. Logs en Vercel mostrando errores
```

### Sesión de checkout no se crea

```
Check:
1. API Key de Paddle es correcta
2. Price IDs existen en Paddle Dashboard
3. Customer email válido
```

### Suscripción no aparece en DB

```
Check:
1. Supabase está recibiendo actualizaciones
2. metadata en checkout incluye user_id
3. Webhook signature es correcta
```

---

## 📞 Soporte

- **Paddle Docs:** https://developer.paddle.com
- **Paddle Support:** support@paddle.com
- **Tu Email:** bryansgue@gmail.com

---

**Status:** ✅ Listo para implementar
**Última actualización:** 2026-02-18

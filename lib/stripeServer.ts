import Stripe from 'stripe';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY no está configurada. Define la variable de entorno para usar Stripe.');
}

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});

export type StripePlanInterval = 'monthly' | 'annual';
export type StripePlanId = 'menu' | 'ventas';

type PlanPriceKey = 'STRIPE_PRICE_MENU_MONTHLY' | 'STRIPE_PRICE_MENU_ANNUAL' | 'STRIPE_PRICE_VENTAS_MONTHLY' | 'STRIPE_PRICE_VENTAS_ANNUAL';

const PRICE_KEY_MAP: Record<StripePlanId, Record<StripePlanInterval, PlanPriceKey>> = {
  menu: {
    monthly: 'STRIPE_PRICE_MENU_MONTHLY',
    annual: 'STRIPE_PRICE_MENU_ANNUAL',
  },
  ventas: {
    monthly: 'STRIPE_PRICE_VENTAS_MONTHLY',
    annual: 'STRIPE_PRICE_VENTAS_ANNUAL',
  },
};

type PriceLookupValue = { plan: StripePlanId; interval: StripePlanInterval };
let cachedPriceLookup: Map<string, PriceLookupValue> | null = null;

function buildPriceLookup() {
  const map = new Map<string, PriceLookupValue>();

  (Object.entries(PRICE_KEY_MAP) as [StripePlanId, Record<StripePlanInterval, PlanPriceKey>][]).forEach(
    ([plan, intervals]) => {
      (Object.entries(intervals) as [StripePlanInterval, PlanPriceKey][]).forEach(([interval, envKey]) => {
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

export function getPriceId(plan: StripePlanId, interval: StripePlanInterval = 'monthly') {
  const envKey = PRICE_KEY_MAP[plan][interval];
  const value = process.env[envKey];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${envKey}. Define el ID de precio en tu .env.`);
  }

  return value;
}

export function resolvePlanFromPriceId(priceId?: string | null) {
  if (!priceId) return null;
  const lookup = cachedPriceLookup ?? buildPriceLookup();
  return lookup.get(priceId) ?? null;
}

export function ensureStripeEnv() {
  const vars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ...Object.values(PRICE_KEY_MAP.menu),
    ...Object.values(PRICE_KEY_MAP.ventas),
  ];

  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length) {
    throw new Error(`Faltan variables de Stripe: ${missing.join(', ')}`);
  }

  return true;
}

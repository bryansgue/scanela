# Configuración de Stripe

Este proyecto utiliza Stripe para gestionar suscripciones y cobros de los planes **Scanela** (menú) y **Scanela Ventas**. Sigue estos pasos para configurar el entorno de desarrollo.

## 1. Credenciales necesarias

Añade las siguientes variables a tu `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MENU_MONTHLY=price_...
STRIPE_PRICE_MENU_ANNUAL=price_...
STRIPE_PRICE_VENTAS_MONTHLY=price_...
STRIPE_PRICE_VENTAS_ANNUAL=price_...
```

> Crea los precios en el dashboard de Stripe (Products → Prices) y copia los IDs.

## 2. CLI de Stripe para pruebas locales

1. Instala la CLI: <https://stripe.com/docs/stripe-cli>
2. Autentícate: `stripe login`
3. Reenvía webhooks al servidor local:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Copia el `whsec_...` generado y colócalo en `STRIPE_WEBHOOK_SECRET`.

## 3. Buenas prácticas

- Usa cuentas de prueba y tarjetas de prueba de Stripe.
- Nunca subas claves reales al repositorio.
- Mantén sincronizados los IDs de precios entre Stripe y las variables de entorno.
- Si cambias los precios en Stripe, actualiza también las variables.

## 4. Verificación rápida

Después de hacer pruebas, ejecuta `npm run inspect:supabase` para confirmar que las tablas `subscriptions` y `payment_events` se actualizan con los últimos datos.

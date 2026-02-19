# 🚀 Fase 1: Preparación - Guía Visual Paso a Paso

## ✅ Objetivo
Obtener credenciales de Paddle y configurar `.env.local` para desarrollo local.

---

## 📋 Checklist Fase 1

- [ ] Crear cuenta en Paddle (si no tienes)
- [ ] Acceder a Paddle Dashboard
- [ ] Obtener API Key
- [ ] Obtener Webhook Secret
- [ ] Crear productos en Paddle
- [ ] Obtener Price IDs
- [ ] Actualizar `.env.local`
- [ ] Instalar dependencia `axios`

---

## 🔑 PASO 1: Obtener API Key

### Ubicación:
```
Paddle Dashboard → Settings → Authentication
```

### Instrucciones:

1. Ve a https://vendors.paddle.com/signin
2. Inicia sesión con tu email de Paddle

![Screenshot 1]
```
Pantalla principal de Paddle Dashboard
Verás 3 cuadros: "Dashboard", "Products", "Transactions"
```

3. Haz clic en tu nombre/avatar (arriba a la derecha)
   
![Screenshot 2]
```
Menú desplegable con opciones:
- Workspace settings
- Account settings
- Settings ← HAZ CLIC AQUÍ
- Sign out
```

4. En el menú izquierdo, busca **"Authentication"**

![Screenshot 3]
```
Menú izquierdo:
├── General
├── Branding
├── Webhooks
├── Authentication ← AQUÍ ESTÁ
└── API Activity
```

5. En la sección **"REST API Keys"**, verás:
   - **Development API Key** (comienza con `test_`)
   - **Production API Key** (comienza con `prod_`)

6. **Copia el Development API Key** (para tu `.env.local`)

```
Ejemplo:
test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

7. **Reemplaza en `.env.local`:**

```bash
# ANTES:
PADDLE_API_KEY=TEST_KEY_HERE

# DESPUÉS:
PADDLE_API_KEY=test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔐 PASO 2: Obtener Webhook Secret

### Ubicación:
```
Paddle Dashboard → Settings → Webhooks
```

### Instrucciones:

1. En Paddle Settings, haz clic en **"Webhooks"** (menú izquierdo)

2. Verás una sección llamada **"Webhook signing key"** o **"Signing secrets"**

3. Verás dos opciones:
   - **Development** (comienza con `test_`)
   - **Production** (comienza con `prod_`)

4. **Copia el Development Webhook Secret**

```
Ejemplo:
test_whsec_abc123def456ghi789jkl012mno345pqr
```

5. **Reemplaza en `.env.local`:**

```bash
# ANTES:
PADDLE_WEBHOOK_SECRET=WEBHOOK_SECRET_HERE

# DESPUÉS:
PADDLE_WEBHOOK_SECRET=test_whsec_abc123def456ghi789jkl012mno345pqr
```

---

## 💳 PASO 3: Crear Productos y Obtener Price IDs

### Ubicación:
```
Paddle Dashboard → Products
```

### Instrucciones:

#### 3.1 Crear Producto "Scanela Menú"

1. En Paddle Dashboard, haz clic en **"Products"** (menú principal)

2. Haz clic en **"Create product"** (botón azul)

3. Completa el formulario:

```
Product Name:        Scanela Menú
Description:         Plataforma de menú digital QR para restaurantes
Product Type:        SaaS (Software as a Service)
Category:            Software
Tax Category:        SaaS (si está disponible)
```

4. Haz clic en **"Create product"**

#### 3.2 Crear Price Monthly

1. En la página del producto, ve a la sección **"Prices"**

2. Haz clic en **"Add price"**

3. Completa:

```
Price Name:          Scanela Menú - Monthly
Billing Cycle:       Monthly
Price:               $4.99 USD  (o el precio que uses)
Currency:            USD
Trial days:          0 (sin prueba, o 7 si quieres)
Quantity:            Hide from customer
```

4. Haz clic en **"Create price"**

5. **Copia el Price ID** (comienza con `pri_`)

```
Ejemplo:
pri_01234567890abcdef_monthly
```

6. **Reemplaza en `.env.local`:**

```bash
# ANTES:
PADDLE_PRICE_MENU_MONTHLY=pri_01234567890abcdef_monthly

# DESPUÉS:
PADDLE_PRICE_MENU_MONTHLY=pri_01234567890abcdef_monthly  ← Copia tu Price ID real
```

#### 3.3 Crear Price Annual

1. En la misma página del producto, haz clic en **"Add price"** de nuevo

2. Completa:

```
Price Name:          Scanela Menú - Annual
Billing Cycle:       Yearly
Price:               $49.90 USD  (12 meses × $4.99, o el que uses)
Currency:            USD
Trial days:          0 (sin prueba)
Quantity:            Hide from customer
```

3. Haz clic en **"Create price"**

4. **Copia el Price ID** (comienza con `pri_`)

```
Ejemplo:
pri_01234567890abcdef_annual
```

5. **Reemplaza en `.env.local`:**

```bash
# ANTES:
PADDLE_PRICE_MENU_ANNUAL=pri_01234567890abcdef_annual

# DESPUÉS:
PADDLE_PRICE_MENU_ANNUAL=pri_01234567890abcdef_annual  ← Copia tu Price ID real
```

---

## 📝 PASO 4: Verificar tu `.env.local`

Abre `/home/bryansgue/scanela/.env.local` y verifica que tengas:

```bash
# ✅ PADDLE - Nuevo Sistema de Pagos
# ✅ Debe estar configurado (NO TEST_KEY_HERE)
PADDLE_API_KEY=test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# ✅ Debe estar configurado (NO WEBHOOK_SECRET_HERE)
PADDLE_WEBHOOK_SECRET=test_whsec_abc123def456ghi789jkl012mno345pqr

# ✅ Debe tener valores reales de Price IDs (NO pri_01234567890abcdef)
PADDLE_PRICE_MENU_MONTHLY=pri_01234567890abcdef_monthly
PADDLE_PRICE_MENU_ANNUAL=pri_01234567890abcdef_annual

# ✅ STRIPE - Comentado (ya no lo usamos)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
# STRIPE_SECRET_KEY=...
# etc...
```

---

## 📦 PASO 5: Instalar Dependencia `axios`

Paddle nos requiere hacer peticiones HTTP. Instala axios:

```bash
cd /home/bryansgue/scanela
npm install axios
```

Verifica que se agregó a `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.0",  ← Debe estar aquí
    "next": "^14.0.0",
    ...
  }
}
```

---

## ✅ Verificación Final

### Checklist de Fase 1 Completada:

```bash
✅ Paddle API Key: configurado (test_...)
✅ Paddle Webhook Secret: configurado (test_whsec_...)
✅ Paddle Price IDs: configurados (pri_...)
✅ .env.local actualizado: sin TEST_KEY_HERE
✅ axios instalado: npm ls axios

# Si todo está ✅, listo para Fase 2!
```

### Verificar con comando:

```bash
# Ver que las variables están cargadas correctamente:
grep -E "PADDLE_|STRIPE_" .env.local | grep -v "#"
```

Debe mostrar:
```
PADDLE_API_KEY=test_...
PADDLE_WEBHOOK_SECRET=test_whsec_...
PADDLE_PRICE_MENU_MONTHLY=pri_...
PADDLE_PRICE_MENU_ANNUAL=pri_...
# (Las de Stripe comentadas)
```

---

## 🆘 Troubleshooting Fase 1

### Problema: "No encuentro el API Key en Paddle Dashboard"

**Solución:**
1. Asegúrate de estar en la pestaña **Desarrollo** (no Producción)
2. Ve a: Settings → Authentication
3. Si no ves "REST API Keys", tu cuenta puede no estar completamente activada
4. Contacta a Paddle: support@paddle.com

### Problema: "El Webhook Secret no aparece"

**Solución:**
1. Ve a: Settings → Webhooks
2. Desplázate hacia abajo
3. Busca "Webhook signing keys" o "Signing secrets"
4. Si aún no lo ves, crea un webhook primero:
   - URL: http://localhost:3000/api/billing/webhook (temporal)
   - Esto debería generar el Webhook Secret

### Problema: "Price IDs del producto no se muestran"

**Solución:**
1. En Products, selecciona tu producto "Scanela Menú"
2. Ve a la sección "Prices" (debajo de la descripción)
3. Si no ves precios, haz clic en "Add price" primero
4. Los Price IDs aparecerán después de crear el precio

### Problema: "¿Qué diferencia entre test_ y prod_?"

**Solución:**
```
test_    = Credenciales de desarrollo (tarjetas de prueba, sin dinero real)
prod_    = Credenciales de producción (dinero real, usa después del deployment)

Para desarrollo: usa test_
Para producción: usa prod_
```

---

## 📞 Soporte

- **Paddle Docs:** https://developer.paddle.com/docs
- **Paddle Webhooks:** https://developer.paddle.com/webhooks
- **Paddle Support:** support@paddle.com

---

## 🎯 Próximo Paso

Una vez completada la **Fase 1**, comienza con **Fase 2: Implementación**

Archivo: `STRIPE_TO_PADDLE_MIGRATION.md` → Fase 2: Implementación

---

**Status:** ✅ Lista para usar
**Última actualización:** 2026-02-18
**Tiempo estimado:** 15-20 minutos

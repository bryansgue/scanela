# Verificación de Alineación con Requisitos de Paddle

## Respuesta a Camile (Paddle Customer Support)

### 1. Explicación del Producto

**Requisito de Paddle:**
> "A brief explanation about your product offering and how your website is used"

**Nuestra Respuesta:**
Scanela es una plataforma SaaS de menú digital QR para restaurantes y negocios de alimentos y bebidas. Los restaurantes crean menús digitales interactivos que comparten con clientes mediante códigos QR. El sitio web permite:
- Crear y editar menús digitales
- Gestionar productos y categorías
- Personalizar con branding del restaurante
- Compartir menús vía QR con clientes
- Ver analíticas de uso

**Dónde está documentado:**
- Términos de Servicio - Sección 2 (app/terms-and-conditions/page.tsx)
- Landing page - Secciones Hero, HowItWorks, Features

---

### 2. Procesamiento de Pagos - RESPUESTA CRÍTICA

**Pregunta de Paddle:**
> "Could you please clarify whether you intend to use Paddle to process the payments for orders made between the restaurants and their customers?"

**RESPUESTA CLARA: NO**

Scanela usa Paddle SOLO para procesar pagos de suscripción (Scanela Free → Scanela Menú).
Scanela NO procesa pagos entre restaurantes y sus clientes.

**Dónde está documentado:**

1. **Términos de Servicio - Sección 2.3:**
   ```
   "Scanela NO procesa, maneja ni es responsable por ningún pago 
   o transacción entre restaurantes y sus clientes. Todos los pagos 
   de alimentos y bebidas son gestionados directamente por el 
   restaurante, no por Scanela."
   ```

2. **Términos de Servicio - Nueva Sección 5 (Transacciones de Clientes):**
   ```
   "Scanela no procesa, autoriza, maneja ni es responsable por 
   ningún pago entre restaurantes y sus clientes. Todas las 
   transacciones de alimentos y bebidas son entre el restaurante 
   y sus clientes."
   ```

3. **Términos de Servicio - Sección 4.2:**
   ```
   "Las suscripciones a Scanela se procesan a través de Paddle, 
   nuestro procesador de pagos autorizado. Paddle procesa 
   ÚNICAMENTE los pagos de suscripción entre restaurantes y Scanela, 
   no transacciones de clientes."
   ```

---

### 3. Política de Reembolsos - 14 Días

**Requisito de Paddle:**
> "To enable Paddle's checkout, it's important to comply with our refund policy, which requires a minimum 14-day refund window with no exceptions or conditions."

**IMPLEMENTACIÓN COMPLETA:**

**Sección 1 - Derecho Garantizado:**
```
"En Scanela, todos nuestros clientes tienen derecho a un reembolso 
completo dentro de 14 DÍAS CALENDARIOS desde la fecha de su compra 
inicial. Este es un derecho garantizado SIN EXCEPCIONES NI 
CONDICIONES ESPECIALES."
```

**Sección 2 - Ventana de 14 Días:**
- ✅ 14 días desde el cargo inicial
- ✅ Reembolso completo
- ✅ Sin justificación requerida
- ✅ Sin preguntas adicionales
- ✅ Procesamiento automático

**Cumplimiento con "no exceptions or conditions":**
- ✅ Eliminado lenguaje condicional
- ✅ Sin palabras prohibidas: "non-refundable", "no refunds"
- ✅ Derecho absoluto, no discrecional

**Dónde está documentado:**
- app/refund-policy/page.tsx (Secciones 1-2)
- app/terms-and-conditions/page.tsx (Sección 4.6)

---

## Resumen de Alineación

| Requisito Paddle | Estado | Documentación |
|-----------------|--------|--------------|
| Explicación del producto | ✅ CUMPLE | Terms 2.1-2.2, Landing page |
| Paddle SOLO para suscripción | ✅ CUMPLE | Terms 2.3, 5, 4.2 |
| NO procesa pagos cliente | ✅ CUMPLE | Terms 2.3, 5 (nueva sección) |
| 14 días reembolso | ✅ CUMPLE | Refund Policy 1-2 |
| Sin excepciones/condiciones | ✅ CUMPLE | Refund Policy sección 1 |
| Lenguaje claro y profesional | ✅ CUMPLE | Ambas páginas |

---

## Email Sugerido para Responder a Camile

---

Subject: Re: Domain Verification - Clarification on Paddle Usage

Hi Camile,

Thank you for reviewing our application. I'm happy to provide the clarifications you requested:

**1. Product Offering:**
Scanela is a SaaS platform that provides digital QR menu solutions for restaurants and food & beverage businesses. Our website enables restaurants to create, customize, and share digital menus through QR codes with their customers. We do NOT process any transactions between restaurants and their customers.

**2. Paddle Payment Processing:**
To be completely clear: **Scanela does NOT use Paddle to process payments between restaurants and their customers.** 

Paddle processes ONLY the subscription payments between restaurants and Scanela (for upgrading from Free to Menu plans). All customer orders and payments at the restaurant level are handled directly by the restaurant using their own payment methods - Scanela is not involved in these transactions.

This is clearly stated in our Terms of Service (Section 2.3 and Section 5), which specifies:
- "Scanela does NOT process, handle, or bear responsibility for any payment or transaction between restaurants and their customers."

**3. Refund Policy:**
We fully comply with Paddle's requirements. Our Refund Policy (available at scanela.com/refund-policy) includes:
- **14-day refund window** - guaranteed, no exceptions or conditions
- Full refund for all subscription purchases within 14 days
- No justification required
- Clear, professional language

All documentation is available on our website:
- Terms of Service: scanela.com/terms-and-conditions
- Refund Policy: scanela.com/refund-policy
- Privacy Policy: scanela.com/privacy-policy

I hope this clarifies our use case. Please let me know if you need any additional information.

Best regards,
Bryan
Scanela

---

## Archivos Modificados (Última Actualización)

```
Commit: 32535ee
- app/refund-policy/page.tsx (Actualizado con 14 días garantizados)
- app/terms-and-conditions/page.tsx (Actualizado con clarificación de pagos)
```

## URLs de Referencia para Paddle

- Refund Policy: https://scanela.com/refund-policy
- Terms of Service: https://scanela.com/terms-and-conditions
- Privacy Policy: https://scanela.com/privacy-policy
- Pricing: https://scanela.com/pricing

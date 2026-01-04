# ✅ FIX SIMPLE - Theme Save/Load

## El Problema
El tema se guardaba pero no cargaba correctamente.

## La Causa
`businessId` llegaba como **STRING** ("23") pero en la base de datos es **BIGINT** (número 23).

Cuando haces `.eq('business_id', "23")` en Supabase:
- NO encuentra el registro (porque 23 ≠ "23")
- Retorna un registro DIFERENTE
- Por eso el tema estaba "mal"

## La Solución
Convertir `businessId` de STRING a número:

```typescript
// Antes (MALO):
const { businessId } = await request.json();
.eq('business_id', businessId)  // ← "23" ≠ 23

// Después (CORRECTO):
const { businessId } = await request.json();
const numericBusinessId = parseInt(businessId, 10);  // Convierte "23" a 23
.eq('business_id', numericBusinessId)  // ← 23 === 23 ✅
```

## Cambios en `/app/api/dashboard/save-menu/route.ts`

**Línea ~43:** Agregar conversión
```typescript
const numericBusinessId = parseInt(businessId, 10);
```

**Línea ~50:** Usar ID numérico en SELECT
```typescript
.eq('business_id', numericBusinessId)
```

**Línea ~55:** Usar ID numérico en newData
```typescript
const newData = {
  business_id: numericBusinessId,  // ← Era businessId
  // ...
};
```

**Línea ~104:** Usar ID numérico en UPDATE
```typescript
.eq('business_id', numericBusinessId)  // ← Era businessId
```

## ¡Eso es todo!

Solo eso era necesario. Simple.

---

## Para Probar

```bash
npm run dev
```

1. Abre dashboard
2. Selecciona negocio
3. Cambia color (cualquiera)
4. Guarda
5. Recarga página
6. **El color debería persistir** ✅

Si funciona, el problema estaba en eso.

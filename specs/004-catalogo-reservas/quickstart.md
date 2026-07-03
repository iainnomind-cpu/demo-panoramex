# Quickstart & Validation Guide: Catálogo de Tours y Módulo de Reservas

**Feature**: `004-catalogo-reservas`
**Date**: 2026-07-03

---

## Prerequisites

- [ ] Supabase project running (local Docker o proyecto en la nube)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` configurados en `.env.local`
- [ ] `META_ACCESS_TOKEN` y `META_PHONE_NUMBER_ID` configurados (para validación WhatsApp)
- [ ] Node.js ≥ 18, `npm install` ejecutado
- [ ] Migraciones y seed aplicados (ver paso 1)

---

## Step 1: Apply Migration & Seed

```bash
# Aplicar la migración del catálogo
npx supabase db push
# O en desarrollo local:
npx supabase db reset

# Verificar que las tablas existen
npx supabase db execute --sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
# Esperado: tours, tour_variants, reservations, reservation_passengers + tablas previas
```

Verificar la vista:
```sql
SELECT * FROM tour_availability_view LIMIT 5;
-- Debe retornar filas sin error
```

---

## Step 2: Verify RLS Policies

```bash
# Usando la CLI de Supabase o el panel SQL:
npx supabase db execute --sql "
  SELECT schemaname, tablename, policyname, cmd
  FROM pg_policies
  WHERE tablename IN ('tours','tour_variants','reservations','reservation_passengers')
  ORDER BY tablename, cmd;
"
# Esperado: SELECT abierto para authenticated, UPDATE de precio solo via service_role
```

---

## Step 3: Seed Tours & Verify Catalog UI

```bash
# Aplicar seed de ~30 tours
npx supabase db execute --file supabase/seed.sql

# Arrancar el frontend
npm run dev
```

1. Navegar a `http://localhost:5173/tours`
2. **Verificar**: La página carga las cards de tours desde Supabase (no desde `src/data/tours.ts`)
3. **Verificar**: Los filtros de categoría funcionan con los datos reales
4. **Verificar**: Hacer clic en una card abre `TourDetailModal` con variantes y precios de la BD

---

## Step 4: Validate Inline Price Editing

1. Iniciar sesión como agente con `can_edit_catalog = true`
2. Navegar a `/tours`, abrir el detalle de "Tren José Cuervo"
3. **Verificar**: Los precios de cada variante (Express, Premium Plus, Diamante) son visibles
4. Hacer clic en el precio de la variante "Express"
5. **Verificar**: El campo se vuelve editable en línea con un input numérico
6. Ingresar un nuevo precio (ej. `3200`) y confirmar (Enter o botón ✓)
7. **Verificar**: El precio actualizado aparece sin recargar la página
8. **Verificar en audit_log**:
   ```sql
   SELECT * FROM audit_log WHERE action = 'update_variant_price' ORDER BY created_at DESC LIMIT 1;
   -- Debe mostrar: entity_type='tour_variant', metadata con old_price y new_price
   ```

**Validar bloqueo de permisos**:
1. Iniciar sesión como agente con `can_edit_catalog = false`
2. **Verificar**: El campo de precio es solo lectura, sin control de edición visible

---

## Step 5: Validate Availability API (Chatbot Integration)

```bash
# Con el servidor de desarrollo corriendo (vercel dev o npm run dev):
curl -X GET "http://localhost:3000/api/tours/availability?variant_id=<UUID>&date=2026-08-15" \
  -H "Authorization: Bearer <SUPABASE_JWT>"

# Respuesta esperada:
# { "variant_id": "...", "available_seats": 40, "availability_status": "available" }
```

**Simular cupo bajo**:
```sql
-- Insertar reservas de prueba hasta quedar con < min_capacity_alert plazas
INSERT INTO reservations (prospect_id, tour_variant_id, service_date, num_people, total_amount, status, created_by)
VALUES ('<prospect_id>', '<variant_id>', '2026-08-15', 36, 90000, 'confirmed', '<agent_id>');

-- Consultar de nuevo la API
-- availability_status debe ser "low_availability"
```

---

## Step 6: Create a Reservation & Validate Capacity Guard

```bash
curl -X POST "http://localhost:3000/api/reservations" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "<uuid>",
    "tour_variant_id": "<uuid>",
    "service_date": "2026-08-15",
    "num_people": 3,
    "total_amount": 7500.00,
    "deposit_amount": 2500.00,
    "passengers": [
      { "full_name": "Test User 1", "sort_order": 1 },
      { "full_name": "Test User 2", "sort_order": 2 },
      { "full_name": "Test User 3", "sort_order": 3 }
    ]
  }'
# 201 Created con la reserva
```

**Simular cupo agotado**:
```bash
# Con la variante ya sin plazas:
curl -X POST "http://localhost:3000/api/reservations" \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{ "tour_variant_id": "<uuid>", "service_date": "2026-08-15", "num_people": 10, ... }'
# 409 Conflict: { "error": "capacity_exceeded: only 4 seats available" }
```

---

## Step 7: Validate WhatsApp Confirmation

```bash
curl -X POST "http://localhost:3000/api/reservations/<id>/confirm-whatsapp" \
  -H "Authorization: Bearer <JWT>"

# 200: { "sent": true, "whatsapp_message_id": "wamid.xxx" }
# Verificar en WhatsApp que el cliente recibió el mensaje con el detalle de la reserva
```

---

## Step 8: Validate PDF Download

```bash
curl -X GET "http://localhost:3000/api/reservations/<id>/pdf" \
  -H "Authorization: Bearer <JWT>" \
  --output confirmacion.pdf

# Abrir confirmacion.pdf y verificar:
# - Nombre del tour y variante
# - Fecha del servicio
# - Lista de pasajeros
# - Total, depósito y saldo pendiente
```

---

## Validation Checklist Summary

| Scenario | Expected Result | Pass? |
|----------|----------------|-------|
| Catalog loads from Supabase (not mock data) | Cards show real tours | [ ] |
| Agent with `can_edit_catalog` edits price inline | Price updates, audit_log created | [ ] |
| Agent without `can_edit_catalog` sees read-only price | No edit control visible | [ ] |
| Availability API returns correct `available_seats` | Numeric value matches capacity - reserved | [ ] |
| Availability API returns `sold_out` when full | `availability_status: "sold_out"` | [ ] |
| Reservation creation deducts capacity | `available_seats` decreases by `num_people` | [ ] |
| Reservation creation on full tour returns 409 | `capacity_exceeded` error | [ ] |
| Reservation cancellation restores capacity | `available_seats` increases | [ ] |
| WhatsApp confirmation sent | Client receives message on WhatsApp | [ ] |
| PDF download works | Valid PDF with correct reservation data | [ ] |

---

## References

- Data Model: [`data-model.md`](../data-model.md)
- API Contracts: [`contracts/api-contracts.md`](../contracts/api-contracts.md)
- Feature Spec: [`spec.md`](../spec.md)
- Frontend module: `src/pages/Tours/` — actualmente mock, se conecta a Supabase en esta feature

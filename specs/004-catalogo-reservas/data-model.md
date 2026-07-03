# Data Model: Catálogo de Tours y Módulo de Reservas

**Feature**: `004-catalogo-reservas`
**Date**: 2026-07-03
**Source**: `spec.md` Key Entities + `research.md` DR-001 to DR-006

---

## Nuevas Tablas

### `tours`

Catálogo maestro de servicios de Panoramex.

| Columna | Tipo | Nullable | Default | Notas |
|---------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `name` | `text` | NO | — | Nombre del tour (ej. "Tren José Cuervo") |
| `slug` | `text` | NO | — | URL-safe, UNIQUE (ej. "tren-jose-cuervo") |
| `description` | `text` | YES | — | Descripción larga para el agente/cliente |
| `inclusions` | `text[]` | YES | `'{}'` | Lista de inclusiones (ej. ["Traslado", "Guía"]) |
| `image_url` | `text` | YES | — | URL pública de imagen representativa |
| `min_capacity_alert` | `int` | NO | `5` | Umbral de alerta de cupo mínimo |
| `is_active` | `boolean` | NO | `true` | Ocultar sin eliminar |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | Actualizado por trigger |

**Constraints**: `UNIQUE(slug)`

---

### `tour_variants`

Variantes de precio y capacidad por tour.

| Columna | Tipo | Nullable | Default | Notas |
|---------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `tour_id` | `uuid` | NO | — | FK → `tours.id` ON DELETE CASCADE |
| `name` | `text` | NO | — | Ej. "Express", "Premium Plus", "Diamante" |
| `price_per_person` | `numeric(10,2)` | NO | — | Precio base por persona (MXN) |
| `capacity` | `int` | NO | — | Plazas máximas por fecha |
| `sort_order` | `int` | NO | `0` | Orden de presentación |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | Actualizado por trigger |

**Constraints**: `CHECK (price_per_person >= 0)`, `CHECK (capacity > 0)`, `UNIQUE(tour_id, name)`

---

### `reservations`

Reserva de un cliente vinculada a un prospecto.

| Columna | Tipo | Nullable | Default | Notas |
|---------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `prospect_id` | `uuid` | NO | — | FK → `prospects.id` |
| `tour_variant_id` | `uuid` | NO | — | FK → `tour_variants.id` |
| `service_date` | `date` | NO | — | Fecha del tour |
| `num_people` | `int` | NO | — | Número de plazas reservadas |
| `total_amount` | `numeric(10,2)` | NO | — | Precio total calculado |
| `deposit_amount` | `numeric(10,2)` | NO | `0` | Depósito registrado (MXN) |
| `balance_due` | `numeric(10,2)` | GENERATED | `total_amount - deposit_amount` | Columna generada |
| `status` | `text` | NO | `'pending'` | ENUM: `pending`, `confirmed`, `cancelled` |
| `notes` | `text` | YES | — | Notas internas del agente |
| `created_by` | `uuid` | NO | — | FK → `agents.id` |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

**Constraints**:
- `CHECK (num_people > 0)`
- `CHECK (deposit_amount >= 0)`
- `CHECK (deposit_amount <= total_amount)`
- `CHECK (status IN ('pending', 'confirmed', 'cancelled'))`

---

### `reservation_passengers`

Lista nominal de pasajeros por reserva.

| Columna | Tipo | Nullable | Default | Notas |
|---------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `reservation_id` | `uuid` | NO | — | FK → `reservations.id` ON DELETE CASCADE |
| `full_name` | `text` | NO | — | Nombre completo del pasajero |
| `sort_order` | `int` | NO | `0` | Orden en la lista |

---

## Vista SQL

### `tour_availability_view`

Calcula plazas disponibles en tiempo real por variante+fecha.

```sql
CREATE OR REPLACE VIEW public.tour_availability_view AS
SELECT
  tv.id            AS variant_id,
  tv.tour_id,
  tv.name          AS variant_name,
  tv.capacity,
  r.service_date,
  COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)::int AS reserved_seats,
  (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0))::int AS available_seats,
  t.min_capacity_alert,
  CASE
    WHEN (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)) <= 0
    THEN 'sold_out'
    WHEN (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)) <= t.min_capacity_alert
    THEN 'low_availability'
    ELSE 'available'
  END AS availability_status
FROM public.tour_variants tv
JOIN public.tours t ON t.id = tv.tour_id
LEFT JOIN public.reservations r ON r.tour_variant_id = tv.id
GROUP BY tv.id, tv.tour_id, tv.name, tv.capacity, r.service_date, t.min_capacity_alert;
```

**Índice recomendado**: `CREATE INDEX idx_reservations_variant_date ON reservations (tour_variant_id, service_date) WHERE status != 'cancelled';`

---

## Trigger de Control de Capacidad

```sql
-- Función: bloquea reservas cuando no hay cupo
CREATE OR REPLACE FUNCTION check_reservation_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INT;
  v_reserved INT;
BEGIN
  SELECT capacity INTO v_capacity FROM tour_variants WHERE id = NEW.tour_variant_id;
  SELECT COALESCE(SUM(num_people), 0) INTO v_reserved
    FROM reservations
    WHERE tour_variant_id = NEW.tour_variant_id
      AND service_date = NEW.service_date
      AND status != 'cancelled'
      AND id != COALESCE(NEW.id, gen_random_uuid());
  IF (v_reserved + NEW.num_people) > v_capacity THEN
    RAISE EXCEPTION 'capacity_exceeded: only % seats available', (v_capacity - v_reserved);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_reservation_capacity
BEFORE INSERT OR UPDATE OF num_people, tour_variant_id, service_date, status
ON public.reservations
FOR EACH ROW
WHEN (NEW.status != 'cancelled')
EXECUTE FUNCTION check_reservation_capacity();
```

---

## Políticas RLS

### `tours`
- `SELECT`: Todos los agentes autenticados pueden leer.
- `INSERT / UPDATE / DELETE`: Solo `service_role` (gestión via backend).

### `tour_variants`
- `SELECT`: Todos los agentes autenticados.
- `UPDATE` de `price_per_person`: Solo via Vercel Function `PATCH /api/tours/variants/[id]/price` (usa service_role), que verifica `can_edit_catalog` en la tabla `agents`.
- No hay UPDATE directo desde cliente autenticado sobre precios.

### `reservations`
- `SELECT`: Todos los agentes autenticados.
- `INSERT`: Agentes autenticados (con validación de cupo por trigger).
- `UPDATE` de `status`: Agentes autenticados.
- `DELETE`: Solo `service_role`.

### `reservation_passengers`
- `SELECT / INSERT / UPDATE / DELETE`: Agentes autenticados (vinculados a reserva propia o cualquiera, según política de negocio — todos los agentes pueden gestionar cualquier reserva).

---

## Cambios a Tablas Existentes

### `agents` (feature 001)
- `can_edit_catalog boolean NOT NULL DEFAULT false` — **ya existe**. No se agrega ninguna columna nueva. El campo se reutiliza para controlar edición de precios del catálogo.

### `prospects` (feature 001)
- Sin cambios. `reservations.prospect_id` referencia la tabla existente.

---

## Relaciones

```
tours ─────────── tour_variants ──────────── reservations ─── reservation_passengers
  │                    │                          │
  │                    └── tour_availability_view │
  │                                               │
  └─────────────────────────────────── prospects ─┘
                                           │
                                        agents (created_by)
```

---

## Seed Data Outline

El archivo `supabase/seed.sql` contendrá los ~30 tours de Panoramex. Ejemplo representativo:

```sql
-- Tren José Cuervo
INSERT INTO tours (name, slug, description, inclusions, min_capacity_alert)
VALUES ('Tren José Cuervo', 'tren-jose-cuervo', '...', ARRAY['Traslado en tren histórico', 'Visita a destilería', 'Degustación'], 5);

INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
VALUES
  ((SELECT id FROM tours WHERE slug='tren-jose-cuervo'), 'Express',       2500.00, 40, 1),
  ((SELECT id FROM tours WHERE slug='tren-jose-cuervo'), 'Premium Plus',  3800.00, 20, 2),
  ((SELECT id FROM tours WHERE slug='tren-jose-cuervo'), 'Diamante',      5200.00, 10, 3);
```

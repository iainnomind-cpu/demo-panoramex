# API Contracts: Catálogo de Tours y Módulo de Reservas

**Feature**: `004-catalogo-reservas`
**Date**: 2026-07-03
**Base path**: `/api/tours`

All endpoints are Vercel Serverless Functions. All requests must include a valid Supabase JWT in the `Authorization: Bearer <token>` header. Endpoints that require `can_edit_catalog = true` return `403` if the calling agent lacks the flag.

---

## `GET /api/tours/availability`

Consulta de disponibilidad para el chatbot y el frontend de calendario.

### Request

| Parameter | In | Type | Required | Description |
|-----------|-----|------|----------|-------------|
| `variant_id` | query | `uuid` | YES | ID de la variante del tour |
| `date` | query | `string (YYYY-MM-DD)` | YES | Fecha del servicio |

### Response `200`

```json
{
  "variant_id": "uuid",
  "tour_id": "uuid",
  "variant_name": "Express",
  "capacity": 40,
  "reserved_seats": 35,
  "available_seats": 5,
  "availability_status": "low_availability",
  "min_capacity_alert": 5
}
```

`availability_status`: `"available"` | `"low_availability"` | `"sold_out"`

### Errors

| Code | Condition |
|------|-----------|
| `400` | Missing or invalid `variant_id` / `date` |
| `401` | Missing or invalid JWT |
| `404` | `variant_id` not found |

---

## `PATCH /api/tours/variants/[id]/price`

Actualización de precio de una variante. Requiere `can_edit_catalog = true`.

### Request Body

```json
{
  "price_per_person": 3200.00
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `price_per_person` | `number` | ≥ 0, required |

### Response `200`

```json
{
  "id": "uuid",
  "tour_id": "uuid",
  "name": "Express",
  "price_per_person": 3200.00,
  "updated_at": "2026-07-03T22:00:00Z"
}
```

### Side Effects

- Creates an entry in `audit_log`:
  - `action`: `"update_variant_price"`
  - `entity_type`: `"tour_variant"`
  - `entity_id`: `<id>`
  - `metadata`: `{ "old_price": 2500.00, "new_price": 3200.00 }`

### Errors

| Code | Condition |
|------|-----------|
| `400` | `price_per_person` missing, negative, or non-numeric |
| `401` | Missing JWT |
| `403` | Agent lacks `can_edit_catalog` |
| `404` | `variant_id` not found |

---

## `POST /api/reservations`

Crea una nueva reserva. Valida cupo disponible via trigger de BD.

### Request Body

```json
{
  "prospect_id": "uuid",
  "tour_variant_id": "uuid",
  "service_date": "2026-08-15",
  "num_people": 3,
  "total_amount": 7500.00,
  "deposit_amount": 2500.00,
  "notes": "Celebración de cumpleaños",
  "passengers": [
    { "full_name": "María López", "sort_order": 1 },
    { "full_name": "Juan López",  "sort_order": 2 },
    { "full_name": "Ana López",   "sort_order": 3 }
  ]
}
```

| Field | Type | Validation |
|-------|------|-----------|
| `prospect_id` | `uuid` | Required, must exist |
| `tour_variant_id` | `uuid` | Required, must exist |
| `service_date` | `string YYYY-MM-DD` | Required, must be today or future |
| `num_people` | `number` | Required, > 0, integer |
| `total_amount` | `number` | Required, ≥ 0 |
| `deposit_amount` | `number` | Required, ≥ 0, ≤ `total_amount` |
| `notes` | `string` | Optional |
| `passengers` | `array` | Optional; length should match `num_people` |

### Response `201`

```json
{
  "id": "uuid",
  "prospect_id": "uuid",
  "tour_variant_id": "uuid",
  "service_date": "2026-08-15",
  "num_people": 3,
  "total_amount": 7500.00,
  "deposit_amount": 2500.00,
  "balance_due": 5000.00,
  "status": "pending",
  "passengers": [...],
  "created_at": "2026-07-03T22:05:00Z"
}
```

### Side Effects

- Creates an entry in `audit_log`:
  - `action`: `"create_reservation"`
  - `entity_type`: `"reservation"`
  - `entity_id`: `<id>`

### Errors

| Code | Condition |
|------|-----------|
| `400` | Validation failure (missing fields, negative amounts, past date) |
| `401` | Missing JWT |
| `409` | DB trigger raises `capacity_exceeded` — cupo agotado |
| `404` | `prospect_id` or `tour_variant_id` not found |

---

## `PATCH /api/reservations/[id]/status`

Cambia el estado de una reserva.

### Request Body

```json
{
  "status": "confirmed"
}
```

`status`: `"pending"` | `"confirmed"` | `"cancelled"`

### Response `200`

Returns updated reservation object.

### Side Effects

- `cancelled` → cupo restaurado automáticamente (trigger).
- Creates `audit_log` entry with `action: "update_reservation_status"`.

---

## `POST /api/reservations/[id]/confirm-whatsapp`

Envía confirmación de reserva por WhatsApp al número del prospecto.

### Response `200`

```json
{
  "sent": true,
  "whatsapp_message_id": "wamid.xxx"
}
```

### Errors

| Code | Condition |
|------|-----------|
| `404` | Reservation or prospect not found |
| `422` | Prospect has no `whatsapp_number` |
| `429` | Meta rate limit hit |

---

## `GET /api/reservations/[id]/pdf`

Genera y devuelve el PDF de confirmación de reserva.

### Response `200`

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="confirmacion-<id>.pdf"
```

### Errors

| Code | Condition |
|------|-----------|
| `404` | Reservation not found |
| `500` | PDF generation failed |

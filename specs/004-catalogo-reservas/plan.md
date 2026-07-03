# Implementation Plan: Catálogo de Tours y Módulo de Reservas

**Branch**: `004-catalogo-reservas` | **Date**: 2026-07-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-catalogo-reservas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

---

## Summary

Construir el catálogo de ~30 tours de Panoramex con variantes de precio y capacidad, un sistema de disponibilidad en tiempo real, edición de precios en línea con control de permisos por agente, y un módulo de reservas vinculado al CRM de prospectos con control de depósito, lista de pasajeros y confirmación vía WhatsApp/PDF.

**Enfoque técnico**: Extender el esquema Supabase con las tablas `tours`, `tour_variants`, `reservations`, `reservation_passengers` y una vista `tour_availability_view`. Conectar el catálogo visual existente en `src/pages/Tours/` (actualmente mock) a datos reales de Supabase. La edición de precios y la generación de PDF se realizan via Vercel Functions para cumplir la constitución. El control de cupo se garantiza con un trigger PostgreSQL para evitar race conditions.

---

## Technical Context

**Language/Version**: TypeScript 5.x (frontend) / Node.js 18+ (Vercel Functions)

**Primary Dependencies**:
- Frontend: React 18 + Vite + TailwindCSS + Zustand (ya instalado)
- Backend: `@supabase/supabase-js` service role (ya instalado en feature 003)
- PDF: `@react-pdf/renderer` (nuevo) o `pdfkit` (alternativa más ligera)
- Existente: `openai` (feature 003), Supabase Auth

**Storage**: PostgreSQL via Supabase — nuevas tablas + vista SQL + trigger

**Testing**: Vitest (unitario de reglas de negocio), cURL para contratos de API

**Target Platform**: Vercel (serverless) + navegador moderno (ES2020+)

**Project Type**: Web application (frontend CRM + backend serverless)

**Performance Goals**:
- Consulta de disponibilidad: < 2s con 30 tours × 6 meses de datos (SC-002)
- Actualización de precio: cambio visible en < 3s tras confirmar (SC-001)

**Constraints**:
- La constitución prohíbe exposición de service_role_key en frontend
- Edición de precios solo via Vercel Function (no RLS UPDATE directo del cliente)
- PDF generado en servidor (< 5s límite de Vercel en plan Hobby)

**Scale/Scope**: ~30 tours, 3 variantes promedio, ~200 reservas/mes proyectadas

---

## Constitution Check

- [x] Supabase RLS configurado para todas las tablas nuevas (`tours`, `tour_variants`, `reservations`, `reservation_passengers`)
- [x] Ninguna API key expuesta en frontend — edición de precios y PDF via Vercel Function
- [x] El webhook de WhatsApp no es afectado por esta feature (ya implementado en 003)
- [x] Operaciones sensibles en `audit_log`: cambio de precio (FR-AUD-001), creación/cambio de estado de reserva (FR-AUD-002)
- [x] TypeScript estricto — el tipo `Tour` actual en `src/types/index.ts` se alinea con el schema de BD en las tareas de implementación
- [x] Tests planificados: test unitario del trigger de cupo, test de permisos RLS, test del endpoint de precio
- [x] Stack: React+Vite+TS+Tailwind+Zustand en frontend, Node.js Vercel en backend, Supabase DB

**Sin violaciones a la constitución.**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-catalogo-reservas/
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output
├── quickstart.md        ✅ Phase 1 output
├── contracts/
│   └── api-contracts.md ✅ Phase 1 output
└── tasks.md             ⬜ Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
# Migraciones y seed
supabase/migrations/
└── 00003_catalogo_reservas.sql   [NEW] tablas + vista + trigger + RLS + policies

supabase/
└── seed.sql                       [NEW] ~30 tours con variantes

# Backend — Vercel Functions
api/
├── bot/                           [EXISTS — feature 003]
├── webhook/                       [EXISTS — feature 003]
├── tours/
│   ├── availability.ts            [NEW] GET /api/tours/availability
│   └── variants/
│       └── [id]/
│           └── price.ts           [NEW] PATCH /api/tours/variants/[id]/price
└── reservations/
    ├── index.ts                   [NEW] POST /api/reservations
    └── [id]/
        ├── status.ts              [NEW] PATCH /api/reservations/[id]/status
        ├── confirm-whatsapp.ts    [NEW] POST /api/reservations/[id]/confirm-whatsapp
        └── pdf.ts                 [NEW] GET /api/reservations/[id]/pdf

# Frontend — React/Vite
src/
├── types/
│   └── index.ts                   [MODIFY] — alinear interfaz `Tour` con schema de BD
│                                             agregar `TourVariant`, `Reservation`, `Passenger`
├── lib/
│   └── database.types.ts          [MODIFY] — agregar tours, tour_variants, reservations, reservation_passengers
├── store/
│   └── useAppStore.ts             [MODIFY] — conectar tours a Supabase (eliminar mock)
│                                             agregar useCatalogStore o integrar en store existente
├── pages/
│   └── Tours/
│       ├── index.tsx              [MODIFY] — reemplazar mock data por query Supabase
│       ├── TourCard.tsx           [MODIFY] — adaptar props al nuevo tipo `Tour` de BD
│       ├── TourDetailModal.tsx    [MODIFY] — mostrar variantes con precios, añadir InlinePriceEditor
│       ├── CategoryFilter.tsx     [KEEP]   — sin cambios estructurales
│       └── components/
│           ├── VariantTable.tsx   [NEW]    — tabla de variantes con InlinePriceEditor
│           ├── AvailabilityCalendar.tsx [NEW] — calendario de disponibilidad por variante
│           └── InlinePriceEditor.tsx   [NEW] — campo editable en línea con control de permisos
└── components/shared/
    └── ReservationModal.tsx       [MODIFY] — conectar a POST /api/reservations real (eliminar setTimeout mock)

# Tests
tests/api/
├── tours-availability.test.ts     [NEW]
└── reservations-capacity.test.ts  [NEW]
```

---

## Key Implementation Decisions (from research.md)

| Decisión | Elección |
|----------|----------|
| Disponibilidad | Vista SQL `tour_availability_view` — cálculo en BD |
| Control de cupo | Trigger `BEFORE INSERT OR UPDATE` en `reservations` |
| Edición de precio | Vercel Function `PATCH /api/tours/variants/[id]/price` |
| Permiso de edición | Reutilizar `can_edit_catalog` de la tabla `agents` (feature 001) |
| PDF | `@react-pdf/renderer` en Vercel Function |
| WhatsApp confirmación | Reutiliza `api/bot/whatsapp.ts` de feature 003 |
| Frontend data source | Supabase queries en lugar de `src/data/tours.ts` mock |
| Tipo `Tour` en frontend | Alinear `src/types/index.ts` con schema de BD |

---

## Complexity Tracking

*(Sin violaciones a la constitución — sección vacía)*

---

## Verification Plan

### Automated Tests
```bash
# Trigger de cupo
npx vitest run tests/api/reservations-capacity.test.ts

# Endpoint de disponibilidad
npx vitest run tests/api/tours-availability.test.ts

# Build del frontend sin errores de tipos
npm run build
```

### Manual Verification
Ver [`quickstart.md`](./quickstart.md) — 10 escenarios de validación cubriendo:
- Catálogo desde Supabase (no mock)
- Edición de precio en línea + auditoría
- Bloqueo de edición para agente sin permiso
- API de disponibilidad
- Creación de reserva y descuento de cupo
- Guard de cupo agotado (409)
- Restauración de cupo al cancelar
- Confirmación WhatsApp
- Descarga de PDF

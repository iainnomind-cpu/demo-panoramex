# Research: Catálogo de Tours y Módulo de Reservas

**Feature**: `004-catalogo-reservas`
**Date**: 2026-07-03

---

## Decision Log

### DR-001: Cómputo de disponibilidad — Vista SQL vs. cálculo en aplicación

- **Decision**: Usar una **Vista de PostgreSQL** (`tour_availability_view`) que calcula plazas disponibles en tiempo real con `capacity - COALESCE(SUM(reserved), 0)`.
- **Rationale**: La lógica es simple y estable (resta una suma). La vista centraliza el cálculo en la base de datos, evita inconsistencias entre cliente y servidor, y el chatbot puede consultar la misma fuente sin duplicar lógica.
- **Alternatives considered**: Tabla materializada (requiere refresh); campo desnormalizado `seats_remaining` (requiere triggers complejos y puede desincronizarse).

### DR-002: Control de cupo — Trigger vs. CHECK en aplicación

- **Decision**: Usar un **trigger `BEFORE INSERT OR UPDATE`** en `reservations` que verifica que `num_people ≤ plazas disponibles` antes de permitir la escritura.
- **Rationale**: Evita race conditions cuando dos agentes reservan simultáneamente para la misma fecha. La validación a nivel de BD es autoritativa y no puede ser bypasseada por el frontend.
- **Alternatives considered**: Validación solo en el servidor Vercel (insuficiente ante concurrencia); transacciones con SELECT FOR UPDATE (más complejo, innecesario para el volumen actual).

### DR-003: Edición de precio en línea — Mutación directa a Supabase vs. Vercel Function

- **Decision**: La edición de precio se realiza mediante una **Vercel Function `PATCH /api/tours/variants/:id/price`** que verifica el claim `can_edit_catalog` del JWT antes de escribir, y registra en `audit_log`.
- **Rationale**: La constitución prohíbe exponer la service role key en el frontend. Usar el cliente anon con RLS funciona para SELECT, pero la auditoría y la verificación del permiso extendido (`can_edit_catalog` que vive en `agents`, no en `auth.users`) requieren control del servidor.
- **Alternatives considered**: RLS policy directa sobre `tour_variants` que llame a una función Postgres `get_current_agent_can_edit_catalog()` — viable pero genera acoplamiento fuerte entre el rol de auth y la tabla `agents`; se elige la function Vercel por consistencia con el patrón ya establecido en feature 003.

### DR-004: Generación de PDF — Cliente vs. Servidor

- **Decision**: PDF generado en **Vercel Function** usando `@react-pdf/renderer` (o `pdfkit`) que devuelve un buffer con `Content-Type: application/pdf`.
- **Rationale**: La constitución prohíbe exponer lógica de negocio en el cliente. Los datos de la reserva son sensibles (nombres de pasajeros, montos).
- **Alternatives considered**: jsPDF en cliente (viola constitución); servicio externo de generación (dependencia innecesaria).

### DR-005: Reuse de `src/pages/Tours/` — Catálogo demo vs. CRM

- **Decision**: **Reutilizar el shell visual** de `src/pages/Tours/` (estructura de cards, grid layout, tipografía Tailwind) pero **conectar a datos reales de Supabase** reemplazando datos mock/hardcoded.
- **Rationale**: El usuario explicitamente pide reutilizar el catálogo visual ya construido. El trabajo es añadir capas de datos, permisos y disponibilidad, no rediseñar la UI.
- **Alternatives considered**: Rediseño completo (rechazado, ya existe UI válida); reutilizar tal cual con datos mock (no funcional en producción).

### DR-005: Permiso `can_edit_catalog` — Columna existente en `agents`

- **Decision**: La spec referencia `can_edit_catalog`. El usuario en el briefing menciona `can_edit_tours = true`. **Usar `can_edit_catalog`** que ya existe en la tabla `agents` (creada en feature 001) para evitar duplicar columnas con semántica equivalente.
- **Rationale**: La constitución exige coherencia de datos. Agregar `can_edit_tours` cuando ya existe `can_edit_catalog` introduce confusión. Si en el futuro se necesita granularidad fina (editar tours ≠ editar catálogo completo), se evalúa en una enmienda.
- **Alternatives considered**: Agregar columna `can_edit_tours` separada (rechazado por duplicación prematura).

### DR-006: Seed de tours — SQL seed file vs. UI admin

- **Decision**: Crear un archivo **`supabase/seed.sql`** con los ~30 tours de Panoramex y sus variantes para carga inicial.
- **Rationale**: El spec asume carga manual de datos iniciales. Un seed SQL es reproducible, versionable y no requiere UI adicional para la primera carga.
- **Alternatives considered**: CSV import (no versionable); UI de administración de tours en esta iteración (fuera de alcance).

---

## Technology Decisions

| Área | Decisión |
|------|----------|
| PDF generation | `@react-pdf/renderer` en Vercel Function |
| Availability calculation | PostgreSQL VIEW `tour_availability_view` |
| Concurrency guard | PostgreSQL TRIGGER `check_reservation_capacity` |
| Price edit API | `PATCH /api/tours/variants/[id]/price` (Vercel Function) |
| WhatsApp confirmation | Reutiliza `api/bot/whatsapp.ts` de feature 003 |
| Frontend state | Zustand store `useCatalogStore` + React Query para server state |

---

## Existing Frontend Analysis

El directorio `src/pages/Tours/` ya contiene un catálogo visual de tours construido durante la fase de diseño del sistema. La estructura esperada es:

```
src/pages/Tours/
├── index.tsx          # Grid de cards de tours
├── TourDetail.tsx     # Vista de detalle con variantes
└── components/
    ├── TourCard.tsx
    └── VariantTable.tsx
```

La integración de datos reales requiere:
1. Reemplazar datos mock por queries a Supabase (`tours` + `tour_variants`)
2. Añadir componente `InlinePriceEditor` sobre la celda de precio en `VariantTable`
3. Añadir sección `AvailabilityCalendar` en `TourDetail`
4. Conectar permisos via `useAuthStore` (ya existe en feature 001)

---

## Risks & Mitigations

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Race condition en reservas simultáneas | Media | Alto | Trigger DB + constraint |
| Datos mock hardcoded en Tours/ difíciles de reemplazar | Media | Medio | Auditoría de archivos en implementación |
| PDF generation en Vercel tiene límite de 5s | Baja | Medio | Buffer en memoria, sin imágenes pesadas |
| Chatbot consulta disponibilidad con latencia | Baja | Bajo | Vista SQL indexada por `(variant_id, date)` |

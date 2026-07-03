# Tasks: Catálogo de Tours y Módulo de Reservas

**Input**: Design documents from `/specs/004-catalogo-reservas/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — instalar dependencias nuevas y preparar el entorno

- [x] T001 Install PDF generation dependency: `npm install @react-pdf/renderer`
- [x] T002 [P] Add `can_edit_catalog` column guard: verify column exists in `agents` table (feature 001 — no migration needed; documental check)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema de BD, types, y utilidades base que DEBEN completarse antes de cualquier user story

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create migration `supabase/migrations/00003_catalogo_reservas.sql` with tables `tours`, `tour_variants`, `reservations`, `reservation_passengers`, VIEW `tour_availability_view`, TRIGGER `check_reservation_capacity`, and all RLS policies per `data-model.md`
- [x] T004 Create seed file `supabase/seed.sql` with all ~30 Panoramex tours and their variants (Express, Premium Plus, Diamante, etc.) per `research.md` DR-006
- [x] T005 [P] Update `src/lib/database.types.ts` with the new tables: `tours`, `tour_variants`, `reservations`, `reservation_passengers`; add view type for `tour_availability_view`
- [x] T006 [P] Update `src/types/index.ts`: align the `Tour` interface to match the DB schema (rename Spanish fields to match DB columns), add `TourVariant`, `Reservation`, and `ReservationPassenger` interfaces
- [x] T007 [P] Refactor `src/store/useAppStore.ts`: replace mock `tours` data from `src/data/tours.ts` with a Supabase query using `supabase.from('tours').select('*, tour_variants(*)')`; add `loadTours`, `updateVariantPrice` actions

**Checkpoint**: Migration applied, seed loaded, types aligned, store connected to real data

---

## Phase 3: User Story 1 — Consulta y Edición Rápida del Catálogo (Priority: P1) 🎯 MVP

**Goal**: Catálogo de tours cargado desde Supabase con edición de precio en línea para agentes autorizados y modo lectura para el resto.

**Independent Test**: Un agente con `can_edit_catalog = true` abre el detalle del Tren José Cuervo, hace clic en el precio de la variante Express, lo edita a $3,200 y el cambio se refleja en UI sin recarga. Un agente sin permiso solo ve el valor. El `audit_log` registra el cambio.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create Vercel Function `api/tours/variants/[id]/price.ts` implementing `PATCH /api/tours/variants/[id]/price`: verify `can_edit_catalog` flag from `agents` table via service role, validate `price_per_person >= 0`, update `tour_variants`, write to `audit_log` per `contracts/api-contracts.md`
- [ ] T009 [P] [US1] Update `src/pages/Tours/index.tsx`: replace hardcoded `src/data/tours.ts` import with store-driven data from `useAppStore`; wire category filter to real `categoria` field from DB
- [ ] T010 [P] [US1] Update `src/pages/Tours/TourCard.tsx`: adapt props to new `Tour` interface (DB-aligned fields); update price display to use `tour_variants[0].price_per_person` as base price
- [ ] T011 [P] [US1] Create `src/pages/Tours/components/VariantTable.tsx`: table component that displays all variants for a tour with columns: name, price, capacity, sort_order
- [ ] T012 [US1] Create `src/pages/Tours/components/InlinePriceEditor.tsx`: inline-editable price field; reads `can_edit_catalog` from auth store; shows plain text if no permission; on click → input + confirm/cancel controls; calls `PATCH /api/tours/variants/[id]/price` on confirm; shows validation error if negative/non-numeric; reverts on cancel or error (depends on T008, T011)
- [ ] T013 [US1] Update `src/pages/Tours/TourDetailModal.tsx`: replace hardcoded inclusions/price fields with real DB data; integrate `VariantTable` with `InlinePriceEditor` for each variant price cell (depends on T011, T012)

**Checkpoint**: User Story 1 fully functional — catalog loads from Supabase, price editing works with audit trail, permission guard enforced

---

## Phase 4: User Story 2 — Consulta de Disponibilidad y Variantes (Priority: P1)

**Goal**: Calendario de disponibilidad por tour+variante+fecha con alertas de cupo bajo y endpoint de consulta para el chatbot.

**Independent Test**: Consultar `GET /api/tours/availability?variant_id=<UUID>&date=2026-08-15` devuelve `available_seats` correcto. Tras insertar reservas que bajen el cupo al umbral, la UI muestra la alerta `low_availability`.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Create Vercel Function `api/tours/availability.ts` implementing `GET /api/tours/availability`: query `tour_availability_view` by `variant_id` + `date`, return availability payload per `contracts/api-contracts.md`; return `{ available_seats: 0, availability_status: 'sold_out' }` for past dates
- [ ] T015 [P] [US2] Create `src/pages/Tours/components/AvailabilityCalendar.tsx`: monthly calendar grid showing availability status per date for a given variant; color-coded: green (available), amber (low_availability), red (sold_out); fetches from `GET /api/tours/availability` for each date in month range
- [ ] T016 [US2] Integrate `AvailabilityCalendar` into `src/pages/Tours/TourDetailModal.tsx` below the VariantTable section; add variant selector dropdown to switch calendar between variants (depends on T013, T014, T015)

**Checkpoint**: User Story 2 functional — availability calendar visible in tour detail, chatbot can query the endpoint

---

## Phase 5: User Story 3 — Registro de una Reserva (Priority: P1)

**Goal**: Crear reservas reales vinculadas a prospectos con control de cupo, depósito y lista de pasajeros.

**Independent Test**: Crear una reserva para el Tren José Cuervo Express el 2026-08-15 para 3 personas con depósito de $2,500. La reserva aparece en la BD, el cupo disponible disminuye en 3. Intentar crear otra reserva cuando no hay cupo devuelve 409.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Create Vercel Function `api/reservations/index.ts` implementing `POST /api/reservations`: validate all fields, call Supabase (service role) to insert `reservations` + `reservation_passengers` in a transaction, write `audit_log` entry; handle `capacity_exceeded` trigger error as 409 per `contracts/api-contracts.md`
- [ ] T018 [P] [US3] Create Vercel Function `api/reservations/[id]/status.ts` implementing `PATCH /api/reservations/[id]/status`: validate status transition (pending → confirmed → cancelled), update DB, write `audit_log` entry
- [ ] T019 [US3] Update `src/components/shared/ReservationModal.tsx`: replace `setTimeout` mock with real `POST /api/reservations` call; add fields for `tour_variant_id`, `service_date`, `num_people`, `deposit_amount`, `passengers[]` (name inputs per seat); display `balance_due` computed from total − deposit; show 409 capacity error inline (depends on T017)

**Checkpoint**: User Story 3 functional — reservations persisted to DB, capacity enforced, passenger list stored

---

## Phase 6: User Story 4 — Listado de Pasajeros por Tour y Fecha (Priority: P2)

**Goal**: Vista de listado operativo de todos los pasajeros por tour+fecha para coordinación del servicio.

**Independent Test**: Navegar a Reservaciones → filtrar por "Tren José Cuervo" y "2026-08-15" muestra todos los pasajeros agrupados por reserva, con el total de plazas ocupadas y las restantes. Las reservas con saldo pendiente están marcadas.

### Implementation for User Story 4

- [ ] T020 [P] [US4] Create `src/pages/Reservaciones/PassengerList.tsx`: filterable list component that accepts `tour_id` + `date` filters; queries `reservations` joined with `reservation_passengers`, `tour_variants`, and `prospects`; groups by reservation; shows per-row: passenger name, reservation status badge, deposit/balance indicator
- [ ] T021 [US4] Update `src/pages/Reservaciones/index.tsx` (or create if not exists): add tour+date filter controls at top; render `PassengerList` below; show aggregate: total plazas ocupadas, total plazas disponibles for selected tour+date (depends on T020, T014)

**Checkpoint**: User Story 4 functional — operations staff can view full passenger manifest per service date

---

## Phase 7: User Story 5 — Generación de Confirmación para el Cliente (Priority: P2)

**Goal**: Enviar confirmación de reserva por WhatsApp y generar PDF descargable con detalle completo.

**Independent Test**: Desde el detalle de una reserva confirmada, activar "Enviar por WhatsApp" — el cliente recibe el mensaje en WhatsApp. Activar "Descargar PDF" — el navegador descarga un PDF válido con todos los datos de la reserva.

### Implementation for User Story 5

- [ ] T022 [P] [US5] Create Vercel Function `api/reservations/[id]/confirm-whatsapp.ts`: load reservation + prospect + tour variant from DB, compose WhatsApp message template, call `api/bot/whatsapp.ts` sender; handle missing `whatsapp_number` as 422; handle Meta rate limit as 429 per `contracts/api-contracts.md`
- [ ] T023 [P] [US5] Create Vercel Function `api/reservations/[id]/pdf.ts`: load full reservation data, render PDF document using `@react-pdf/renderer` with: tour name, variant, date, passengers list, total/deposit/balance; return buffer as `application/pdf` with `Content-Disposition: attachment`
- [ ] T024 [US5] Add action buttons to reservation detail UI (in `PassengerList` or a new `ReservationDetail` component): "Enviar confirmación WhatsApp" → calls `POST /api/reservations/[id]/confirm-whatsapp`; "Descargar PDF" → calls `GET /api/reservations/[id]/pdf` and triggers download (depends on T022, T023)

**Checkpoint**: User Story 5 functional — client confirmations deliverable via WhatsApp and PDF

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Tests automatizados, validaciones de tipos, y verificación de quickstart

- [ ] T025 [P] Write unit test `tests/api/tours-availability.test.ts`: test `GET /api/tours/availability` for available / low_availability / sold_out / past-date scenarios
- [ ] T026 [P] Write unit test `tests/api/reservations-capacity.test.ts`: test trigger behavior via Supabase — reservation within capacity succeeds; reservation exceeding capacity returns `capacity_exceeded`
- [ ] T027 [P] Write unit test `tests/api/price-permission.test.ts`: test `PATCH /api/tours/variants/[id]/price` — agent with `can_edit_catalog=true` succeeds; agent with `can_edit_catalog=false` returns 403; negative price returns 400
- [ ] T028 Run `npm run build` to verify no TypeScript errors after all type changes in `src/types/index.ts` and `src/lib/database.types.ts`
- [ ] T029 Run quickstart.md validation checklist: all 10 scenarios must pass (see `quickstart.md`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS** all user stories
- **US1 (Phase 3) + US2 (Phase 4) + US3 (Phase 5)**: All P1 — can proceed in parallel after Phase 2
- **US4 (Phase 6)**: Depends on Phase 2 + US3 (needs reservations data)
- **US5 (Phase 7)**: Depends on Phase 2 + US3 (needs reservation records) + T014 (needs availability)
- **Polish (Phase 8)**: Depends on all desired user stories

### User Story Dependencies

- **US1** (Catalog + Price Edit): After Foundational only
- **US2** (Availability Calendar): After Foundational only — shares `tour_availability_view` with US3
- **US3** (Reservations): After Foundational only — creates data consumed by US4 + US5
- **US4** (Passenger List): After US3 (needs real reservations to display)
- **US5** (WhatsApp + PDF): After US3 (needs reservation records) + US2 (uses availability API)

### Within Each User Story

- Vercel Functions before frontend components (API must exist before UI calls it)
- Shared components (`VariantTable`, `InlinePriceEditor`) before pages that use them
- Store changes before component changes that consume the store

### Parallel Opportunities

All [P]-marked tasks in the same phase can run concurrently:
- T005, T006, T007 — three independent file changes (types, DB types, store)
- T008, T009, T010, T011 — backend + frontend leaf components have no mutual dependency
- T014, T015 — API and calendar component are independent
- T017, T018 — two separate Vercel Function files
- T022, T023 — WhatsApp and PDF functions are independent

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# These 4 tasks share no files and can run concurrently:
Task T008: "Create api/tours/variants/[id]/price.ts"
Task T009: "Update src/pages/Tours/index.tsx"
Task T010: "Update src/pages/Tours/TourCard.tsx"
Task T011: "Create src/pages/Tours/components/VariantTable.tsx"

# Then sequentially (T011 must exist):
Task T012: "Create InlinePriceEditor.tsx"  → requires T008 + T011

# Then sequentially:
Task T013: "Update TourDetailModal.tsx"    → requires T011 + T012
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 Only — all P1)

1. Complete **Phase 1 + Phase 2** — Foundation ready (migration, seed, types)
2. Complete **Phase 3** (US1) — Catalog from real data + price editing
3. Complete **Phase 4** (US2) — Availability calendar + chatbot API
4. Complete **Phase 5** (US3) — Reservations with capacity guard
5. **STOP and VALIDATE** using `quickstart.md` scenarios 1–6
6. Deploy/demo MVP

### Incremental Addition of P2 Stories

7. Complete **Phase 6** (US4) — Passenger manifest
8. Complete **Phase 7** (US5) — WhatsApp + PDF confirmations
9. Complete **Phase 8** (Polish) — Tests + build verification

---

## Notes

- `can_edit_catalog` already exists in `agents` table — do NOT add `can_edit_tours` (see `research.md` DR-005)
- The `Tour` interface in `src/types/index.ts` uses Spanish field names — must be aligned to DB schema in T006 before any UI task in Phase 3
- `src/data/tours.ts` (8 mock tours) is replaced by the Supabase query in T007 — do not import it in new components
- The `ReservationModal` `setTimeout` is a known mock (confirmed by research agent) — replaced entirely in T019
- PDF generation has a 5s Vercel Function limit — keep PDF simple (text-only, no heavy images)

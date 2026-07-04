# Tasks: Preparación para Producción

**Input**: Design documents from `/specs/007-production-readiness/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup & Foundational (Shared Infrastructure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T001 [P] Create Supabase migration `00006_organization_settings.sql` to implement the `organization_settings` table and RLS policies
- [x] T002 [P] Update `src/types/index.ts` adding the `OrganizationSettings` type
- [x] T003 Update `src/store/useAppStore.ts` (or create a new store) to load the `organization_settings` state

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Progressive Web App (PWA) (Priority: P1)

**Goal**: Convertir el frontend en PWA instalable para dispositivos móviles.

**Independent Test**: Can be fully tested by opening the site on a mobile device and verifying the "Add to Home Screen" prompt appears.

### Implementation for User Story 1

- [x] T004 Install `vite-plugin-pwa` package via npm
- [x] T005 [P] Add PWA icons (192x192 and 512x512) to the `public/` directory
- [x] T006 Update `vite.config.ts` configuring the VitePWA plugin with manifest and basic workbox settings
- [x] T007 Add `<link rel="manifest" href="/manifest.webmanifest">` and theme color meta tags to `index.html`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Pausar Actividad de Cuenta (Priority: P1)

**Goal**: Permitir al Administrador pausar las operaciones de la cuenta (consumo de Meta API) desde la interfaz.

**Independent Test**: Can be fully tested by an Admin pausing the account and verifying webhooks log a "paused" abort action.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create a UI module `src/pages/Settings/index.tsx` (if it doesn't exist) to render Organization Settings
- [x] T009 [US2] Add a toggle switch in `Settings` to change the `system_status` to 'paused'/'active' in Supabase
- [x] T010 [P] [US2] Create a global `SystemGuard` or `StatusBanner` component that shows an alert when `system_status` is 'paused'
- [x] T011 [US2] Update `api/webhook/whatsapp.ts` to query `organization_settings` and abort processing early if `system_status` is 'paused'

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 4 - Protección de Rate Limiting y Backups (Priority: P1)

**Goal**: Proteger los webhooks con limitación de tasa de solicitudes y verificar respaldos.

**Independent Test**: Can be fully tested by sending multiple requests to the webhook and verifying HTTP 429 Too Many Requests responses.

### Implementation for User Story 4

- [x] T012 [P] [US4] Create `src/lib/rateLimit.ts` containing basic in-memory rate limiting logic
- [x] T013 [US4] Update `api/webhook/whatsapp.ts` to invoke the rate limiter before processing incoming requests
- [x] T014 [US4] Manual Check: Verify Supabase automated backups are active in the project dashboard

**Checkpoint**: All P1 user stories should now be functional

---

## Phase 5: User Story 3 - Exportación Completa de Datos (Priority: P2)

**Goal**: Exportación completa de datos de la organización en CSV/JSON para el cliente.

**Independent Test**: Can be fully tested by clicking "Export Data" and verifying the downloaded JSON file contains actual CRM data.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create `src/lib/exportData.ts` with logic to fetch all tables (prospects, tours, reservations, messages) iteratively from Supabase
- [x] T016 [US3] Add a "Descargar Exportación Completa" button to `src/pages/Settings/index.tsx`
- [x] T017 [US3] Connect the button to trigger `exportData.ts` and generate a client-side JSON Blob download, handling loading states

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T018 Run `npm run build` to verify no TypeScript compilation errors exist
- [x] T019 Execute the quickstart.md validation steps manually to ensure End-to-End functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: BLOCKS all user stories that touch database or global state (US2, US3, US4).
- **User Stories (Phase 2-5)**: Can proceed in parallel once Phase 1 is complete.
- **Polish (Final Phase)**: Depends on all user stories being complete.

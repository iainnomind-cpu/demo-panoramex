# Tasks: Módulo de Campañas de WhatsApp

**Input**: Design documents from `/specs/005-campanas-whatsapp/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install PapaParse dependency via `npm install papaparse` and `npm install -D @types/papaparse` for CSV parsing in the frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create migration `supabase/migrations/00004_campanas_encuestas.sql` for `campaigns`, `campaign_sends`, `satisfaction_surveys` tables, alter `prospects` (add `birth_date`), and set all RLS policies
- [x] T003 [P] Update `src/types/index.ts` with `Campaign`, `CampaignSend`, `SatisfactionSurvey` interfaces and add `birth_date` to `Prospect`
- [x] T004 [P] Create `src/store/useCampaignStore.ts` for global state management of campaigns and fetching data from Supabase
- [x] T005 [P] Extract or adapt WhatsApp sending logic from the chatbot (Fase 3) into a shared utility `api/utils/whatsapp.ts` for reuse in campaigns and crons

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Creación y Envío de Campaña Segmentada (Priority: P1) 🎯 MVP

**Goal**: Permitir crear una campaña segmentada desde el CRM y enviarla por lotes controlando el throttling de Meta.

**Independent Test**: Crear una campaña seleccionando 2 prospectos y enviarla; verificar que se insertan en `campaign_sends` y se mandan sin saturar Vercel.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create Vercel serverless function `api/campaigns/send-batch.ts` to receive a batch of messages, handle Meta API throttling, and insert records into `campaign_sends`
- [x] T007 [P] [US1] Create `src/pages/Campaigns/index.tsx` for displaying the list of historical campaigns and their status
- [x] T008 [P] [US1] Create `src/pages/Campaigns/CampaignCreator.tsx` to handle segmentation (`tour_of_interest`, `status`) and batching logic to call `/api/campaigns/send-batch.ts`
- [x] T009 [US1] Add Campaigns route to `src/App.tsx` (or router configuration) and sidebar navigation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Envío a Listas Externas (Priority: P1)

**Goal**: Permitir cargar listas CSV de números externos al CRM para sumarlos al envío masivo.

**Independent Test**: Subir un archivo de prueba `.csv`, comprobar que se parsea rápido en el navegador y se envían los mensajes a través del endpoint por lotes.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update `src/pages/Campaigns/CampaignCreator.tsx` to include a file upload input and use PapaParse to parse the CSV and append numbers to the campaign target list
- [x] T011 [US2] Update webhook logic in `api/webhooks/whatsapp.ts` to intercept incoming messages from unknown numbers that exist in `campaign_sends`, automatically converting them to "New" Prospects

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Automatización de Cumpleaños (Priority: P2)

**Goal**: Disparar automáticamente una plantilla de feliz cumpleaños (con descuento) a prospectos cuyo cumpleaños es hoy.

**Independent Test**: Ejecutar el cron manualmente con un GET y verificar el envío a prospectos con fecha de hoy.

### Implementation for User Story 3

- [x] T012 [P] [US3] Create Vercel cron endpoint `api/cron/birthdays.ts` to query Supabase for prospects with today's `birth_date` and dispatch the birthday template
- [x] T013 [P] [US3] Create/Update `vercel.json` in the project root to register the `/api/cron/birthdays` schedule
- [x] T014 [US3] Update `src/pages/Prospects/ProspectDetail.tsx` (or similar) to include an editable `birth_date` field

**Checkpoint**: User stories 1, 2, and 3 functional

---

## Phase 6: User Story 4 - Encuesta de Satisfacción Post-Tour (Priority: P2)

**Goal**: Enviar una encuesta de botones interactivos al día siguiente del tour, y guardar el resultado numérico en base de datos.

**Independent Test**: Llamar manualmente al cron de encuestas y recibir la plantilla. Presionar el botón de "5 estrellas" y revisar la DB.

### Implementation for User Story 4

- [x] T015 [P] [US4] Create Vercel cron endpoint `api/cron/surveys.ts` to query `reservations` where `service_date` was yesterday, dispatching the survey template
- [x] T016 [P] [US4] Update `vercel.json` to register the `/api/cron/surveys` schedule
- [x] T017 [US4] Update webhook in `api/webhooks/whatsapp.ts` to detect interactive button replies for surveys and insert a record into the `satisfaction_surveys` table

**Checkpoint**: All automated crons and core features active

---

## Phase 7: User Story 5 - Monitoreo de Métricas por Campaña (Priority: P3)

**Goal**: Visualizar estadísticas de "enviados", "leídos", "respondidos" y "convertidos" por campaña.

**Independent Test**: Abrir la vista de detalle de una campaña y ver los contadores actualizarse.

### Implementation for User Story 5

- [x] T018 [P] [US5] Update webhook in `api/webhooks/whatsapp.ts` to process Meta `statuses` payloads (sent, delivered, read) and update the `status` column in `campaign_sends`
- [x] T019 [US5] Create `src/pages/Campaigns/CampaignDetail.tsx` to display real-time counters by aggregating data from `campaign_sends`

**Checkpoint**: Full visibility over campaign performance.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 Run quickstart.md validation manually to ensure end-to-end functionality of UI, Crons, and Webhooks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phase 3-7)**: Depend on Foundational phase
- **Polish (Final Phase)**: Depends on all user stories

### Within Each User Story

- Endpoints/crons marked [P] can be developed independently of the frontend UI
- UI components depend on the global state or endpoints

### Parallel Opportunities

- Vercel functions (`send-batch.ts`, `birthdays.ts`, `surveys.ts`) can be built in parallel.
- Webhook modifications (`whatsapp.ts`) can be parallelized since they intercept different payload types (buttons vs statuses vs text).
- Frontend views (`CampaignCreator`, `CampaignDetail`) can be developed simultaneously.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup + Foundational (T001-T005)
2. Complete US1 (T006-T009)
3. **STOP and VALIDATE**: Test basic campaign dispatching independently
4. Deploy to Vercel

### Incremental Delivery

1. Foundation ready
2. US1: Basic segmented campaigns (MVP)
3. US2: External CSV campaigns
4. US3: Birthday cron
5. US4: Post-tour survey cron
6. US5: Analytics dashboards

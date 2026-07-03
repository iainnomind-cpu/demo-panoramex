# Tasks: Chatbot IA Multicanal

**Input**: Design documents from `/specs/003-ai-chatbot-multicanal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize backend dependencies: `npm install openai`
- [x] T002 Update Database Types locally: run `supabase gen types typescript` (Placeholder until DB is migrated)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Create migration `supabase/migrations/00002_chatbot_schema.sql` per data-model.md (tables: `webhook_events`, `conversations`, `messages`, update `prospects`)
- [x] T004 [P] Implement Meta Webhook signature validation utility in `api/bot/crypto.ts`
- [x] T005 [P] Setup Supabase Admin client utility for Vercel functions in `api/bot/supabase.ts`
- [x] T006 [P] Update `src/lib/database.types.ts` with the new schema types

---

## Phase 3: User Story 1 - Flujo de Calificación Automática (Priority: P1) 🎯 MVP

**Goal**: El chatbot inicia flujo según el tour anunciado, califica (fecha, pax, nombre) y envía el flyer.

**Independent Test**: Simulate webhook incoming message and see LLM response in logs or via local proxy.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create Webhook entrypoint (GET/POST) in `api/webhook/whatsapp.ts`
- [x] T008 [P] [US1] Create tour flow configurations in `api/bot/flows.ts`
- [x] T009 [US1] Implement conversation state machine in `api/bot/state.ts` (depends on T005, T008)
- [x] T010 [US1] Implement OpenAI LLM integration in `api/bot/llm.ts` (depends on T009)
- [x] T011 [US1] Implement WhatsApp Cloud API message sender in `api/bot/whatsapp.ts`
- [x] T012 [US1] Wire everything in `api/webhook/whatsapp.ts` using `waitUntil` to process events async (T007 + T010 + T011)

---

## Phase 4: User Story 2 - Sistema de Semáforo y Re-enganche (Priority: P2)

**Goal**: Asignar semáforo, detectar abandonos y mandar re-enganche a las 3h y 24h.

**Independent Test**: Abandon a flow, trigger cron, and see re-engagement message sent.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Create Vercel Cron endpoint in `api/cron/reengagement.ts`
- [ ] T014 [US2] Add semáforo calculation logic in `api/bot/state.ts`
- [ ] T015 [US2] Implement query to find abandoned conversations and send re-engagement in `api/cron/reengagement.ts`
- [ ] T016 [US2] Update `vercel.json` to schedule the cron job hourly

---

## Phase 5: User Story 3 - Envío de Contenido Multimedia (Priority: P2)

**Goal**: Enviar imágenes y videos en el flujo en vez de solo texto.

**Independent Test**: Verify the bot sends the image media ID upon flow completion.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Add multimedia support (image/video payload format) to `api/bot/whatsapp.ts`
- [ ] T018 [US3] Update tour flow configurations in `api/bot/flows.ts` to include asset URLs/Media IDs
- [ ] T019 [US3] Send flyer automatically when flow completes in `api/bot/state.ts`

---

## Phase 6: User Story 4 - Ventana de 24 Horas de Meta (Priority: P1)

**Goal**: Respetar ventana de 24h y usar plantillas pre-aprobadas si expira.

**Independent Test**: Verify sending a message outside 24h uses template API format.

### Implementation for User Story 4

- [ ] T020 [P] [US4] Add timestamp check logic in `api/bot/whatsapp.ts` before sending messages
- [ ] T021 [US4] Implement WhatsApp template sender format in `api/bot/whatsapp.ts`
- [ ] T022 [US4] Update re-engagement cron (`api/cron/reengagement.ts`) to use template if >24h

---

## Phase 7: User Story 5 - Escalación a Agente Humano (Priority: P2)

**Goal**: Pausar el bot si hay frustración y notificar a agente.

**Independent Test**: Say "hablar con humano" and verify bot status changes to paused.

### Implementation for User Story 5

- [ ] T023 [P] [US5] Add system prompt instructions for intent detection (handoff/frustration) in `api/bot/llm.ts`
- [ ] T024 [US5] Add bot pause logic in `api/bot/state.ts` when handoff intent is detected
- [ ] T025 [US5] Skip bot processing in `api/webhook/whatsapp.ts` if conversation is paused

---

## Phase 8: User Story 6 - Registro de Canal de Origen (Priority: P1)

**Goal**: Registrar de dónde viene el prospecto (ad, orgánico).

**Independent Test**: Pass a payload with referral info and verify DB prospect update.

### Implementation for User Story 6

- [ ] T026 [P] [US6] Extract referral data from webhook payload in `api/webhook/whatsapp.ts`
- [ ] T027 [US6] Save `origin_channel` and `tour_of_interest` when creating new prospect in `api/bot/state.ts`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T028 [P] Add unit test for Meta Signature validation in `tests/api/crypto.test.ts`
- [ ] T029 [P] Update UI prospect cards to visually indicate bot vs human control (optional UI task)
- [ ] T030 Validate quickstart.md flows using cURL

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: MUST be completed first.
- **User Story 1 (Phase 3)**: MVP. Builds the core bot.
- **User Stories 2, 3, 4, 5, 6**: Can be developed independently or incrementally after Phase 3.

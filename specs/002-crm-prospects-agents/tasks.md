# Tasks: CRM Prospects & Agents

**Input**: Design documents from `/specs/002-crm-prospects-agents/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. Since this is an extension of the core foundation, setup is minimal.

- [x] T001 Initialize database type generation commands in `package.json` (if not already present).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create SQL migration `supabase/migrations/00001_crm_prospects_extension.sql` to extend `prospects` and add `interactions_timeline` with strict RLS policies.
- [x] T003 Update Supabase seed data in `supabase/seed.sql` to include sample interactions and extended prospect fields.
- [x] T004 Run Supabase types generation to update `src/lib/database.types.ts` with the new schema.
- [x] T005 [P] Update `src/types/index.ts` frontend types to match the new database schema.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Pipeline Management via Kanban & List (Priority: P1) 🎯 MVP

**Goal**: Agents can view all prospects and move them through pipeline states via drag-and-drop with Realtime syncing.

**Independent Test**: Scenario 1 from `quickstart.md` (Open two windows, drag prospect, see update in both).

### Implementation for User Story 1

- [x] T006 [US1] Extend `src/hooks/useProspects.ts` to include a Supabase Postgres Changes Realtime subscription on the `prospects` table.
- [x] T007 [US1] Create a mutation in `src/hooks/useProspects.ts` for updating a prospect's pipeline status.
- [x] T008 [US1] Update `src/pages/Prospects/KanbanBoard.tsx` to handle Realtime state and drag-and-drop logic wired to the new mutation.
- [x] T009 [US1] Update `src/pages/Prospects/ProspectList.tsx` to reflect the live data.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Prospect 360 Profile & Interactions (Priority: P1)

**Goal**: Agents can view a 360-degree modal of the prospect, showing the interaction timeline and allowing manual note creation.

**Independent Test**: Scenario 2 from `quickstart.md` (Add a note in 360 profile, verify it saves with timestamp and agent attribution).

### Implementation for User Story 2

- [ ] T010 [P] [US2] Create React Query hook `src/hooks/useInteractions.ts` for fetching the timeline for a specific prospect.
- [ ] T011 [P] [US2] Create mutation in `src/hooks/useInteractions.ts` for adding manual notes to the timeline.
- [ ] T012 [US2] Update `src/components/shared/Prospect360Modal.tsx` to display full prospect details (channel, tour_of_interest, desired_date, num_people).
- [ ] T013 [US2] Update `src/components/shared/Prospect360Modal.tsx` to display the interactions timeline.
- [ ] T014 [US2] Implement the UI for adding manual notes within `src/components/shared/Prospect360Modal.tsx` using the new mutation.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Admin Prospect Reassignment (Priority: P2)

**Goal**: Administrators can manually reassign prospects between agents using actions, leaving a secure audit trail.

**Independent Test**: Scenario 3 from `quickstart.md` (Admin reassigns, logs are created, standard agents are blocked).

### Implementation for User Story 3

- [ ] T015 [P] [US3] Create Vercel Serverless function `api/admin/auto-assign.ts` implementing the Round-Robin algorithm for new incoming leads.
- [ ] T016 [P] [US3] Update existing `api/admin/reassign-prospect.ts` to optionally write to `interactions_timeline` to notify the new agent of the reassignment.
- [ ] T017 [US3] Implement UI inside `src/components/shared/Prospect360Modal.tsx` strictly visible for `admin` role to trigger reassignment using the `useReassignProspect` hook.

**Checkpoint**: All P1 and P2 user stories are now independently functional

---

## Phase 6: User Story 4 - Prospect Activity Alerts & Traffic Lights (Priority: P2)

**Goal**: Agents visually see urgency via traffic lights (calculated by interest/time/date) and inactivity alerts.

**Independent Test**: Scenario 4 from `quickstart.md` (Red light appears on old prospect, turns Green when note is added).

### Implementation for User Story 4

- [ ] T018 [P] [US4] Create utility functions in `src/lib/prospect-status.ts` containing the business logic for calculating Traffic Light colors.
- [ ] T019 [P] [US4] Create utility functions in `src/lib/prospect-status.ts` containing the logic for Inactivity thresholds (N days varying by state).
- [ ] T020 [US4] Integrate Traffic Light UI indicators into `src/pages/Prospects/KanbanColumn.tsx` (prospect cards).
- [ ] T021 [US4] Integrate Inactivity Alerts UI into `src/pages/Prospects/ProspectList.tsx` and `KanbanColumn.tsx`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T022 [P] Clean up any remaining references to static mock data in `src/data/prospects.ts` and safely delete the file.
- [ ] T023 Run quickstart.md validation scenarios to ensure complete E2E functionality.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: BLOCKS all user stories. Must be completed first to establish the database schema.
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2.
- **US2 (P1)**: Depends on Phase 2. Can be developed in parallel with US1.
- **US3 (P2)**: Depends on Phase 2. Can be developed in parallel with US1 and US2.
- **US4 (P2)**: Depends on Phase 2. Can be developed in parallel, but relies on US1/US2 UI to render the visual indicators.

### Parallel Opportunities

- Once Phase 2 (Foundational) is complete, US1 and US2 can be assigned to different developers to work on simultaneously.
- Hook creation (e.g., `useInteractions.ts`, Serverless functions) can happen in parallel with UI implementation.
- Utility functions (e.g., `prospect-status.ts`) can be written entirely independently of the UI.

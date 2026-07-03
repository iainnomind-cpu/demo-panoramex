---
description: "Task list for Core Auth & DB feature implementation"
---

# Tasks: Core Auth & DB

**Input**: Design documents from `/specs/001-core-auth-db/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vercel serverless function structure (`/api/`)
- [x] T002 Initialize Supabase configuration directory (`/supabase/`)
- [x] T003 [P] Install `@supabase/supabase-js` and `@tanstack/react-query` in frontend
- [x] T004 [P] Setup Vercel environment variables configuration (`.env.local`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Setup database schema and migrations (`supabase/migrations/00000_core_auth.sql`) including RLS for `agents`, `org_settings`, `audit_log`, `prospects`
- [x] T006 Setup seed data for the 7 initial collaborators in `supabase/seed.sql`
- [x] T007 Implement Supabase Client in frontend (`src/lib/supabase.ts`)
- [x] T008 [P] Setup React Query Provider in frontend entry point (`src/main.tsx` or equivalent)
- [x] T009 [P] Implement Auth Zustand store for session state (`src/store/authStore.ts`)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Agent Login (Priority: P1) 🎯 MVP

**Goal**: Users can log into the system using their email and password.

**Independent Test**: Navigate to the login page and authenticate successfully with seed credentials.

### Implementation for User Story 1

- [x] T010 [US1] Create Login page component (`src/pages/Login.tsx`)
- [x] T011 [US1] Implement Route Guard component for authenticated access (`src/components/ProtectedRoute.tsx`)
- [x] T012 [US1] Update App routing to use the ProtectedRoute and Login components

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Role-Based Access Control (Priority: P1)

**Goal**: System restricts admin actions to 'admin' role while migrating prospect data reading to Supabase.

**Independent Test**: Log in as a standard agent and verify administrative controls are hidden/blocked.

### Implementation for User Story 2

- [x] T013 [P] [US2] Create serverless function for reassigning prospects (`api/admin/reassign-prospect.ts`) utilizing `service_role` and `audit_log`
- [x] T014 [P] [US2] Create React Query hook for fetching prospects (`src/hooks/useProspects.ts`)
- [x] T015 [US2] Update existing UI components to replace `src/data/` mock usage with `useProspects` hook
- [x] T016 [US2] Update existing UI components to hide Admin controls (like reassign) for standard agents based on `authStore` role

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - System Paused State (Priority: P2)

**Goal**: Display a "System Paused" screen when `org_settings` is inactive.

**Independent Test**: Admin pauses system, all active agent sessions redirect to Paused screen.

### Implementation for User Story 3

- [x] T017 [P] [US3] Create serverless function for toggling system status (`api/admin/system-status.ts`) utilizing `service_role` and `audit_log`
- [x] T018 [P] [US3] Create React Query hook for fetching and subscribing to `org_settings` (`src/hooks/useOrgSettings.ts`)
- [x] T019 [US3] Create "System Paused" screen component (`src/pages/SystemPaused.tsx`)
- [x] T020 [US3] Add Global System Status Guard component to wrap protected routes (`src/components/SystemGuard.tsx`)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 [P] Delete unused mock files in `src/data/`
- [x] T022 [P] Clean up any unused Zustand stores that were superseded by React Query
- [x] T023 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for Auth Session state
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for Auth Session state

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Serverless functions (api/*) and React Query hooks can be developed in parallel for US2 and US3

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

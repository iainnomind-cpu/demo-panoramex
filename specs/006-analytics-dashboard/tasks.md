# Tasks: Analytics Dashboard

**Input**: Design documents from `/specs/006-analytics-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Update `src/types/index.ts` with the new response types for the Analytics views and RPCs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create Supabase migration `00005_analytics_views.sql` to implement the Views and RPCs defined in `data-model.md`
- [x] T003 Create `src/store/useAnalyticsStore.ts` to fetch and cache data from Supabase for all dashboard components

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time KPI and Funnel Monitoring (Priority: P1) 🎯 MVP

**Goal**: View real-time KPIs and a sales funnel based on live data from all CRM modules.

**Independent Test**: Can be fully tested by verifying that creating a new lead updates the dashboard KPIs and Funnel instantly.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `src/pages/Analytics/KpiCards.tsx` to display real-time metrics
- [x] T005 [P] [US1] Create `src/pages/Analytics/FunnelChart.tsx` using Recharts for the sales funnel
- [x] T006 [US1] Create main view `src/pages/Analytics/index.tsx` assembling KPIs and Funnel
- [x] T007 [US1] Add Analytics route to `src/App.tsx` (or router configuration) and sidebar navigation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Agent and Channel Conversion Reports (Priority: P2)

**Goal**: Analyze conversion rates broken down by agent, by tour, and by origin channel.

**Independent Test**: Can be fully tested by viewing the Agent Performance and Origin Channel charts and ensuring they accurately reflect historical data.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/pages/Analytics/ConversionCharts.tsx` utilizing the RPCs for Agent/Tour/Channel aggregation
- [x] T009 [US2] Integrate `ConversionCharts` into the main `src/pages/Analytics/index.tsx` dashboard view

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Bot Qualification and Survey Aggregation (Priority: P2)

**Goal**: See the AI Bot qualification rate versus human handoff rate, along with aggregated results from post-tour satisfaction surveys.

**Independent Test**: Can be fully tested by verifying that survey rating averages and bot handoff rates match the raw data in the database.

### Implementation for User Story 3

- [x] T010 [P] [US3] Create `src/pages/Analytics/BotPerformance.tsx` to display bot qualification vs handoff rate and average survey ratings
- [x] T011 [US3] Integrate `BotPerformance` into the main `src/pages/Analytics/index.tsx` dashboard view

**Checkpoint**: All user stories 1, 2 and 3 should now be independently functional

---

## Phase 6: User Story 4 - Meta API Consumption Panel & Export (Priority: P3)

**Goal**: Track monthly WhatsApp API interactions against our limit, and export reports to PDF/Excel.

**Independent Test**: Can be fully tested by downloading a PDF/Excel report and verifying the data matches the view, and checking the progress bar for Meta API usage.

### Implementation for User Story 4

- [x] T012 [P] [US4] Create `src/pages/Analytics/ExportPanel.tsx` adding buttons to trigger client-side export (PDF/Excel) and display Meta Consumption progress
- [x] T013 [US4] Integrate `ExportPanel` into the main `src/pages/Analytics/index.tsx` dashboard view

**Checkpoint**: All primary user stories implemented

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Run quickstart.md validation manually to ensure end-to-end functionality of the Analytics Dashboard

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3) or in parallel.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- The creation of the individual React components (`KpiCards`, `FunnelChart`, `ConversionCharts`, `BotPerformance`, `ExportPanel`) can happen in parallel once the Foundation is ready.

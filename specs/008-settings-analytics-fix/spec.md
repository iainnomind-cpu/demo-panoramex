# Feature Specification: Settings Analytics & Realtime Fixes

**Feature Branch**: `008-settings-analytics-fix`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "el modulo de ajustes da error kxvqtlwinsknfmiumwur.supabase.co/rest/v1/view_analytics_bot_performance... Uncaught Error: cannot add `postgres_changes` callbacks for realtime:org_settings_changes after `subscribe()`."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Analytics in Settings (Priority: P1)

As an admin, I want to view analytics in the Settings module so that I can understand system performance without encountering 404 errors.

**Why this priority**: The settings page is currently broken and throwing 404s, preventing users from seeing key analytics.

**Independent Test**: Can be fully tested by opening the Settings module and verifying that no 404 network errors appear in the console.

**Acceptance Scenarios**:

1. **Given** I navigate to Settings, **When** the page loads, **Then** all analytics views successfully return data.

---

### User Story 2 - Realtime Organization Settings (Priority: P1)

As an agent or admin, I want the system status changes (paused/active) to sync in realtime without crashing the application.

**Why this priority**: The app currently crashes in development (React StrictMode) due to a Supabase realtime subscription bug (`cannot add postgres_changes callbacks...`).

**Independent Test**: Can be fully tested by loading the app in development mode and ensuring no `Uncaught Error` appears in the console.

**Acceptance Scenarios**:

1. **Given** I open the app, **When** the React hooks initialize, **Then** the realtime subscriptions connect successfully without throwing a callback error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have all `view_analytics_*` SQL views and RPC functions available in the remote production Supabase database.
- **FR-002**: System MUST subscribe to realtime updates on `org_settings` using unique channel identifiers to prevent callback collisions during React StrictMode re-renders.
- **FR-003**: System MUST subscribe to realtime updates on `prospects` using unique channel identifiers to prevent callback collisions.

### Key Entities

- **Analytics Views**: Read-only SQL views that aggregate system metrics (funnel, bot performance, consumption).
- **Realtime Channel**: Websocket connection to Supabase for push-based updates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 network 404 errors when loading the settings page.
- **SC-002**: 0 uncaught realtime subscription errors in the browser console upon application load.

## Assumptions

- The backend SQL migrations defining the views (e.g. `00005_analytics_views.sql`) already exist in the codebase but were not applied to the user's remote Supabase project.
- The realtime error is caused by React 18 StrictMode reusing the same string channel name across fast mount/unmount cycles.

# Feature Specification: UI Completeness & Backend Wiring

**Feature Branch**: `009-ui-completeness-wiring`

**Created**: 2026-07-12

**Status**: Draft

**Input**: Audit of 42 source files — 28 issues identified across 10 modules.

---

## Overview

A deep audit of the Panoramex CRM frontend revealed **28 issues** across 10 modules including: buttons with no `onClick` handlers, fake `setTimeout` API simulations, completely disconnected static mock data, and hardcoded placeholder values. This spec defines the remediation work required to make the application functionally complete and production-ready.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Book a Reservation from 360 View or Conversation (Priority: P1)

As an agent, I want to open a reservation form pre-filled with prospect data when I click "Reservar" or "Convertir a Reserva" so that I can create bookings without re-typing information.

**Why this priority**: The reservation flow is the primary revenue action in the CRM. Currently every entry point to it (Prospect 360 Modal, Conversation panel) is a dead button.

**Independent Test**: Click "Reservar" in the Prospect 360 modal — ReservationModal opens with the prospect's name and phone pre-filled.

**Acceptance Scenarios**:

1. **Given** I have a prospect open in the 360 Modal, **When** I click "Reservar", **Then** the ReservationModal opens pre-filled with the prospect's name and phone number.
2. **Given** I am in a Conversation and see the prospect panel, **When** I click "Convertir a Reserva", **Then** the ReservationModal opens with the associated prospect's data.
3. **Given** I fill in the ReservationModal form and click submit, **Then** the reservation is persisted to Supabase (not simulated with setTimeout), a success toast appears, and the reservation appears in the Reservations table.

---

### User Story 2 — View and Manage Reservations (Priority: P1)

As an agent, I want to see all reservations fetched from Supabase, create new ones, and export the list so that I can manage confirmed bookings.

**Why this priority**: The Reservations page currently shows an empty table always — no data is ever loaded.

**Independent Test**: Navigate to /reservations — the table shows real reservations from Supabase without any manual action.

**Acceptance Scenarios**:

1. **Given** I navigate to Reservations, **When** the page loads, **Then** all reservations from Supabase are displayed.
2. **Given** reservations are displayed, **When** I click "Nueva Reserva", **Then** the ReservationModal opens.
3. **Given** reservations are displayed, **When** I click "Exportar CSV", **Then** a CSV file is downloaded with the current visible data.
4. **Given** I click more_vert on a reservation row, **Then** a context menu appears with actions (view, mark paid, cancel).

---

### User Story 3 — Send a Campaign from Draft State (Priority: P1)

As an admin, I want to click "Enviar" on a draft campaign so that I can trigger a WhatsApp broadcast to the campaign's audience.

**Why this priority**: The "Enviar" button is the entire point of the Campaigns module — it currently calls only `e.stopPropagation()`.

**Independent Test**: Click "Enviar" on a draft CampaignCard — a confirmation dialog appears, and on confirm the campaign send process is triggered.

**Acceptance Scenarios**:

1. **Given** a campaign is in Draft status, **When** I click "Enviar", **Then** a confirmation modal asks me to verify before sending.
2. **Given** I confirm the send, **Then** the campaign status updates to "sending" and the existing `/api/campaigns/send-batch` endpoint is called.

---

### User Story 4 — Correct Logged-In User Displayed in TopBar (Priority: P2)

As any authenticated user, I want to see my own name, role, and initials in the top navigation bar so that the app feels personalized and correct.

**Why this priority**: The hardcoded "Cianya López" name makes the app feel broken and untested for any user other than one person.

**Independent Test**: Log in as any agent — the TopBar shows their actual name, role, and correct initials.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view the top navigation, **Then** my name and role from `useAuthStore().agent` are displayed, not hardcoded strings.

---

### User Story 5 — Functional Quick Actions on Prospect 360 (Priority: P2)

As an agent, I want "Llamar" and "Enviar Email" buttons in the 360 modal to actually initiate those actions so that I can contact prospects without copy-pasting data.

**Why this priority**: These are quick-win CTA buttons that currently do nothing and reduce trust in the product.

**Independent Test**: Click "Llamar" — a `tel:` link action is triggered with the prospect's phone. Click "Enviar Email" — a `mailto:` link action is triggered.

**Acceptance Scenarios**:

1. **Given** I view a prospect's 360 modal, **When** I click "Llamar", **Then** the device initiates a phone call to the prospect's number (via `tel:` link).
2. **Given** I view a prospect's 360 modal, **When** I click "Enviar Email", **Then** the default email client opens a new email to the prospect's email (via `mailto:` link).

---

### User Story 6 — Real-Time TopBar User Data (Priority: P2)

As an admin or agent, I want all layout chrome (TopBar name, notifications bell, search bar) to either be functional or have honest "coming soon" state so that I am not misled.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I look at the TopBar, **Then** I see my actual name and role.
2. **Given** the notifications bell has no backend yet, **When** I see it, **Then** it has a clear "coming soon" disabled state instead of being a silently broken button.

---

### Edge Cases

- What happens if the prospect has no email when "Enviar Email" is clicked? → Button should be disabled or show a tooltip.
- What happens if `createReservation` fails (Supabase error)? → Error toast shown, modal stays open.
- What if a campaign audience is 0 contacts when sending? → Block send with a clear validation message.
- What if `reservations` table does not exist in Supabase (migration not run)? → Show an empty state with a migration hint in dev, graceful error in prod.

---

## Requirements *(mandatory)*

### Functional Requirements

**Reservations Module**
- **FR-RES-001**: System MUST load all reservation records from Supabase on page load.
- **FR-RES-002**: System MUST allow users to create a new reservation via a modal form with controlled inputs bound to state.
- **FR-RES-003**: ReservationModal MUST write to Supabase on submit (no setTimeout simulation).
- **FR-RES-004**: ReservationModal MUST accept optional pre-fill props (prospectName, prospectPhone) to auto-populate form fields.
- **FR-RES-005**: "Exportar CSV" button MUST download a real CSV file of the visible reservation data.
- **FR-RES-006**: Each reservation row's "more_vert" button MUST open a context menu with at minimum: "Ver detalle", "Marcar pagada", "Cancelar".

**Prospect 360 Modal**
- **FR-P360-001**: "Reservar" button MUST open ReservationModal pre-filled with the current prospect's data.
- **FR-P360-002**: "Llamar" button MUST trigger a `tel:` link with the prospect's phone number.
- **FR-P360-003**: "Enviar Email" button MUST trigger a `mailto:` link with the prospect's email. If no email, button is disabled.

**Conversations Module**
- **FR-CONV-001**: "Convertir a Reserva" button MUST open ReservationModal pre-filled with the conversation's associated prospect data.
- **FR-CONV-002**: "Ver Perfil Completo" button MUST open the Prospect 360 Modal for the associated prospect.

**Campaigns Module**
- **FR-CAMP-001**: "Enviar" button on a Draft campaign card MUST open a confirmation dialog before triggering the send action.
- **FR-CAMP-002**: On confirmation, the send action MUST call `/api/campaigns/send-batch` and update the campaign status.

**Layout**
- **FR-LAY-001**: TopBar MUST display the logged-in agent's name, role, and initials from `useAuthStore().agent` — no hardcoded values.
- **FR-LAY-002**: The notifications bell button MUST have an accessible `disabled` state with a tooltip "Notificaciones próximamente" until the feature is built.

**Analytics**
- **FR-ANA-001**: "Exportar Excel" and "Exportar PDF" buttons MUST either generate and download real files (using a library) or be replaced with an honest "coming soon" state. Console.log + alert() is not acceptable.

### Key Entities

- **Reservation**: A confirmed booking. Fields: id, prospect_id, tour_id, date, num_people, status, total_price, created_at.
- **Campaign**: A WhatsApp broadcast message. Existing table — status field must transition from `draft → sending → completed`.
- **Agent**: Authenticated user record from `agents` table, surfaced via `useAuthStore().agent`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 buttons across the entire application have no `onClick` handler (except explicitly disabled ones with a tooltip).
- **SC-002**: 0 `setTimeout` calls simulating API behavior in production code.
- **SC-003**: 0 hardcoded user names, email addresses, or placeholder strings in layout components.
- **SC-004**: The Reservations table loads real data from Supabase on page entry.
- **SC-005**: Creating a reservation via the modal results in a persisted Supabase row verifiable via the Supabase dashboard.
- **SC-006**: Clicking "Enviar" on a Draft campaign results in the campaign status changing to "sending" in the database.

---

## Assumptions

- The `reservations` table already exists in Supabase (from a prior migration) or will be created as part of this work.
- The WhatsApp send batch API endpoint (`/api/campaigns/send-batch`) is already implemented and working.
- `@react-pdf/renderer` (already in package.json) can be leveraged for PDF export.
- A lightweight CSV export can be implemented client-side without additional dependencies.
- The `agents` table and `useAuthStore` already expose the correct user record after login.
- Automated survey/birthday campaign automation scheduling is **out of scope** for this feature — only the "Enviar" button fix for broadcast campaigns is in scope.

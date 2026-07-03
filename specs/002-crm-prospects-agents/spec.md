# Feature Specification: CRM Prospects & Agents Module

**Feature Branch**: `[002-crm-prospects-agents]`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir el módulo de CRM de prospectos y gestión de agentes sobre la base ya creada en la fase de fundación..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pipeline Management via Kanban & List (Priority: P1)

Agents can view all prospects in the system through a Kanban board or a list view, moving them through predefined pipeline states to track sales progress.

**Why this priority**: Core CRM functionality; visual pipeline management is essential for daily sales operations.

**Independent Test**: Can be tested by dragging a prospect from "Nuevo" to "Calificado" and verifying the state updates correctly across both Kanban and list views.

**Acceptance Scenarios**:

1. **Given** an agent views the Kanban board, **When** they drag a prospect to a new column, **Then** the prospect's status is updated to match the column.
2. **Given** an agent is in the list view, **When** they apply filters (e.g., by tour or state), **Then** only matching prospects are displayed.

---

### User Story 2 - Prospect 360 Profile & Interactions (Priority: P1)

Agents can click on any prospect to open a 360-degree profile modal containing full contact details, chronological interaction history, and manual notes, enabling rapid context gathering and actions.

**Why this priority**: Essential for understanding customer context before engaging in sales conversations.

**Independent Test**: Can be tested by opening the 360 modal for a prospect, adding a manual note, and verifying it appears in the chronological timeline.

**Acceptance Scenarios**:

1. **Given** a prospect in the Kanban board, **When** an agent clicks on them, **Then** the 360 profile modal opens with full details and timeline.
2. **Given** the 360 profile is open, **When** the agent adds a manual note, **Then** the note is appended to the prospect's history with the agent's name and timestamp.

---

### User Story 3 - Admin Prospect Reassignment (Priority: P2)

Administrators can manually reassign prospects between agents using drag-and-drop or actions, leaving a secure audit trail, ensuring fair distribution and continuity of service.

**Why this priority**: Critical for team management, though not strictly required for an individual agent to process leads.

**Independent Test**: Can be tested by an admin reassigning a prospect, verifying the new agent sees the full history, and checking that the action is logged in the audit trail.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they reassign a prospect to a new agent, **Then** the new agent sees the entire conversation history without gaps.
2. **Given** an agent user, **When** they attempt to reassign a prospect, **Then** the action is blocked or hidden from the UI.
3. **Given** a successful reassignment, **When** checking the system logs, **Then** an audit entry is created recording the admin, the prospect, the old agent, and the new agent.

---

### User Story 4 - Prospect Activity Alerts & Traffic Lights (Priority: P2)

Agents visually see the urgency of prospects via a traffic light system and inactivity alerts, helping them prioritize their daily followup tasks.

**Why this priority**: Improves agent efficiency and reduces lead leakage.

**Independent Test**: Can be tested by verifying a prospect with no activity for N days displays the correct inactivity alert and traffic light color.

**Acceptance Scenarios**:

1. **Given** a prospect has been inactive for the configured threshold, **When** the agent views the prospect, **Then** an inactivity alert is displayed.
2. **Given** a prospect's state, **When** viewed in the list or Kanban, **Then** the correct traffic light color (green/yellow/red) is shown based on SLA rules.

---

### Edge Cases

- What happens when an admin reassigns a prospect while the original agent is actively typing a note in the 360 modal?
- How does the system handle concurrent updates if two agents try to move the same prospect in the Kanban board simultaneously?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-SEC-001**: System MUST enable Row Level Security (RLS) for all new Supabase tables immediately (Constitution principle).
- **FR-SEC-002**: System MUST NOT expose API keys in frontend code; all privileged calls via Vercel serverless (Constitution principle).
- **FR-AUD-001**: System MUST log all sensitive write operations (like prospect reassignment) in `audit_log` (Constitution principle).
- **FR-001**: System MUST allow all agents to view all prospects and conversations without privacy restrictions.
- **FR-002**: System MUST support the following pipeline states: Nuevo → Calificado → En Cotización → Reservado → Convertido → Perdido.
- **FR-003**: System MUST support manual prospect creation for leads originating from phone calls.
- **FR-004**: System MUST allow exporting filtered prospect lists to Excel.
- **FR-005**: System MUST display an agent workload indicator and activity log.
- **FR-006**: System MUST restrict prospect reassignment strictly to users with the 'admin' role.
- **FR-007**: System MUST automatically assign new prospects using a Round-Robin algorithm among the agents who are enabled/authorized for the prospect's specific tour of interest.
- **FR-008**: System MUST display a traffic light indicator (green/yellow/red) for prospects calculated dynamically by analyzing the conversation's level of interest, the time elapsed since the last contact, and the proximity to the desired tour date.
- **FR-009**: System MUST trigger alerts when a prospect has been inactive for N days, where N varies depending on the current pipeline state (e.g., faster alerts for "Nuevo", slower for "Cotización").

### Key Entities

- **Prospect**: The core entity representing a potential customer. Attributes include name, phone, origin channel, tour of interest, desired date, number of people, current status, tags, traffic light status, and assigned agent.
- **Interaction/Note**: An entry in the prospect's chronological timeline. Can be an automated event (e.g., state change) or a manual note added by an agent.
- **Agent Workload**: Aggregate data representing an agent's current active prospects and recent activity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System reflects real-time Kanban state changes across all connected clients within 2 seconds.
- **SC-002**: The 360 profile modal loads complete prospect history and details in under 1 second.
- **SC-003**: 100% of prospect reassignments result in a corresponding, immutable `audit_log` entry.
- **SC-004**: Agents can filter a list of 10,000 prospects by status and tour type in under 2 seconds.

## Assumptions

- Excel export functionality will generate standard `.xlsx` files based on the current active UI filters.
- Real-time updates for Kanban drag-and-drop will utilize the existing Supabase Realtime infrastructure.
- The traffic light system and inactivity alerts will be calculated dynamically on the client side based on timestamps stored in the database, avoiding the need for continuous backend cron jobs to update statuses.

# Feature Specification: Core Auth & DB

**Feature Branch**: `001-core-auth-db`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Construir la base de datos, autenticación y control de acceso del sistema Panoramex, sobre la cual se construirán los 6 módulos del CRM..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agent Login (Priority: P1)

Users can log into the system using their email and password.

**Why this priority**: Authentication is the prerequisite for all other interactions with the CRM.

**Independent Test**: Can be tested by navigating to the login page and providing valid credentials for an existing agent, successfully accessing the protected area.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on the login page, **When** they enter correct credentials, **Then** they are redirected to the main dashboard.
2. **Given** an unauthenticated user on the login page, **When** they enter invalid credentials, **Then** an error message is displayed and they are not logged in.

---

### User Story 2 - Role-Based Access Control (Priority: P1)

The system restricts certain actions (reassigning prospects, pausing the system) to users with the 'admin' role, while allowing all agents to view prospect data.

**Why this priority**: Essential for data security and adhering to the non-negotiable constitution principles regarding permissions.

**Independent Test**: Can be tested by logging in as a standard agent and verifying that administrative controls (reassign, pause system) are not accessible or block the action.

**Acceptance Scenarios**:

1. **Given** a logged-in 'agent', **When** they attempt to reassign a prospect, **Then** the action is denied.
2. **Given** a logged-in 'admin', **When** they attempt to reassign a prospect, **Then** the action succeeds and is logged in the audit log.
3. **Given** any logged-in user (admin or agent), **When** they view prospect or conversation data, **Then** all data across the organization is visible.

---

### User Story 3 - System Paused State (Priority: P2)

When the organization settings indicate the system is inactive, users should see a "paused system" screen and be prevented from performing regular CRM tasks.

**Why this priority**: Required for handling downtime, maintenance, or quota limits gracefully.

**Independent Test**: Can be tested by having an admin pause the system and verifying that the UI updates to show the paused state screen for all active sessions.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the organizational state changes to inactive, **Then** the user is redirected to the "System Paused" screen.
2. **Given** a logged-in 'admin' on the "System Paused" screen, **When** they choose to activate the system, **Then** the organizational state changes to active and the dashboard becomes accessible again.

---

### Edge Cases

- What happens when a user attempts to edit the tour catalog without the explicit configurable flag, regardless of their 'admin' or 'agent' role?
- How does the system handle concurrent updates to the organizational settings by two different admins?
- What happens if the system is paused while a user is actively typing a message to a prospect?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-SEC-001**: System MUST enable Row Level Security (RLS) for all new tables immediately to protect prospect and reservation data.
- **FR-SEC-002**: System MUST NOT expose API keys in frontend code; all external communication MUST be routed through serverless backend functions.
- **FR-AUD-001**: System MUST log all sensitive write operations (reassigning prospects, changing system state, editing tours) with the user ID and timestamp.
- **FR-001**: System MUST authenticate the 7 initial collaborators (5 agents, 2 admins) using email and password.
- **FR-002**: System MUST enforce that ONLY 'admin' users can reassign prospects.
- **FR-003**: System MUST enforce that ONLY 'admin' users can activate/pause the system.
- **FR-004**: System MUST allow any user with the 'can_edit_catalog' flag to edit the tour catalog, independent of their primary role.
- **FR-005**: System MUST allow all logged-in users to view all prospect and conversation data (no privacy between agents).
- **FR-006**: System MUST replace existing mock data connections in the frontend with real database calls while maintaining the existing UI functionality and look-and-feel.
- **FR-007**: System MUST provide a login screen, route guards for protected pages, and a dedicated "System Paused" screen.

### Key Entities *(include if feature involves data)*

- **Agent**: Represents internal users. Contains role (admin/agent) and configurable permissions (e.g., can edit catalog).
- **Organization Settings**: Represents organizational state, including active/paused status and contracted message limits.
- **Audit Log**: Records sensitive actions performed by users, including the action type, user ID, target entity, and timestamp.
- **Prospect**: Represents a potential client. Requires policies for read access by all agents and reassignment logic by admins.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the mock data calls in the frontend are successfully replaced with real database queries.
- **SC-002**: Unauthenticated users cannot access any protected route or data.
- **SC-003**: Standard agents are blocked from performing admin-only actions (0% success rate on unauthorized actions).
- **SC-004**: System Paused screen displays immediately upon state change in organizational settings.

## Assumptions

- We assume the existing UI is fully built out with mock data and the transition to real API calls will not require significant redesign of the components themselves.
- The 7 initial collaborators will be manually created by the administrator before the system goes live.

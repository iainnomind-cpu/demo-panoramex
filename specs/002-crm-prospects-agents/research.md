# Research: CRM Prospects & Agents

## Goal
Resolve technical approaches for the Prospect Kanban, 360 Profile, and Realtime synchronization using Supabase.

## Findings

### 1. Supabase Realtime for Kanban
- **Decision**: Use Supabase Postgres Changes to listen for `UPDATE`, `INSERT`, and `DELETE` events on the `prospects` table.
- **Rationale**: The user explicitly requested live updates without refreshing. React Query cache invalidation triggered by a Realtime subscription is the standard and most robust pattern for this stack, identical to how `org_settings` was handled in the foundation phase.
- **Alternatives considered**: Polling (rejected due to inefficiency and latency), WebSockets custom server (rejected due to fixed stack).

### 2. RLS Policies for Interactions and Prospects
- **Decision**: 
  - `prospects` & `interactions_timeline`: `SELECT` policy open to all `authenticated` users (agents). `INSERT` open to all agents for creating leads/notes. 
  - `prospects.assigned_to`: `UPDATE` strictly restricted. Standard agents can update prospect state/notes but cannot update the `assigned_to` field directly. This will be enforced by routing reassignments through a Vercel Serverless function (`/api/admin/reassign-prospect`) which checks the `admin` role and uses the `service_role` key.
- **Rationale**: Aligns exactly with the Constitution's mandate for RLS from day 1 and the specific user request for open read access but restricted reassignment.

### 3. Traffic Light and Inactivity Alert Calculation
- **Decision**: Calculate the traffic light state dynamically on the client (frontend) based on `prospects.created_at`, `interactions_timeline` (last contact), and `prospects.tour_date`.
- **Rationale**: Avoids the need for a backend cron job continuously updating rows in the database. The React UI can compute the color (Green/Yellow/Red) and the inactivity alert (N days varying by pipeline state) on the fly when rendering the list or Kanban.

### 4. Assignment Algorithm (Round-Robin)
- **Decision**: Implement a Postgres Edge Function or a Vercel Serverless function to handle incoming new leads (e.g., from WhatsApp webhook). The function will query the last assigned agent for the specific tour type and assign the next available agent.
- **Rationale**: Round-robin requires maintaining state (who was the last agent assigned). This can be stored in a lightweight config table or computed dynamically by ordering recent assignments. Server-side execution ensures no race conditions.

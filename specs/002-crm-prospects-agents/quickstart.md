# Validation Guide: CRM Prospects & Agents

## Scenario 1: Verify Open Read Access & Kanban Realtime
1. Open two browser windows. Log into Window 1 as `admin1@panoramex.mx` and Window 2 as `asesor1@panoramex.mx`.
2. Both users navigate to the **Prospects** (Kanban) view.
3. Verify both users see the exact same list of prospects (No privacy restrictions).
4. In Window 1, drag a prospect from "Nuevo" to "Calificado".
5. Verify that in Window 2, the prospect moves automatically to "Calificado" without needing a page refresh (Supabase Realtime is working).

## Scenario 2: Validate 360 Profile & Interactions Timeline
1. As an agent, click on any prospect in the Kanban board to open the 360 Profile modal.
2. In the "Notas" or "Timeline" section, add a manual note: "Cliente prefiere que le marquemos en la tarde."
3. Close the modal, then reopen it. Verify the note is present, attributed to your agent name, and timestamped correctly.
4. Verify you can see the prospect's `origin_channel`, `tour_of_interest`, `desired_date`, and `num_people`.

## Scenario 3: Enforce Admin-Only Reassignment
1. As `asesor1@panoramex.mx` (standard agent), open the 360 Profile of a prospect assigned to another agent.
2. Verify the "Reasignar" (Reassign) button/dropdown is either hidden or disabled.
3. Log in as `admin1@panoramex.mx` (admin) and open the same prospect.
4. Use the Reassign feature to assign the prospect to `asesor2@panoramex.mx`.
5. Verify the assignment updates successfully and the new agent is reflected in the UI.
6. Verify an entry was created in the `audit_log` table for this `REASSIGN_PROSPECT` action.

## Scenario 4: Dynamic Traffic Light & Inactivity Alerts
1. Using the Supabase Dashboard, manually edit a prospect's `last_activity_at` to be 5 days in the past, and set their status to "Nuevo".
2. In the CRM frontend, verify that this prospect shows a Red traffic light and an Inactivity Alert (since "Nuevo" threshold is exceeded).
3. Open their 360 profile and add a new manual note.
4. Verify the traffic light immediately turns Green and the inactivity alert disappears (because `last_activity_at` was updated).

# Quickstart & Validation Guide: Core Auth & DB

## Prerequisites
- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)
- Vercel CLI installed (`npm install -g vercel`)
- `.env.local` configured with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Backend only)

## Setup Steps
1. **Database Initialization**:
   - Run `supabase start` (if local) or deploy migrations to remote.
   - Run `supabase db reset` to apply schemas and seed the 7 initial collaborators.

2. **Frontend Setup**:
   - `npm install`
   - `npm run dev`

## Validation Scenarios

### Scenario 1: Authentication & Layout
1. Navigate to `http://localhost:5173`.
2. Observe redirection to `/login`.
3. Enter valid agent credentials.
4. Verify redirection to the dashboard and global layout.

### Scenario 2: Admin Access Control
1. Log in as an admin user.
2. Verify that the "Reassign Prospect" button is visible and functional.
3. Log out, then log in as a standard agent.
4. Verify that the "Reassign Prospect" button is hidden or disabled, and calling `/api/admin/reassign-prospect` directly returns 403 Forbidden.

### Scenario 3: System Paused State
1. As an admin, toggle the system state to "Paused".
2. Open a second browser window as a standard agent.
3. Verify the agent is immediately redirected to a "System Paused" screen and cannot access prospect data.
4. Verify the `audit_log` table in Supabase contains a record of the system state change.

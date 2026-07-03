# Data Model: CRM Prospects & Agents

## 1. `prospects` (Extended)
The core table already exists, but we need to alter it to include new fields for the CRM.
*Migration required: `00001_crm_prospects_extension.sql`*

### Schema Additions:
- `origin_channel` (TEXT): e.g., 'whatsapp', 'phone', 'web'.
- `tour_of_interest` (TEXT): Identifier for the specific tour.
- `desired_date` (DATE): When the customer wants to take the tour.
- `num_people` (INTEGER): Number of passengers.
- `tags` (TEXT[]): Array of tags for categorization.
- `last_activity_at` (TIMESTAMPTZ): Updated on any interaction, used to calculate inactivity alerts.

### RLS Policies (Already mostly in place from 00000_core_auth):
- **SELECT**: `true` for `authenticated` (all agents see all prospects).
- **INSERT**: `true` for `authenticated` (agents can manually create phone leads).
- **UPDATE**: 
  - Standard agents can update status, notes, tags, etc.
  - Updating `assigned_to` requires `admin` role (enforced via Vercel serverless `service_role` and blocked at RLS level for standard authenticated users).

## 2. `interactions_timeline` (New)
Chronological log of all interactions with a prospect. Replaces local UI state with a persistent, auditable history.
*Migration required: `00001_crm_prospects_extension.sql`*

### Schema:
- `id` (UUID, Primary Key)
- `prospect_id` (UUID, Foreign Key to `prospects.id`)
- `agent_id` (UUID, Foreign Key to `agents.id`, nullable for system events)
- `interaction_type` (TEXT): e.g., 'note', 'status_change', 'whatsapp_msg', 'email', 'call'.
- `content` (TEXT): The actual note, message, or description.
- `metadata` (JSONB): Any extra context (e.g., old_status -> new_status).
- `created_at` (TIMESTAMPTZ): Defaults to `NOW()`.

### RLS Policies:
- **SELECT**: `true` for `authenticated` (all agents see all histories).
- **INSERT**: `true` for `authenticated` (agents can add manual notes and log calls).
- **UPDATE**: `false` for `authenticated` (interactions are an immutable append-only log).
- **DELETE**: `false` for `authenticated`.

## 3. Realtime Considerations
- `prospects`: Enabled for Realtime. React clients will subscribe to this to drive the Kanban board drag-and-drop updates.
- `interactions_timeline`: Can optionally be enabled for Realtime to live-update the 360 profile if multiple agents are viewing it.

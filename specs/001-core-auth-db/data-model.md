# Data Model: Core Auth & DB

## Entities & Tables

### 1. `agents` (Extends Supabase Auth `auth.users`)
- **Fields**:
  - `id` (UUID, Primary Key, references `auth.users.id`)
  - `email` (String, unique)
  - `full_name` (String)
  - `role` (Enum: 'admin', 'agent')
  - `can_edit_catalog` (Boolean, default: false)
  - `created_at` (Timestamp)
- **RLS Policies**:
  - Read: All authenticated users can read.
  - Write: Only `admin` role or `service_role` can insert/update.

### 2. `org_settings`
- **Fields**:
  - `id` (Integer, Primary Key, ideally single-row table)
  - `system_status` (Enum: 'active', 'paused', default: 'active')
  - `message_limit` (Integer)
  - `messages_used` (Integer)
  - `updated_at` (Timestamp)
- **RLS Policies**:
  - Read: All authenticated users can read.
  - Write: Only `admin` role or `service_role` can update.

### 3. `audit_log`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `actor_id` (UUID, references `agents.id`)
  - `action` (String, e.g., 'REASSIGN_PROSPECT', 'PAUSE_SYSTEM')
  - `entity_type` (String, e.g., 'prospect', 'org_settings')
  - `entity_id` (String)
  - `metadata` (JSONB, for storing old/new values)
  - `created_at` (Timestamp)
- **RLS Policies**:
  - Read: Only `admin` role can read.
  - Write: `service_role` only (inserted via backend functions). Safer to restrict insert to backend functions using `service_role`.

### 4. `prospects` (Baseline for existing UI)
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String)
  - `phone` (String)
  - `assigned_to` (UUID, references `agents.id`)
  - `status` (String)
  - `created_at` (Timestamp)
- **RLS Policies**:
  - Read: All authenticated users can read.
  - Write (Update `assigned_to`): Only `admin` role (or `service_role` via Vercel).

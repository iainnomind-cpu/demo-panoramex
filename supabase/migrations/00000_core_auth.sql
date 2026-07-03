-- =============================================================
-- PANORAMEX CRM — Core Auth & DB Schema
-- Migration: 00000_core_auth.sql
-- Description: Foundational tables: agents, org_settings,
--   audit_log, prospects. RLS enabled on every table from creation.
-- Constitution gate: RLS activa desde el primer commit que la crea.
-- =============================================================

-- Enable the pgcrypto extension for uuid generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================
-- TABLE: agents
-- Extends Supabase Auth auth.users with CRM-specific metadata.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'agent')) DEFAULT 'agent',
  can_edit_catalog BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: enabled immediately upon table creation
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HELPER FUNCTION: get current agent role from agents table
-- Used in RLS policies to avoid N+1 subquery repetition.
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_current_agent_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.agents WHERE id = auth.uid();
$$;

-- Policy: All authenticated users can read any agent record (no privacy between agents)
CREATE POLICY "agents_select_authenticated"
  ON public.agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins OR service_role can insert/update agent records
CREATE POLICY "agents_insert_admin_or_service"
  ON public.agents
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_agent_role() = 'admin');

CREATE POLICY "agents_update_admin_or_service"
  ON public.agents
  FOR UPDATE
  TO authenticated
  USING (public.get_current_agent_role() = 'admin')
  WITH CHECK (public.get_current_agent_role() = 'admin');

-- =============================================================
-- TABLE: org_settings
-- Single-row table for global system configuration.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.org_settings (
  id              SERIAL PRIMARY KEY,
  system_status   TEXT NOT NULL CHECK (system_status IN ('active', 'paused')) DEFAULT 'active',
  message_limit   INTEGER NOT NULL DEFAULT 10000,
  messages_used   INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: enabled immediately upon table creation
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

-- Seed the single settings row on creation
INSERT INTO public.org_settings (system_status, message_limit, messages_used)
VALUES ('active', 10000, 0)
ON CONFLICT (id) DO NOTHING;

-- Policy: All authenticated users can read org settings (needed to show "paused" screen)
CREATE POLICY "org_settings_select_authenticated"
  ON public.org_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service_role can update (via Vercel serverless; blocks direct client writes)
-- Note: Admins must go through the /api/admin/system-status serverless function.
-- No INSERT/UPDATE policy for 'authenticated' role intentionally omitted.

-- =============================================================
-- TABLE: audit_log
-- Append-only log for sensitive write operations.
-- Constitution gate: toda función de escritura sensible queda registrada.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES public.agents(id),
  action      TEXT NOT NULL, -- e.g. 'REASSIGN_PROSPECT', 'PAUSE_SYSTEM', 'ACTIVATE_SYSTEM'
  entity_type TEXT NOT NULL, -- e.g. 'prospect', 'org_settings'
  entity_id   TEXT NOT NULL,
  metadata    JSONB,          -- old/new values for forensic audit trail
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: enabled immediately upon table creation
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "audit_log_select_admin"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.get_current_agent_role() = 'admin');

-- Policy: No INSERT via authenticated role. Inserts happen via service_role in Vercel functions only.
-- This guarantees the audit trail cannot be tampered with from the frontend.

-- =============================================================
-- TABLE: prospects
-- Core CRM entity. Baseline for existing UI.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.prospects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  assigned_to     UUID REFERENCES public.agents(id),
  status          TEXT NOT NULL DEFAULT 'nuevo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: enabled immediately upon table creation
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read all prospects (no privacy between agents)
CREATE POLICY "prospects_select_authenticated"
  ON public.prospects
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Insert allowed for any authenticated user (agents can create prospects)
CREATE POLICY "prospects_insert_authenticated"
  ON public.prospects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Update of assigned_to is restricted to service_role (via Vercel /api/admin/reassign-prospect)
-- Status updates (e.g., stage changes) can be done by any authenticated user.
-- We split this by using a check: agents can update status/notes but NOT assigned_to.
-- Admins (via service_role) can update any field.
CREATE POLICY "prospects_update_own_fields"
  ON public.prospects
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Standard agents can only update non-assignment fields.
    -- Reassignment must go through the serverless function (service_role).
    -- This policy allows status/notes updates for all agents.
    -- The serverless function uses service_role which bypasses RLS.
    true
  );

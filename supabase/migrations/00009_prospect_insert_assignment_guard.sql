-- =============================================================================
-- 00009_prospect_insert_assignment_guard.sql
--
-- Adds a BEFORE INSERT trigger on public.prospects that mirrors the existing
-- BEFORE UPDATE check_prospect_reassignment logic.
--
-- Rule: if the inserting user is not an admin AND assigned_to in the INSERT
-- row differs from auth.uid(), raise the same exception that reassignment does.
-- This prevents non-admins from inserting a prospect already assigned to
-- another agent (which would bypass the BEFORE UPDATE guard entirely).
--
-- Idempotent: uses CREATE OR REPLACE FUNCTION and DROP/CREATE for the trigger.
-- =============================================================================

-- ── Function ────────────────────────────────────────────────────────────────
-- We extend (or replace) the existing function to also handle INSERT events.
-- Because the existing trigger is BEFORE UPDATE only, a separate INSERT-scoped
-- trigger is the cleaner path — it avoids touching the UPDATE trigger that is
-- already working in production.

CREATE OR REPLACE FUNCTION public.check_prospect_insert_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- service_role bypasses all checks (used by serverless functions and
  -- admin ops that explicitly hold the service key).
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If assigned_to is NULL the row is unassigned — always allowed.
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- If assigned_to equals the calling user's UID — always allowed.
  IF NEW.assigned_to = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- Otherwise: the caller is trying to assign the new prospect to someone else.
  -- Only admins may do this.
  IF NOT EXISTS (
    SELECT 1
    FROM public.agents
    WHERE id = auth.uid()
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden reasignar prospectos.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger ─────────────────────────────────────────────────────────────────
-- Drop first so this migration is safely re-runnable.
DROP TRIGGER IF EXISTS enforce_prospect_insert_assignment ON public.prospects;

CREATE TRIGGER enforce_prospect_insert_assignment
BEFORE INSERT ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.check_prospect_insert_assignment();

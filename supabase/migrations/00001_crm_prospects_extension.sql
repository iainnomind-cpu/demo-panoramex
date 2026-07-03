-- Extend the existing prospects table
ALTER TABLE public.prospects 
ADD COLUMN origin_channel TEXT,
ADD COLUMN tour_of_interest TEXT,
ADD COLUMN desired_date DATE,
ADD COLUMN num_people INTEGER,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create interactions_timeline table
CREATE TABLE public.interactions_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL, -- e.g., 'note', 'status_change', 'whatsapp_msg'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Turn on RLS for the new table
ALTER TABLE public.interactions_timeline ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all interactions
CREATE POLICY "Agents can read all interactions" 
ON public.interactions_timeline 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Authenticated users can insert interactions (e.g. add notes)
CREATE POLICY "Agents can insert interactions" 
ON public.interactions_timeline 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Update prospects RLS for the assigned_to field
-- The existing update policy in 00000_core_auth.sql might be:
-- "Agents can update prospects" FOR UPDATE USING (true)
-- We need to ensure that updating assigned_to is restricted.
-- Supabase RLS doesn't easily support column-level update constraints via policies without triggering recursion or complex views, 
-- but we can use a trigger to prevent changes to assigned_to unless the role is service_role or admin.

CREATE OR REPLACE FUNCTION public.check_prospect_reassignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    -- Check if the current user has the 'admin' role in agents table
    -- Or if it's the service_role (which bypasses RLS/triggers usually, but let's be safe)
    IF current_setting('role') != 'service_role' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.agents 
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden reasignar prospectos.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_prospect_reassignment
BEFORE UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.check_prospect_reassignment();

-- Ensure realtime is enabled for prospects (and interactions_timeline)
-- Supabase realtime publications are handled by the 'supabase_realtime' publication.
-- If it doesn't exist, we can create it or add tables to it.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interactions_timeline;

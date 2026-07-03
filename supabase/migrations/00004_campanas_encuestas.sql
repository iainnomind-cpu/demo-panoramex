-- ========================================================================================
-- PANORAMEX CRM - MIGRATION 004
-- Feature: Módulo de Campañas de WhatsApp
-- ========================================================================================

-- 1. Alter prospects to add birth_date
ALTER TABLE public.prospects ADD COLUMN birth_date DATE NULL;

-- 2. Create campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('batch', 'automated_birthday', 'automated_survey')),
    template_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
    target_filters JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES public.agents(id)
);

-- 3. Create campaign_sends table
CREATE TABLE public.campaign_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed', 'replied')),
    meta_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create satisfaction_surveys table
CREATE TABLE public.satisfaction_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Set RLS Policies

-- campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent can select all campaigns"
    ON public.campaigns FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Agent can insert campaigns"
    ON public.campaigns FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Agent can update campaigns"
    ON public.campaigns FOR UPDATE
    TO authenticated
    USING (true);

-- campaign_sends
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent can select all campaign_sends"
    ON public.campaign_sends FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Agent can insert campaign_sends"
    ON public.campaign_sends FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Agent can update campaign_sends"
    ON public.campaign_sends FOR UPDATE
    TO authenticated
    USING (true);

-- satisfaction_surveys
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agent can select all satisfaction_surveys"
    ON public.satisfaction_surveys FOR SELECT
    TO authenticated
    USING (true);

-- No INSERT for authenticated agents on surveys, usually done by service role (webhook), 
-- but for local tests we can allow it or just let service_role bypass RLS.
-- Service role bypasses RLS automatically, so no need for specific policy.

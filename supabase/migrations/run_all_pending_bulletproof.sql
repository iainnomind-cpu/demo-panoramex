-- Migration 00002: Chatbot IA Multicanal Schema

-- 1. Create webhook_events table (In/Outbox)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 2. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    bot_status TEXT NOT NULL DEFAULT 'active',
    current_flow TEXT,
    flow_state JSONB DEFAULT '{}'::jsonb,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    meta_message_id TEXT,
    send_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Alter prospects table
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS origin_channel TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Optionally, add constraints to origin_channel (commented out to avoid breaking existing data if any, but good for future)
-- ALTER TABLE public.prospects ADD CONSTRAINT check_origin_channel CHECK (origin_channel IN ('whatsapp', 'ctwa_facebook', 'ctwa_instagram', 'web'));

-- Add RLS Policies

-- Webhook Events (Only Service Role / Backend can insert/update)
DROP POLICY IF EXISTS "Service Role Full Access to Webhook Events" ON public.webhook_events;
CREATE POLICY "Service Role Full Access to Webhook Events" ON public.webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Conversations (Agents can view and update conversations of their prospects)
DROP POLICY IF EXISTS "Agents can view all conversations" ON public.conversations;
CREATE POLICY "Agents can view all conversations" ON public.conversations
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Agents can update all conversations" ON public.conversations;
CREATE POLICY "Agents can update all conversations" ON public.conversations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Messages (Agents can view and insert messages)
DROP POLICY IF EXISTS "Agents can view all messages" ON public.messages;
CREATE POLICY "Agents can view all messages" ON public.messages
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Agents can insert messages" ON public.messages;
CREATE POLICY "Agents can insert messages" ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
-- Migración 00003: Catálogo de Tours y Módulo de Reservas
-- Fecha: 2026-07-03

-- 1. Tablas principales

CREATE TABLE IF NOT EXISTS public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  inclusions text[] DEFAULT '{}',
  image_url text,
  min_capacity_alert int NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tour_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_per_person numeric(10,2) NOT NULL CHECK (price_per_person >= 0),
  capacity int NOT NULL CHECK (capacity > 0),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tour_id, name)
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id),
  tour_variant_id uuid NOT NULL REFERENCES public.tour_variants(id),
  service_date date NOT NULL,
  num_people int NOT NULL CHECK (num_people > 0),
  total_amount numeric(10,2) NOT NULL,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  balance_due numeric(10,2) GENERATED ALWAYS AS (total_amount - deposit_amount) STORED,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_by uuid NOT NULL REFERENCES public.agents(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (deposit_amount <= total_amount)
);

CREATE TABLE IF NOT EXISTS public.reservation_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- 2. Triggers de updated_at

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tours_updated_at ON public.tours;
CREATE TRIGGER trg_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tour_variants_updated_at ON public.tour_variants;
CREATE TRIGGER trg_tour_variants_updated_at
BEFORE UPDATE ON public.tour_variants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Vista de disponibilidad

CREATE OR REPLACE VIEW public.tour_availability_view AS
SELECT
  tv.id            AS variant_id,
  tv.tour_id,
  tv.name          AS variant_name,
  tv.capacity,
  r.service_date,
  COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)::int AS reserved_seats,
  (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0))::int AS available_seats,
  t.min_capacity_alert,
  CASE
    WHEN (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)) <= 0
    THEN 'sold_out'
    WHEN (tv.capacity - COALESCE(SUM(r.num_people) FILTER (WHERE r.status != 'cancelled'), 0)) <= t.min_capacity_alert
    THEN 'low_availability'
    ELSE 'available'
  END AS availability_status
FROM public.tour_variants tv
JOIN public.tours t ON t.id = tv.tour_id
LEFT JOIN public.reservations r ON r.tour_variant_id = tv.id
GROUP BY tv.id, tv.tour_id, tv.name, tv.capacity, r.service_date, t.min_capacity_alert;

-- 4. Índice para la vista de disponibilidad

CREATE INDEX IF NOT EXISTS idx_reservations_variant_date 
ON public.reservations (tour_variant_id, service_date) 
WHERE status != 'cancelled';

-- 5. Trigger de control de cupo

CREATE OR REPLACE FUNCTION check_reservation_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INT;
  v_reserved INT;
BEGIN
  SELECT capacity INTO v_capacity FROM tour_variants WHERE id = NEW.tour_variant_id;
  
  SELECT COALESCE(SUM(num_people), 0) INTO v_reserved
    FROM reservations
    WHERE tour_variant_id = NEW.tour_variant_id
      AND service_date = NEW.service_date
      AND status != 'cancelled'
      AND id != COALESCE(NEW.id, gen_random_uuid());
      
  IF (v_reserved + NEW.num_people) > v_capacity THEN
    RAISE EXCEPTION 'capacity_exceeded: only % seats available', (v_capacity - v_reserved);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_reservation_capacity ON public.reservations;
CREATE TRIGGER trg_check_reservation_capacity
BEFORE INSERT OR UPDATE OF num_people, tour_variant_id, service_date, status
ON public.reservations
FOR EACH ROW
WHEN (NEW.status != 'cancelled')
EXECUTE FUNCTION check_reservation_capacity();

-- 6. Row Level Security (RLS)

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_passengers ENABLE ROW LEVEL SECURITY;

-- Políticas para tours
DROP POLICY IF EXISTS "Tours: Select para agentes autenticados" ON public.tours;
CREATE POLICY "Tours: Select para agentes autenticados"
  ON public.tours FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para tour_variants
DROP POLICY IF EXISTS "TourVariants: Select para agentes autenticados" ON public.tour_variants;
CREATE POLICY "TourVariants: Select para agentes autenticados"
  ON public.tour_variants FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para reservations
DROP POLICY IF EXISTS "Reservations: Select para agentes autenticados" ON public.reservations;
CREATE POLICY "Reservations: Select para agentes autenticados"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Reservations: Insert para agentes autenticados" ON public.reservations;
CREATE POLICY "Reservations: Insert para agentes autenticados"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Reservations: Update para agentes autenticados" ON public.reservations;
CREATE POLICY "Reservations: Update para agentes autenticados"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para reservation_passengers
DROP POLICY IF EXISTS "ReservationPassengers: Select para agentes autenticados" ON public.reservation_passengers;
CREATE POLICY "ReservationPassengers: Select para agentes autenticados"
  ON public.reservation_passengers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "ReservationPassengers: Insert para agentes autenticados" ON public.reservation_passengers;
CREATE POLICY "ReservationPassengers: Insert para agentes autenticados"
  ON public.reservation_passengers FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "ReservationPassengers: Update para agentes autenticados" ON public.reservation_passengers;
CREATE POLICY "ReservationPassengers: Update para agentes autenticados"
  ON public.reservation_passengers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "ReservationPassengers: Delete para agentes autenticados" ON public.reservation_passengers;
CREATE POLICY "ReservationPassengers: Delete para agentes autenticados"
  ON public.reservation_passengers FOR DELETE
  TO authenticated
  USING (true);
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
DROP POLICY IF EXISTS "Agent can select all campaigns" ON public.campaigns;
CREATE POLICY "Agent can select all campaigns"
    ON public.campaigns FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Agent can insert campaigns" ON public.campaigns;
CREATE POLICY "Agent can insert campaigns"
    ON public.campaigns FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Agent can update campaigns" ON public.campaigns;
CREATE POLICY "Agent can update campaigns"
    ON public.campaigns FOR UPDATE
    TO authenticated
    USING (true);

-- campaign_sends
ALTER TABLE public.campaign_sends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agent can select all campaign_sends" ON public.campaign_sends;
CREATE POLICY "Agent can select all campaign_sends"
    ON public.campaign_sends FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Agent can insert campaign_sends" ON public.campaign_sends;
CREATE POLICY "Agent can insert campaign_sends"
    ON public.campaign_sends FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Agent can update campaign_sends" ON public.campaign_sends;
CREATE POLICY "Agent can update campaign_sends"
    ON public.campaign_sends FOR UPDATE
    TO authenticated
    USING (true);

-- satisfaction_surveys
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agent can select all satisfaction_surveys" ON public.satisfaction_surveys;
CREATE POLICY "Agent can select all satisfaction_surveys"
    ON public.satisfaction_surveys FOR SELECT
    TO authenticated
    USING (true);

-- No INSERT for authenticated agents on surveys, usually done by service role (webhook), 
-- but for local tests we can allow it or just let service_role bypass RLS.
-- Service role bypasses RLS automatically, so no need for specific policy.
-- ============================================================
-- PANORAMEX CRM — Migration 00005
-- Analytics Views and RPCs
-- ============================================================

-- View: view_analytics_kpis
CREATE OR REPLACE VIEW view_analytics_kpis AS
SELECT
  (SELECT COUNT(*) FROM prospects WHERE date_trunc('day', created_at) = date_trunc('day', now())) as leads_today,
  (SELECT COUNT(*) FROM prospects WHERE status IN ('nuevo', 'en_proceso', 'calificado')) as leads_in_pipeline,
  (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') as total_reservations,
  (SELECT COUNT(*) FROM prospects WHERE status IN ('reservado', 'convertido')) as total_conversions;

-- View: view_analytics_funnel
CREATE OR REPLACE VIEW view_analytics_funnel AS
SELECT status, COUNT(*) as count
FROM prospects
GROUP BY status;

-- View: view_analytics_bot_performance
CREATE OR REPLACE VIEW view_analytics_bot_performance AS
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN assigned_to IS NULL THEN 1 ELSE 0 END) as bot_qualified,
  SUM(CASE WHEN assigned_to IS NOT NULL THEN 1 ELSE 0 END) as human_handoff
FROM prospects;

-- View: view_analytics_surveys
CREATE OR REPLACE VIEW view_analytics_surveys AS
SELECT
  COALESCE(AVG(rating), 0) as average_rating,
  SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1_count,
  SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3_count,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5_count
FROM satisfaction_surveys;

-- View: view_analytics_consumption
CREATE OR REPLACE VIEW view_analytics_consumption AS
SELECT
  (SELECT COUNT(*) FROM messages WHERE date_trunc('month', created_at) = date_trunc('month', now())) as current_month_messages,
  (SELECT COUNT(*) FROM campaign_sends WHERE date_trunc('month', created_at) = date_trunc('month', now())) as current_month_campaigns,
  (
    (SELECT COUNT(*) FROM messages WHERE date_trunc('month', created_at) = date_trunc('month', now())) +
    (SELECT COUNT(*) FROM campaign_sends WHERE date_trunc('month', created_at) = date_trunc('month', now()))
  ) as total_interactions;

-- RPC: get_conversions_by_tour
CREATE OR REPLACE FUNCTION get_conversions_by_tour(start_date text, end_date text)
RETURNS TABLE (tour_name text, conversion_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT t.name::text as tour_name, COUNT(r.id) as conversion_count
  FROM tours t
  JOIN tour_variants tv ON t.id = tv.tour_id
  JOIN reservations r ON tv.id = r.tour_variant_id
  WHERE r.status = 'confirmed'
    AND r.created_at >= start_date::timestamp
    AND r.created_at <= end_date::timestamp
  GROUP BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_conversions_by_channel
CREATE OR REPLACE FUNCTION get_conversions_by_channel(start_date text, end_date text)
RETURNS TABLE (channel text, lead_count bigint, conversion_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.origin_channel::text as channel,
    COUNT(*) as lead_count,
    SUM(CASE WHEN p.status IN ('reservado', 'convertido') THEN 1 ELSE 0 END) as conversion_count
  FROM prospects p
  WHERE p.created_at >= start_date::timestamp
    AND p.created_at <= end_date::timestamp
  GROUP BY p.origin_channel;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_agent_performance
CREATE OR REPLACE FUNCTION get_agent_performance(start_date text, end_date text)
RETURNS TABLE (
  agent_id uuid,
  agent_name text,
  leads_assigned bigint,
  leads_attended bigint,
  conversions bigint,
  avg_response_time_minutes numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as agent_id,
    a.name::text as agent_name,
    COUNT(DISTINCT p.id) as leads_assigned,
    -- We approximate 'attended' if there is at least one outgoing message by this agent
    COUNT(DISTINCT CASE WHEN m.tipo = 'saliente' AND m.agente_id = a.id THEN p.id ELSE NULL END) as leads_attended,
    COUNT(DISTINCT CASE WHEN p.status IN ('reservado', 'convertido') THEN p.id ELSE NULL END) as conversions,
    0.0::numeric as avg_response_time_minutes -- Simplified for MVP
  FROM agents a
  LEFT JOIN prospects p ON a.id = p.assigned_to AND p.created_at >= start_date::timestamp AND p.created_at <= end_date::timestamp
  LEFT JOIN messages m ON p.id = (SELECT prospect_id FROM conversations c WHERE c.id = m.conversacion_id)
  GROUP BY a.id, a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS on views (views run as invoker or definer, here they run as definer so we grant access)
GRANT SELECT ON view_analytics_kpis TO authenticated;
GRANT SELECT ON view_analytics_funnel TO authenticated;
GRANT SELECT ON view_analytics_bot_performance TO authenticated;
GRANT SELECT ON view_analytics_surveys TO authenticated;
GRANT SELECT ON view_analytics_consumption TO authenticated;
-- ============================================================
-- PANORAMEX CRM — Migration 00006
-- Organization Settings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  system_status text NOT NULL DEFAULT 'active' CHECK (system_status IN ('active', 'paused')),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT organization_settings_pkey PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden actualizar (asumiendo agentes pueden leer)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.organization_settings;
CREATE POLICY "Enable read access for authenticated users" 
  ON public.organization_settings FOR SELECT 
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for admins only" ON public.organization_settings;
CREATE POLICY "Enable update for admins only" 
  ON public.organization_settings FOR UPDATE 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = auth.uid() 
      AND agents.role = 'admin'
    )
  );

-- Insertar fila única inicial si no existe
INSERT INTO public.organization_settings (system_status) 
SELECT 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.organization_settings LIMIT 1);
-- =============================================================
-- PANORAMEX CRM — Audit Triggers for Sensitive Actions
-- Migration: 00007_audit_triggers.sql
-- =============================================================

-- 1. Añadir políticas RLS de UPDATE para org_settings
DROP POLICY IF EXISTS "org_settings_update_admin" ON public.org_settings;
CREATE POLICY "org_settings_update_admin"
  ON public.org_settings
  FOR UPDATE
  TO authenticated
  USING (public.get_current_agent_role() = 'admin')
  WITH CHECK (public.get_current_agent_role() = 'admin');

-- 2. Añadir políticas RLS de UPDATE para tour_variants
DROP POLICY IF EXISTS "tour_variants_update_admin" ON public.tour_variants;
CREATE POLICY "tour_variants_update_admin"
  ON public.tour_variants
  FOR UPDATE
  TO authenticated
  USING (public.get_current_agent_role() = 'admin')
  WITH CHECK (public.get_current_agent_role() = 'admin');

-- 3. Función del trigger (SECURITY DEFINER permite insertar en audit_log)
CREATE OR REPLACE FUNCTION public.fn_audit_sensitive_changes()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_action text;
  v_entity_type text;
  v_entity_id text;
  v_metadata jsonb;
BEGIN
  -- Obtenemos el auth.uid() del usuario autenticado que ejecutó el UPDATE.
  -- Si esto se ejecuta desde una función que usa service_role, auth.uid() será NULL,
  -- por lo que requerimos que las actualizaciones fluyan con el token JWT del usuario.
  v_actor_id := auth.uid();

  IF TG_TABLE_NAME = 'org_settings' THEN
    IF OLD.system_status IS DISTINCT FROM NEW.system_status THEN
      v_action := CASE WHEN NEW.system_status = 'paused' THEN 'PAUSE_SYSTEM' ELSE 'ACTIVATE_SYSTEM' END;
      v_entity_type := 'org_settings';
      v_entity_id := NEW.id::text;
      v_metadata := jsonb_build_object(
        'old_status', OLD.system_status,
        'new_status', NEW.system_status
      );
    END IF;
  ELSIF TG_TABLE_NAME = 'tour_variants' THEN
    IF OLD.price_per_person IS DISTINCT FROM NEW.price_per_person THEN
      v_action := 'UPDATE_PRICE';
      v_entity_type := 'tour_variants';
      v_entity_id := NEW.id::text;
      v_metadata := jsonb_build_object(
        'old_price', OLD.price_per_person,
        'new_price', NEW.price_per_person,
        'tour_id', NEW.tour_id
      );
    END IF;
  ELSIF TG_TABLE_NAME = 'prospects' THEN
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      v_action := 'REASSIGN_PROSPECT';
      v_entity_type := 'prospects';
      v_entity_id := NEW.id::text;
      v_metadata := jsonb_build_object(
        'old_agent_id', OLD.assigned_to,
        'new_agent_id', NEW.assigned_to
      );
    END IF;
  END IF;

  IF v_action IS NOT NULL THEN
    IF v_actor_id IS NULL THEN
      -- Evitar que una acción sensible ocurra si no podemos auditar quién la hizo.
      RAISE EXCEPTION 'Fallo de auditoría: auth.uid() no está disponible para registrar la acción %. La actualización debe realizarse en el contexto de un usuario autenticado.', v_action;
    END IF;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata, created_at)
    VALUES (v_actor_id, v_action, v_entity_type, v_entity_id, v_metadata, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Asignar triggers

-- Trigger para org_settings (system_status)
DROP TRIGGER IF EXISTS trg_audit_org_settings ON public.org_settings;
DROP TRIGGER IF EXISTS trg_audit_org_settings ON public.org_settings;
CREATE TRIGGER trg_audit_org_settings
AFTER UPDATE ON public.org_settings
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

-- Trigger para tour_variants (price_per_person)
DROP TRIGGER IF EXISTS trg_audit_tour_variants ON public.tour_variants;
DROP TRIGGER IF EXISTS trg_audit_tour_variants ON public.tour_variants;
CREATE TRIGGER trg_audit_tour_variants
AFTER UPDATE ON public.tour_variants
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

-- Trigger para prospects (assigned_to)
DROP TRIGGER IF EXISTS trg_audit_prospects ON public.prospects;
DROP TRIGGER IF EXISTS trg_audit_prospects ON public.prospects;
CREATE TRIGGER trg_audit_prospects
AFTER UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

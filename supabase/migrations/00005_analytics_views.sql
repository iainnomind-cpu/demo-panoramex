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

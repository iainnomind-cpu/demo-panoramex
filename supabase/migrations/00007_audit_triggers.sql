-- =============================================================
-- PANORAMEX CRM — Audit Triggers for Sensitive Actions
-- Migration: 00007_audit_triggers.sql
-- =============================================================

-- 1. Añadir políticas RLS de UPDATE para org_settings
CREATE POLICY "org_settings_update_admin"
  ON public.org_settings
  FOR UPDATE
  TO authenticated
  USING (public.get_current_agent_role() = 'admin')
  WITH CHECK (public.get_current_agent_role() = 'admin');

-- 2. Añadir políticas RLS de UPDATE para tour_variants
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
CREATE TRIGGER trg_audit_org_settings
AFTER UPDATE ON public.org_settings
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

-- Trigger para tour_variants (price_per_person)
DROP TRIGGER IF EXISTS trg_audit_tour_variants ON public.tour_variants;
CREATE TRIGGER trg_audit_tour_variants
AFTER UPDATE ON public.tour_variants
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

-- Trigger para prospects (assigned_to)
DROP TRIGGER IF EXISTS trg_audit_prospects ON public.prospects;
CREATE TRIGGER trg_audit_prospects
AFTER UPDATE ON public.prospects
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_sensitive_changes();

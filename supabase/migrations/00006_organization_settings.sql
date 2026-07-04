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
CREATE POLICY "Enable read access for authenticated users" 
  ON public.organization_settings FOR SELECT 
  TO authenticated USING (true);

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

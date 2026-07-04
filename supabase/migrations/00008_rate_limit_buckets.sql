-- Migration: Rate Limiting persistente con Supabase
-- Reemplaza el Map en memoria de rateLimit.ts

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INT         NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- Índice para limpiar ventanas expiradas eficientemente
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON public.rate_limit_buckets (window_start);

-- Solo el service_role puede leer/escribir (no exponer al cliente)
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Ningún usuario anónimo/autenticado puede acceder; solo service_role lo hace via adminDb
CREATE POLICY "service_only" ON public.rate_limit_buckets
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (false);

-- Función para limpiar ventanas expiradas (llamar periódicamente o en cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.rate_limit_buckets
  WHERE window_start < NOW() - INTERVAL '1 hour';
$$;

-- Función atómica: incrementa el contador y devuelve si está permitido
-- Evita race conditions que tendría un SELECT + UPDATE separado.
CREATE OR REPLACE FUNCTION public.upsert_rate_limit(
  p_key          TEXT,
  p_window_start TIMESTAMPTZ,
  p_limit        INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.rate_limit_buckets (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rate_limit_buckets.count + 1
  RETURNING count INTO v_count;

  RETURN json_build_object(
    'count',   v_count,
    'allowed', v_count <= p_limit
  );
END;
$$;


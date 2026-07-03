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

CREATE TRIGGER trg_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tour_variants_updated_at
BEFORE UPDATE ON public.tour_variants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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
CREATE POLICY "Tours: Select para agentes autenticados"
  ON public.tours FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para tour_variants
CREATE POLICY "TourVariants: Select para agentes autenticados"
  ON public.tour_variants FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para reservations
CREATE POLICY "Reservations: Select para agentes autenticados"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reservations: Insert para agentes autenticados"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Reservations: Update para agentes autenticados"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para reservation_passengers
CREATE POLICY "ReservationPassengers: Select para agentes autenticados"
  ON public.reservation_passengers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ReservationPassengers: Insert para agentes autenticados"
  ON public.reservation_passengers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ReservationPassengers: Update para agentes autenticados"
  ON public.reservation_passengers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ReservationPassengers: Delete para agentes autenticados"
  ON public.reservation_passengers FOR DELETE
  TO authenticated
  USING (true);

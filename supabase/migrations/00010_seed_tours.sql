-- ============================================================
-- PANORAMEX CRM — Migration 00010: Seed Tours de Ejemplo
-- ============================================================
-- Inserta dos tours demo con sus variantes de precio.
-- Usa ON CONFLICT DO NOTHING para que sea idempotente.
-- ============================================================

DO $$
DECLARE
  tour1_id uuid := gen_random_uuid();
  tour2_id uuid := gen_random_uuid();
BEGIN

  -- ─────────────────────────────────────────────
  -- TOUR 1: Tren José Cuervo Express
  -- ─────────────────────────────────────────────
  INSERT INTO tours (id, name, slug, description, inclusions, image_url, min_capacity_alert, is_active)
  VALUES (
    tour1_id,
    'Tren José Cuervo Express',
    'tren-jose-cuervo-express',
    'Vive una experiencia única a bordo del icónico Tren José Cuervo Express. Viaja desde Guadalajara hasta Amatitán, cuna de la industria tequilera de Jalisco. Disfruta de espectáculos en vivo, mariachi, degustación de tequilas premium y recorrido por la destilería La Rojeña, la más antigua de América.',
    ARRAY[
      'Transporte en tren panorámico desde Guadalajara',
      'Desayuno o cena a bordo según el horario',
      'Show de mariachi y folklore jalisciense',
      'Visita guiada a La Rojeña (destilería José Cuervo)',
      'Degustación de 3 tequilas premium',
      'Souvenir exclusivo del viaje',
      'Seguro de viajero'
    ],
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60',
    10,
    true
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Variantes del Tour 1
  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour1_id, 'Clase Turista', 1850.00, 40, 1
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour1_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour1_id, 'Clase Ejecutiva', 2650.00, 20, 2
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour1_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour1_id, 'Suite Premium', 3900.00, 8, 3
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour1_id)
  ON CONFLICT DO NOTHING;


  -- ─────────────────────────────────────────────
  -- TOUR 2: Pueblos Mágicos de Jalisco
  -- ─────────────────────────────────────────────
  INSERT INTO tours (id, name, slug, description, inclusions, image_url, min_capacity_alert, is_active)
  VALUES (
    tour2_id,
    'Pueblos Mágicos de Jalisco',
    'pueblos-magicos-jalisco',
    'Descubre la magia de Jalisco en este recorrido por sus Pueblos Mágicos más emblemáticos: Tequila, Tapalpa y Mazamitla. Admira la arquitectura colonial, los paisajes de la Sierra Madre Occidental y la gastronomía artesanal que hace única a esta región del país.',
    ARRAY[
      'Transporte en unidad de lujo con WiFi y A/C',
      'Guía turístico certificado bilingüe (español/inglés)',
      'Entrada a museos y sitios históricos',
      'Comida típica regional incluida',
      'Degustación de artesanías locales',
      'Tiempo libre en cada pueblo',
      'Fotografía aérea con drone del recorrido',
      'Seguro de viajero'
    ],
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&auto=format&fit=crop&q=60',
    8,
    true
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Variantes del Tour 2
  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour2_id, 'Día Completo (1 pueblo)', 1200.00, 25, 1
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour2_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour2_id, 'Circuito 2 Pueblos', 1750.00, 20, 2
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour2_id)
  ON CONFLICT DO NOTHING;

  INSERT INTO tour_variants (tour_id, name, price_per_person, capacity, sort_order)
  SELECT tour2_id, 'Gran Circuito 3 Pueblos', 2400.00, 16, 3
  WHERE EXISTS (SELECT 1 FROM tours WHERE id = tour2_id)
  ON CONFLICT DO NOTHING;

END $$;

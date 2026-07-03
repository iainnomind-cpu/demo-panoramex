-- =============================================================
-- PANORAMEX CRM — Seed Data
-- supabase/seed.sql
-- Description: Creates the 7 initial Panoramex collaborators
--   (5 asesores + 2 directivos) via Supabase Auth and the agents table.
--
-- HOW TO USE:
--   1. Create each user in Supabase Auth Dashboard (or via CLI):
--      supabase auth invite --email user@panoramex.mx
--   2. After the user accepts the invite and sets their password,
--      run this seed to populate the agents profile table.
--
-- NOTE: auth.users UUIDs must be replaced with the real UUIDs from
--       your Supabase Auth dashboard after creating the accounts.
-- =============================================================

-- INSTRUCTIONS FOR INITIAL SETUP:
-- Replace the placeholder UUIDs below with the actual UUIDs from
-- auth.users after creating the accounts in Supabase Dashboard.
--
-- Suggested credentials (emails to configure):
--   admin1@panoramex.mx  → role: admin  (Directivo 1)
--   admin2@panoramex.mx  → role: admin  (Directivo 2)
--   asesor1@panoramex.mx → role: agent  (Asesor 1)
--   asesor2@panoramex.mx → role: agent  (Asesor 2)
--   asesor3@panoramex.mx → role: agent  (Asesor 3)
--   asesor4@panoramex.mx → role: agent  (Asesor 4)
--   asesor5@panoramex.mx → role: agent  (Asesor 5)

-- =============================================================
-- AGENTS SEED
-- =============================================================
-- 1. Create the users in auth.users first
INSERT INTO auth.users (
  id, instance_id, role, aud, email,
  encrypted_password, email_confirmed_at, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin1@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin2@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asesor1@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asesor2@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asesor3@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asesor4@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'asesor5@panoramex.mx', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.agents
INSERT INTO public.agents (id, email, full_name, role, can_edit_catalog)
VALUES
  -- Directivos (admins) — Replace UUIDs with real auth.users UUIDs
  ('00000000-0000-0000-0000-000000000001', 'admin1@panoramex.mx',  'Directivo Uno',   'admin', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'admin2@panoramex.mx',  'Directivo Dos',   'admin', TRUE),
  -- Asesores (agents) — Replace UUIDs with real auth.users UUIDs
  ('00000000-0000-0000-0000-000000000003', 'asesor1@panoramex.mx', 'Asesor Uno',      'agent', FALSE),
  ('00000000-0000-0000-0000-000000000004', 'asesor2@panoramex.mx', 'Asesor Dos',      'agent', FALSE),
  ('00000000-0000-0000-0000-000000000005', 'asesor3@panoramex.mx', 'Asesor Tres',     'agent', FALSE),
  ('00000000-0000-0000-0000-000000000006', 'asesor4@panoramex.mx', 'Asesor Cuatro',   'agent', FALSE),
  ('00000000-0000-0000-0000-000000000007', 'asesor5@panoramex.mx', 'Asesor Cinco',    'agent', FALSE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- PROSPECTS SEED
-- =============================================================
INSERT INTO public.prospects (id, name, phone, assigned_to, status, origin_channel, tour_of_interest, desired_date, num_people, tags, created_at, last_activity_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Juan Pérez', '523312345678', '00000000-0000-0000-0000-000000000003', 'Nuevo', 'whatsapp', 'Tequila Express', '2026-08-15', 2, '{"vip"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'María Gómez', '523387654321', '00000000-0000-0000-0000-000000000004', 'Calificado', 'web', 'Guachimontones', '2026-07-10', 4, '{}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
  ('33333333-3333-3333-3333-333333333333', 'Carlos Slim', '525555555555', '00000000-0000-0000-0000-000000000003', 'En Cotización', 'phone', 'Chapala Ajijic', '2026-07-20', 10, '{"grupo"}', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 hours')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- INTERACTIONS TIMELINE SEED
-- =============================================================
INSERT INTO public.interactions_timeline (prospect_id, agent_id, interaction_type, content, metadata, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, 'status_change', 'El prospecto entró al sistema', '{"new_status": "Nuevo"}', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000004', 'note', 'El cliente prefiere que le marquemos en la tarde', '{}', NOW() - INTERVAL '2 days'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'whatsapp_msg', 'Enviamos la cotización PDF al cliente.', '{}', NOW() - INTERVAL '8 hours');

-- =============================================================
-- TOURS AND VARIANTS SEED
-- =============================================================

-- Delete existing to avoid conflicts if run multiple times
DELETE FROM public.tour_variants;
DELETE FROM public.tours;

-- Insertar Tours Base
INSERT INTO public.tours (id, name, slug, description, inclusions, image_url, min_capacity_alert, is_active)
VALUES 
('t1000000-0000-0000-0000-000000000001', 'Tren José Cuervo Express', 'tren-jose-cuervo-express', 'Disfruta de un recorrido inolvidable en el tren de pasajeros más elegante de México, viajando hacia Tequila Pueblo Mágico.', ARRAY['Viaje redondo en tren', 'Catado educativo', 'Recorrido por la destilería', 'Espectáculo folclórico'], '/images/tours/tren-jose-cuervo.png', 5, true),
('t2000000-0000-0000-0000-000000000002', 'City Tour Guadalajara & Tlaquepaque', 'city-tour-guadalajara-tlaquepaque', 'Descubre la historia, arquitectura y cultura de Guadalajara y el encanto artesanal de Tlaquepaque.', ARRAY['Transporte redondo', 'Guía certificado', 'Visita guiada centro histórico', 'Tiempo libre en Tlaquepaque'], '/images/tours/city-tour.png', 4, true),
('t3000000-0000-0000-0000-000000000003', 'Lago de Chapala & Ajijic', 'lago-chapala-ajijic', 'Conoce el lago natural más grande de México y los pintorescos pueblos ribereños, hogar de la comunidad extranjera.', ARRAY['Transporte redondo', 'Paseo en lancha', 'Visita al malecón', 'Guía'], '/images/tours/chapala.png', 4, true),
('t4000000-0000-0000-0000-000000000004', 'Mazamitla Pueblo Mágico', 'mazamitla-pueblo-magico', 'La Suiza mexicana te espera con sus cabañas, paisajes boscosos, cascadas y un clima fresco.', ARRAY['Transporte redondo', 'Paseo por el bosque', 'Entrada al parque ecológico', 'Guía'], '/images/tours/mazamitla.png', 4, true),
('t5000000-0000-0000-0000-000000000005', 'Tequila Express Casa Sauza', 'tequila-express-casa-sauza', 'Visita la cuna del tequila, conoce los campos de agave azul y degusta el mejor tequila en Casa Sauza.', ARRAY['Transporte terrestre', 'Recorrido en destilería', 'Comida buffet', 'Mariachi en vivo'], '/images/tours/sauza.png', 5, true),
('t6000000-0000-0000-0000-000000000006', 'Tour Lucha Libre Guadalajara', 'tour-lucha-libre-guadalajara', 'Vive la pasión y el folclore de la lucha libre mexicana en la Arena Coliseo de Guadalajara.', ARRAY['Transporte desde punto de encuentro', 'Boleto de entrada', 'Bebida de cortesía', 'Guía experto'], '/images/tours/lucha-libre.png', 2, true),
('t7000000-0000-0000-0000-000000000007', 'Guachimontones & Teuchitlán', 'guachimontones-teuchitlan', 'Explora las únicas pirámides circulares del mundo y conoce la historia de la tradición Teuchitlán.', ARRAY['Transporte redondo', 'Entrada a zona arqueológica', 'Visita guiada', 'Talleres prehispánicos'], '/images/tours/guachimontones.png', 4, true),
('t8000000-0000-0000-0000-000000000008', 'Tour Privado Ejecutivo GDL', 'tour-privado-ejecutivo-gdl', 'Recorrido VIP por Guadalajara, Tlaquepaque y Tequila en transporte privado de lujo.', ARRAY['SUV de lujo', 'Chofer/Guía bilingüe', 'Itinerario flexible', 'Bebidas a bordo'], '/images/tours/privado.png', 1, true);

-- Insertar Variantes
INSERT INTO public.tour_variants (tour_id, name, price_per_person, capacity, sort_order)
VALUES 
-- Tren José Cuervo
('t1000000-0000-0000-0000-000000000001', 'Express', 2850.00, 60, 1),
('t1000000-0000-0000-0000-000000000001', 'Premium Plus', 3250.00, 40, 2),
('t1000000-0000-0000-0000-000000000001', 'Diamante', 3850.00, 20, 3),

-- City Tour
('t2000000-0000-0000-0000-000000000002', 'Básico', 850.00, 40, 1),
('t2000000-0000-0000-0000-000000000002', 'Con Comida', 1250.00, 40, 2),

-- Chapala
('t3000000-0000-0000-0000-000000000003', 'General', 1150.00, 30, 1),

-- Mazamitla
('t4000000-0000-0000-0000-000000000004', 'General', 1350.00, 30, 1),

-- Tequila Sauza
('t5000000-0000-0000-0000-000000000005', 'Tradicional', 2200.00, 50, 1),

-- Lucha Libre
('t6000000-0000-0000-0000-000000000006', 'Gradas', 650.00, 20, 1),
('t6000000-0000-0000-0000-000000000006', 'Ring Side', 950.00, 10, 2),

-- Guachimontones
('t7000000-0000-0000-0000-000000000007', 'General', 950.00, 30, 1),

-- Privado
('t8000000-0000-0000-0000-000000000008', 'SUV hasta 4 pax', 4500.00, 1, 1),
('t8000000-0000-0000-0000-000000000008', 'Van hasta 10 pax', 8500.00, 1, 2);

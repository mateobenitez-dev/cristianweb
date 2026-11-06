-- Textos y datos de las rutinas: completar con lo real de Cristian (vacío = cartel "Poner texto acá").
INSERT INTO products (slug, type, name, short_desc, description, level, duration_weeks, days_per_week, price_cents, pdf_path, features, sort_order) VALUES
('base-natural', 'rutina', 'Base Natural', '', NULL,
 'principiante', NULL, NULL, 9900, 'private/rutinas/base-natural.pdf',
 '{}', 1),
('hipertrofia-torso-pierna', 'rutina', 'Hipertrofia Torso/Pierna', '', NULL,
 'intermedio', NULL, NULL, 19900, 'private/rutinas/hipertrofia-torso-pierna.pdf',
 '{}', 2),
('ppl-natural-pro', 'rutina', 'PPL Natural Pro', '', NULL,
 'avanzado', NULL, NULL, 40000, 'private/rutinas/ppl-natural-pro.pdf',
 '{}', 3),
('asesoria-mensual', 'asesoria', 'Asesoría Premium 1 a 1 · Mensual', '', NULL,
 NULL, 4, NULL, 25000, NULL,
 '{}', 10);

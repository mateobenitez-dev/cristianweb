-- =====================================================================
--  Cristian Giudici · Plataforma de rutinas + asesoría 1 a 1
--  PostgreSQL 14+  (Supabase / Neon / RDS / local)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ---------- Tipos ----------
CREATE TYPE difficulty_level AS ENUM ('principiante', 'intermedio', 'avanzado');
CREATE TYPE product_type     AS ENUM ('rutina', 'asesoria');
CREATE TYPE order_status     AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
CREATE TYPE coaching_status  AS ENUM ('aplicado', 'evaluacion_agendada', 'activo', 'pausado', 'finalizado', 'rechazado');

-- ---------- updated_at automático ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- =====================================================================
--  CLIENTES (datos de contacto)
-- =====================================================================
CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  full_name   text,
  phone       text,
  country     text,
  instagram   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_email_uq ON customers (lower(email));
CREATE TRIGGER customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
--  PRODUCTOS (rutinas pre-hechas y planes de asesoría)
-- =====================================================================
CREATE TABLE products (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE,
  type           product_type NOT NULL DEFAULT 'rutina',
  name           text NOT NULL,
  short_desc     text NOT NULL,
  description    text,
  level          difficulty_level,                 -- NULL para asesoría
  duration_weeks int,
  days_per_week  int,
  price_cents    int  NOT NULL CHECK (price_cents > 0),   -- USD 400 = 40000
  currency       char(3) NOT NULL DEFAULT 'USD',
  pdf_path       text,                              -- 'private/rutinas/x.pdf' o URL firmada (S3/Supabase Storage)
  cover_image    text,
  features       text[] NOT NULL DEFAULT '{}',
  is_active      boolean NOT NULL DEFAULT true,
  sort_order     int NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rutina_requires_level CHECK (type <> 'rutina' OR level IS NOT NULL)
);
CREATE INDEX products_active_level_idx ON products (is_active, level);
CREATE TRIGGER products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
--  ÓRDENES (detalle de compra). external_reference de MP = orders.id
-- =====================================================================
CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES customers(id),
  status            order_status NOT NULL DEFAULT 'pending',
  total_cents       int NOT NULL,
  currency          char(3) NOT NULL,
  mp_preference_id  text,
  paid_at           timestamptz,
  delivered_at      timestamptz,                    -- email con PDF enviado OK
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON orders (customer_id);
CREATE INDEX orders_status_idx   ON orders (status);
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES products(id),
  product_name     text NOT NULL,                  -- snapshot al momento de compra
  unit_price_cents int  NOT NULL,
  quantity         int  NOT NULL DEFAULT 1 CHECK (quantity > 0)
);
CREATE INDEX order_items_order_idx ON order_items (order_id);

-- =====================================================================
--  PAGOS (transacciones de Mercado Pago). Una orden puede tener varios
--  intentos (rechazado -> aprobado). mp_payment_id UNIQUE = idempotencia.
-- =====================================================================
CREATE TABLE payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           uuid REFERENCES orders(id),
  mp_payment_id      bigint NOT NULL UNIQUE,
  status             text NOT NULL,                -- approved | pending | in_process | rejected | refunded | cancelled | charged_back
  status_detail      text,
  amount_cents       int,
  currency           char(3),
  payment_method     text,
  payment_type       text,
  payer_email        text,
  raw                jsonb NOT NULL,               -- respuesta completa de GET /v1/payments/:id
  approved_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON payments (order_id);
CREATE TRIGGER payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Log crudo de webhooks (debug / auditoría / re-proceso)
CREATE TABLE webhook_events (
  id           bigserial PRIMARY KEY,
  provider     text NOT NULL DEFAULT 'mercadopago',
  topic        text,
  resource_id  text,
  request_id   text,
  signature_ok boolean NOT NULL,
  payload      jsonb NOT NULL,
  processed_at timestamptz,
  error        text,
  received_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX webhook_events_resource_idx ON webhook_events (resource_id);

-- Registro de emails transaccionales
CREATE TABLE email_log (
  id           bigserial PRIMARY KEY,
  order_id     uuid REFERENCES orders(id),
  to_email     text NOT NULL,
  template     text NOT NULL,
  provider_id  text,
  status       text NOT NULL,                       -- sent | failed
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
--  ASESORÍA 1 A 1 (seguimiento de alumnos)
-- =====================================================================
CREATE TABLE coaching_clients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES customers(id),
  status            coaching_status NOT NULL DEFAULT 'aplicado',
  goal              text,                           -- objetivo declarado al aplicar
  experience_years  numeric(4,1),
  training_days     int,
  injuries          text,
  application       jsonb NOT NULL DEFAULT '{}',    -- respuestas completas del formulario
  start_date        date,
  next_checkin_date date,
  plan_product_id   uuid REFERENCES products(id),   -- plan de asesoría contratado
  coach_notes       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coaching_clients_status_idx ON coaching_clients (status);
CREATE UNIQUE INDEX coaching_clients_one_open_uq ON coaching_clients (customer_id)
  WHERE status IN ('aplicado', 'evaluacion_agendada', 'activo', 'pausado');
CREATE TRIGGER coaching_clients_updated BEFORE UPDATE ON coaching_clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Reporte semanal de progreso enviado por el alumno
CREATE TABLE coaching_checkins (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coaching_client_id uuid NOT NULL REFERENCES coaching_clients(id) ON DELETE CASCADE,
  week_number        int,
  weight_kg          numeric(5,2),
  waist_cm           numeric(5,1),
  sleep_hours        numeric(3,1),
  adherence_training smallint CHECK (adherence_training BETWEEN 0 AND 10),
  adherence_diet     smallint CHECK (adherence_diet BETWEEN 0 AND 10),
  energy             smallint CHECK (energy BETWEEN 0 AND 10),
  notes              text,
  photo_urls         text[] NOT NULL DEFAULT '{}',
  coach_feedback     text,
  reviewed_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coaching_checkins_client_idx ON coaching_checkins (coaching_client_id, created_at DESC);

-- Llamadas agendadas (Cal.com / Calendly webhook)
CREATE TABLE coaching_calls (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coaching_client_id uuid REFERENCES coaching_clients(id) ON DELETE CASCADE,
  provider           text NOT NULL DEFAULT 'cal.com',
  provider_event_id  text UNIQUE,
  kind               text NOT NULL DEFAULT 'evaluacion',  -- evaluacion | checkin
  scheduled_at       timestamptz NOT NULL,
  meeting_url        text,
  status             text NOT NULL DEFAULT 'scheduled',   -- scheduled | done | cancelled | no_show
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
--  TRANSFORMACIONES (Antes / Después)
-- =====================================================================
CREATE TABLE transformations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name  text NOT NULL,
  weeks        int,
  summary      text,
  before_url   text NOT NULL,
  after_url    text NOT NULL,
  consent      boolean NOT NULL DEFAULT false,      -- autorización de uso de imagen
  is_published boolean NOT NULL DEFAULT false,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT published_requires_consent CHECK (NOT is_published OR consent)
);

-- Vista rápida de ventas para el panel
CREATE VIEW sales_report AS
SELECT o.id AS order_id, o.paid_at, c.email, c.full_name,
       string_agg(oi.product_name, ', ') AS products,
       o.total_cents / 100.0 AS total, o.currency, o.delivered_at IS NOT NULL AS delivered
FROM orders o
JOIN customers c   ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY o.id, c.email, c.full_name;

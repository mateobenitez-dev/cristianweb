# Cristian Giudici · Plataforma web

Next.js 16 (App Router) + TypeScript + Tailwind v4 + PostgreSQL + Mercado Pago + Resend + GSAP.

## Arranque
```bash
npm install
cp .env.example .env.local      # completar credenciales
npm run db:schema && npm run db:seed
npm run dev
```
Sin `DATABASE_URL` el front levanta igual con datos de ejemplo (catálogo y transformaciones).

## Estructura
```
db/schema.sql                       Esquema SQL (clientes, productos, órdenes, pagos, webhooks, emails, alumnos 1 a 1, check-ins, llamadas, transformaciones)
db/seed.sql                         Rutinas + plan de asesoría de ejemplo
private/rutinas/*.pdf               PDFs que se adjuntan por email (NO públicos)
public/video/intro-loop(-1080).mp4  Loop de fondo de la intro (opcional; si falta queda fondo negro con grano)
public/logo/                        Logo oficial CG (SVG + PNG + favicons)
src/app/
  page.tsx                          Home: Intro SVG animada + Hero + Mi historia (scroll) + Antes/Después + rutinas
  rutinas/                          Tienda con filtro por nivel (?nivel=)
  asesoria/                         Landing 1 a 1 + aplicación + agenda Cal.com
  asesoria/reporte/                 Check-in semanal del alumno
  sobre-mi/                         Historia y filosofía
  checkout/success|failure/         Confirmación (lee el estado real desde la DB)
  api/checkout/                     Crea cliente + orden + preferencia MP
  api/webhooks/mercadopago/         Webhook: firma -> pago -> orden paid -> email con PDF
  api/asesoria/aplicar|reporte/     Alta de alumno / check-in
src/components/                     Intro, Hero, Logo, BeforeAfterSlider, RoutineCatalog, RoutineCard, CheckoutButton, ...
src/lib/                            db (pg), mercadopago (firma), email (Resend), catalog
```

## Flujo de venta
1. `POST /api/checkout` crea la orden `pending` y una preferencia con `external_reference = orders.id`.
2. MP llama a `POST /api/webhooks/mercadopago?data.id=…&type=payment`.
3. Se valida `x-signature` (HMAC con `MP_WEBHOOK_SECRET`), se consulta `GET /v1/payments/:id` (no se confía en el body), se guarda en `payments` (idempotente), se valida monto/moneda y la orden pasa a `paid`.
4. Con lock de fila se envía el email con el PDF (Resend, idempotency key por orden) y se marca `delivered_at`. Si el email falla responde 500 y MP reintenta.

**Moneda:** una cuenta argentina de MP cobra en ARS. Para eso: `MP_CURRENCY=ARS` y `MP_USD_RATE=<cotización>`; los precios siguen cargados en USD y se convierten al crear la orden.

## Pendiente de contenido
- Fotos reales: `public/hero-cristian.*`, `public/about-cristian.*`, transformaciones (con consentimiento).
- Loop de video para el fondo de la intro (opcional).
- PDFs de las rutinas en `private/rutinas/`.
- Historia real en `src/content/story.ts` (la usan la Home y Sobre mí).

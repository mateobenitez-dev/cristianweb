import { NextResponse } from "next/server";
import { z } from "zod";
import { query, tx } from "@/lib/db";
import { mpPreference } from "@/lib/mercadopago";
import type { Product } from "@/types";

export const runtime = "nodejs";

const Body = z.object({
  productSlug: z.string().min(1),
  email: z.email(),
  fullName: z.string().min(2).max(120),
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const CURRENCY = process.env.MP_CURRENCY ?? "USD";
// Precios cargados en USD. Si la cuenta de MP cobra en otra moneda (ej. ARS en Argentina) se convierte con este tipo de cambio.
const USD_RATE = Number(process.env.MP_USD_RATE ?? "1");

/**
 * POST /api/checkout
 * 1) crea/actualiza el cliente  2) crea la orden 'pending'  3) crea la preferencia de MP
 * La orden se identifica en MP por external_reference = orders.id
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { productSlug, email, fullName } = parsed.data;

  const [product] = await query<Product>(
    `SELECT * FROM products WHERE slug = $1 AND is_active LIMIT 1`,
    [productSlug],
  );
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const chargeCents = product.currency === CURRENCY ? product.price_cents : Math.round(product.price_cents * USD_RATE);

  const orderId = await tx(async (c) => {
    const { rows: [customer] } = await c.query<{ id: string }>(
      `INSERT INTO customers (email, full_name) VALUES ($1, $2)
       ON CONFLICT (lower(email)) DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, customers.full_name)
       RETURNING id`,
      [email.toLowerCase(), fullName],
    );
    const { rows: [order] } = await c.query<{ id: string }>(
      `INSERT INTO orders (customer_id, total_cents, currency) VALUES ($1, $2, $3) RETURNING id`,
      [customer.id, chargeCents, CURRENCY],
    );
    await c.query(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents) VALUES ($1, $2, $3, $4)`,
      [order.id, product.id, product.name, chargeCents],
    );
    return order.id;
  });

  const [firstName, ...rest] = fullName.trim().split(" ");
  const preference = await mpPreference.create({
    body: {
      external_reference: orderId,
      items: [
        {
          id: product.id,
          title: product.name,
          description: product.short_desc,
          category_id: "services",
          quantity: 1,
          currency_id: CURRENCY,
          unit_price: chargeCents / 100,
        },
      ],
      payer: { email, name: firstName, surname: rest.join(" ") || undefined },
      back_urls: {
        success: `${SITE}/checkout/success?order=${orderId}`,
        pending: `${SITE}/checkout/success?order=${orderId}`,
        failure: `${SITE}/checkout/failure?order=${orderId}`,
      },
      auto_return: "approved",
      notification_url: `${SITE}/api/webhooks/mercadopago?source_news=webhooks`,
      statement_descriptor: "CGIUDICI FIT",
      metadata: { order_id: orderId, product_slug: product.slug },
      expires: true,
      expiration_date_to: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    },
    requestOptions: { idempotencyKey: `pref-${orderId}` },
  });

  await query(`UPDATE orders SET mp_preference_id = $1 WHERE id = $2`, [preference.id, orderId]);

  return NextResponse.json({ orderId, initPoint: preference.init_point });
}

import { NextResponse, type NextRequest } from "next/server";
import { query, tx } from "@/lib/db";
import { mpPayment, verifyMpSignature } from "@/lib/mercadopago";
import { sendRoutineDelivery, type DeliveryItem } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MpPayment = Awaited<ReturnType<typeof mpPayment.get>>;

/**
 * Webhook de Mercado Pago  ->  POST /api/webhooks/mercadopago
 *
 * Flujo:
 *  1. Validar firma x-signature (HMAC SHA256 con MP_WEBHOOK_SECRET).
 *  2. Registrar el evento crudo en webhook_events.
 *  3. Si es "payment": consultar GET /v1/payments/:id (NUNCA confiar en el body).
 *  4. Upsert en payments (idempotente por mp_payment_id).
 *  5. approved  -> orden 'paid' (validando monto y moneda).
 *     refunded / charged_back -> orden 'refunded'.
 *  6. Si la orden está paga y no entregada -> email con el/los PDF -> delivered_at.
 *  7. 200 = procesado. 5xx = MP reintenta (backoff), lo que reintenta el envío del email.
 */
export async function POST(req: NextRequest) {
  const url = req.nextUrl;
  const rawBody = await req.text();
  let body: Record<string, any> = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { /* body vacío o IPN legacy */ }

  // Webhooks nuevos: ?data.id=123&type=payment | IPN legacy: ?id=123&topic=payment
  const topic = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = url.searchParams.get("data.id") ?? body?.data?.id?.toString() ?? url.searchParams.get("id");
  const requestId = req.headers.get("x-request-id");

  const signatureOk = verifyMpSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: requestId,
    dataId: url.searchParams.get("data.id") ?? dataId,
    secret: process.env.MP_WEBHOOK_SECRET ?? "",
  });

  const [event] = await query<{ id: number }>(
    `INSERT INTO webhook_events (topic, resource_id, request_id, signature_ok, payload)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [topic, dataId, requestId, signatureOk, { query: Object.fromEntries(url.searchParams), body }],
  );

  if (!signatureOk) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  if (topic !== "payment" || !dataId) {
    await markEvent(event.id);
    return NextResponse.json({ ignored: true });
  }

  try {
    const payment = await mpPayment.get({ id: dataId });
    const result = await handlePayment(payment);
    await markEvent(event.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mp-webhook]", dataId, message);
    await markEvent(event.id, message);
    // 500 -> Mercado Pago reintenta la notificación.
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}

async function handlePayment(p: MpPayment) {
  const orderId = p.external_reference ?? null;
  const amountCents = p.transaction_amount != null ? Math.round(p.transaction_amount * 100) : null;
  const status = p.status ?? "unknown";

  // ---- 4 + 5: registrar pago y actualizar orden (transacción) ----
  const order = await tx(async (c) => {
    await c.query(
      `INSERT INTO payments (order_id, mp_payment_id, status, status_detail, amount_cents, currency,
                             payment_method, payment_type, payer_email, raw, approved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (mp_payment_id) DO UPDATE SET
         status = EXCLUDED.status, status_detail = EXCLUDED.status_detail,
         raw = EXCLUDED.raw, approved_at = COALESCE(payments.approved_at, EXCLUDED.approved_at)`,
      [
        orderId, p.id, status, p.status_detail ?? null, amountCents, p.currency_id ?? null,
        p.payment_method_id ?? null, p.payment_type_id ?? null, p.payer?.email ?? null,
        JSON.stringify(p), p.date_approved ?? null,
      ],
    );
    if (!orderId) return null;

    const { rows: [o] } = await c.query<{ id: string; status: string; total_cents: number; currency: string; delivered_at: string | null }>(
      `SELECT id, status, total_cents, currency, delivered_at FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId],
    );
    if (!o) throw new Error(`Orden ${orderId} inexistente`);

    if (status === "approved" && o.status !== "paid") {
      // Defensa contra manipulación del monto en el checkout.
      if (amountCents !== o.total_cents || p.currency_id !== o.currency) {
        throw new Error(`Monto/moneda no coincide: pago ${amountCents} ${p.currency_id} vs orden ${o.total_cents} ${o.currency}`);
      }
      await c.query(`UPDATE orders SET status = 'paid', paid_at = COALESCE($2, now()) WHERE id = $1`, [o.id, p.date_approved ?? null]);
      o.status = "paid";
    } else if ((status === "refunded" || status === "charged_back") && o.status === "paid") {
      await c.query(`UPDATE orders SET status = 'refunded' WHERE id = $1`, [o.id]);
      o.status = "refunded";
    } else if ((status === "rejected" || status === "cancelled") && o.status === "pending") {
      // No se marca 'failed' definitivo: el cliente puede reintentar con otra tarjeta sobre la misma preferencia.
    }
    return o;
  });

  if (!order || order.status !== "paid" || order.delivered_at) {
    return { orderId, status, delivered: Boolean(order?.delivered_at) };
  }

  // ---- 6: entrega por email (lock de fila para no duplicar en notificaciones concurrentes) ----
  await deliverOrder(order.id);
  return { orderId, status, delivered: true };
}

async function deliverOrder(orderId: string) {
  await tx(async (c) => {
    const { rows: [o] } = await c.query<{ delivered_at: string | null; currency: string; email: string; full_name: string | null }>(
      `SELECT o.delivered_at, o.currency, cu.email, cu.full_name
         FROM orders o JOIN customers cu ON cu.id = o.customer_id
        WHERE o.id = $1 FOR UPDATE OF o`,
      [orderId],
    );
    if (!o || o.delivered_at) return; // otra notificación ya lo entregó

    const { rows: items } = await c.query<DeliveryItem>(
      `SELECT oi.product_name AS name, p.pdf_path, oi.unit_price_cents
         FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1`,
      [orderId],
    );

    try {
      const providerId = await sendRoutineDelivery({
        orderId, to: o.email, customerName: o.full_name, items, currency: o.currency,
      });
      await c.query(`UPDATE orders SET delivered_at = now() WHERE id = $1`, [orderId]);
      await c.query(
        `INSERT INTO email_log (order_id, to_email, template, provider_id, status) VALUES ($1,$2,'routine_delivery',$3,'sent')`,
        [orderId, o.email, providerId],
      );
    } catch (err) {
      // Log fuera de la transacción (que se va a revertir) y re-lanzar para que MP reintente.
      await query(
        `INSERT INTO email_log (order_id, to_email, template, status, error) VALUES ($1,$2,'routine_delivery','failed',$3)`,
        [orderId, o.email, err instanceof Error ? err.message : String(err)],
      );
      throw err;
    }
  });
}

async function markEvent(id: number, error?: string) {
  await query(`UPDATE webhook_events SET processed_at = now(), error = $2 WHERE id = $1`, [id, error ?? null]);
}

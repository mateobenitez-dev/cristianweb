import Link from "next/link";
import type { Metadata } from "next";
import { hasDb, query } from "@/lib/db";
import { AutoRefresh } from "./AutoRefresh";

export const metadata: Metadata = { title: "¡Compra confirmada!", robots: { index: false } };
export const dynamic = "force-dynamic";

type Search = Promise<{ order?: string; external_reference?: string; status?: string }>;

const UUID = /^[0-9a-f-]{36}$/i;

export default async function SuccessPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const orderId = sp.order ?? sp.external_reference;

  // El estado real lo define el webhook (DB), no los query params que agrega MP al redirigir.
  type OrderView = { status: string; delivered_at: string | null; email: string; products: string };
  let order: OrderView | undefined;
  if (hasDb && orderId && UUID.test(orderId)) {
    [order] = await query<OrderView>(
      `SELECT o.status, o.delivered_at, c.email, string_agg(oi.product_name, ', ') AS products
         FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = $1 GROUP BY o.id, c.email`,
      [orderId],
    );
  }

  const paid = order?.status === "paid";
  const masked = order?.email.replace(/^(.{2}).*(@.*)$/, "$1•••$2");

  return (
    <section className="container-x flex min-h-[70dvh] items-center py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 ${paid ? "border-gold text-gold" : "border-neutral-600 text-neutral-400"}`}>
          {paid ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
          ) : (
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </div>

        {paid ? (
          <>
            <h1 className="mt-6 text-4xl sm:text-5xl">¡Pago confirmado!</h1>
            <p className="mt-4 text-lg text-neutral-300">
              {order?.delivered_at ? "Ya te enviamos" : "En segundos te llega"} <b className="text-white">{order?.products}</b> a <b className="text-white">{masked}</b>.
            </p>
            <p className="mt-2 text-sm text-neutral-500">¿No lo ves? Revisá spam/promociones o escribinos.</p>
          </>
        ) : (
          <>
            <AutoRefresh />
            <h1 className="mt-6 text-4xl sm:text-5xl">Confirmando tu pago…</h1>
            <p className="mt-4 text-neutral-300">
              Mercado Pago nos está notificando. Si pagaste en efectivo o transferencia, puede demorar unas horas: apenas se acredite te llega el PDF por email.
            </p>
          </>
        )}

        <div className="mt-10 rounded-2xl border border-gold/50 bg-surface p-6 text-left">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-gold">Siguiente nivel</p>
          <p className="mt-2 text-neutral-300">¿Querés que te acompañe semana a semana y ajuste el plan a tu progreso?</p>
          <Link href="/asesoria" className="btn-gold mt-4">Conocer la Asesoría 1 a 1</Link>
        </div>
      </div>
    </section>
  );
}

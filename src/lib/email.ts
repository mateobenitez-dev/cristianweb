import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { formatPrice } from "./format";

let _resend: Resend | null = null;
const resend = () => (_resend ??= new Resend(process.env.RESEND_API_KEY));
const FROM = process.env.EMAIL_FROM ?? "Cristian Giudici <rutinas@example.com>";
const ADMIN = process.env.EMAIL_ADMIN;

export interface DeliveryItem {
  name: string;
  pdf_path: string | null;
  unit_price_cents: number;
}

/** Carga un PDF desde /private (empaquetado con la función) o desde una URL firmada (S3 / Supabase Storage). */
async function loadPdf(pdfPath: string): Promise<Buffer> {
  if (/^https?:\/\//.test(pdfPath)) {
    const res = await fetch(pdfPath);
    if (!res.ok) throw new Error(`No se pudo descargar el PDF (${res.status}): ${pdfPath}`);
    return Buffer.from(await res.arrayBuffer());
  }
  // Solo se permite leer dentro de /private/rutinas (basename evita path traversal).
  return fs.readFile(path.join(process.cwd(), "private", "rutinas", path.basename(pdfPath)));
}

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

export async function sendRoutineDelivery(args: {
  orderId: string;
  to: string;
  customerName: string | null;
  items: DeliveryItem[];
  currency: string;
}) {
  const { orderId, to, customerName, items, currency } = args;

  const attachments = await Promise.all(
    items
      .filter((i) => i.pdf_path)
      .map(async (i) => ({ filename: `${slugify(i.name)}.pdf`, content: await loadPdf(i.pdf_path!) })),
  );

  const name = customerName?.split(" ")[0] ?? "crack";
  const rows = items
    .map((i) => `<tr><td style="padding:8px 0;color:#e5e5e5">${i.name}</td><td style="padding:8px 0;text-align:right;color:#ffffff">${formatPrice(i.unit_price_cents, currency)}</td></tr>`)
    .join("");

  const html = `
  <div style="background:#000;padding:32px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #1f1f1f;border-radius:12px;padding:32px">
      <h1 style="margin:0 0 8px;color:#fff;font-size:24px">¡Bienvenido al equipo, ${name}! 💪</h1>
      <p style="color:#a3a3a3;line-height:1.6">Tu pago fue confirmado. Adjunto a este email tenés tu rutina en PDF. Guardala, imprimila y empezá esta semana.</p>
      <table style="width:100%;border-top:1px solid #262626;margin:24px 0">${rows}</table>
      <p style="color:#a3a3a3;line-height:1.6">Tips para arrancar: leé la sección de técnica antes del día 1, registrá tus cargas y respetá los descansos.</p>
      <p style="color:#a3a3a3;line-height:1.6">¿Querés que te acompañe semana a semana? Conocé la <a href="${process.env.NEXT_PUBLIC_SITE_URL}/asesoria" style="color:#ffffff;text-decoration:underline">Asesoría Premium 1 a 1</a>.</p>
      <p style="color:#525252;font-size:12px;margin-top:32px">Pedido #${orderId.slice(0, 8)} · Uso personal, prohibida su redistribución.</p>
    </div>
  </div>`;

  const { data, error } = await resend().emails.send(
    {
      from: FROM,
      to,
      bcc: ADMIN ? [ADMIN] : undefined,
      subject: items.length === 1 ? `Tu rutina: ${items[0].name}` : "Tus rutinas de Cristian Giudici",
      html,
      attachments,
    },
    // Si MP reintenta el webhook y llegamos de nuevo acá, Resend no duplica el envío.
    { idempotencyKey: `order-delivery-${orderId}` },
  );
  if (error) throw new Error(`Resend: ${error.message}`);
  return data?.id ?? null;
}

export async function notifyAdmin(subject: string, html: string) {
  if (!ADMIN) return;
  const { error } = await resend().emails.send({ from: FROM, to: ADMIN, subject, html });
  if (error) console.error("[email] notifyAdmin", error);
}

import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN ?? "";
export const mp = new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
export const mpPreference = new Preference(mp);
export const mpPayment = new Payment(mp);

/**
 * Valida el header x-signature de Mercado Pago.
 *   x-signature: ts=1704908010,v1=<hmac_sha256_hex>
 *   manifest:    id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * data.id viene del query string; si es alfanumérico se compara en minúsculas.
 * Doc: https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMpSignature(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
  toleranceSec?: number;
}): boolean {
  const { xSignature, xRequestId, dataId, secret, toleranceSec = 60 * 10 } = opts;
  if (!xSignature || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((kv) => {
      const [k, ...v] = kv.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Anti-replay: ts viene en milisegundos o segundos según la versión del emisor.
  const tsMs = ts.length > 10 ? Number(ts) : Number(ts) * 1000;
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > toleranceSec * 1000) return false;

  let manifest = "";
  if (dataId) manifest += `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};`;
  if (xRequestId) manifest += `request-id:${xRequestId};`;
  manifest += `ts:${ts};`;

  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

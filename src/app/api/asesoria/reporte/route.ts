import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { notifyAdmin } from "@/lib/email";

export const runtime = "nodejs";

const score = z.coerce.number().int().min(0).max(10);
const Body = z.object({
  email: z.email(),
  weightKg: z.coerce.number().min(30).max(250),
  waistCm: z.coerce.number().min(40).max(200).optional(),
  sleepHours: z.coerce.number().min(0).max(14),
  adherenceTraining: score,
  adherenceDiet: score,
  energy: score,
  notes: z.string().max(3000).optional(),
});

/**
 * POST /api/asesoria/reporte -> check-in semanal del alumno activo.
 * TODO (fase 2): reemplazar la identificación por email por login con magic link.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisá los campos" }, { status: 400 });
  const d = parsed.data;

  const [client] = await query<{ id: string; full_name: string | null }>(
    `SELECT cc.id, cu.full_name FROM coaching_clients cc JOIN customers cu ON cu.id = cc.customer_id
      WHERE lower(cu.email) = lower($1) AND cc.status = 'activo' LIMIT 1`,
    [d.email],
  );
  if (!client) return NextResponse.json({ error: "No encontramos una asesoría activa con ese email" }, { status: 404 });

  await query(
    `INSERT INTO coaching_checkins (coaching_client_id, week_number, weight_kg, waist_cm, sleep_hours,
                                    adherence_training, adherence_diet, energy, notes)
     VALUES ($1, (SELECT count(*) + 1 FROM coaching_checkins WHERE coaching_client_id = $1), $2,$3,$4,$5,$6,$7,$8)`,
    [client.id, d.weightKg, d.waistCm ?? null, d.sleepHours, d.adherenceTraining, d.adherenceDiet, d.energy, d.notes ?? null],
  );
  await query(`UPDATE coaching_clients SET next_checkin_date = current_date + 7 WHERE id = $1`, [client.id]);

  await notifyAdmin(
    `Check-in: ${client.full_name ?? d.email}`,
    `<p>Peso ${d.weightKg} kg · Sueño ${d.sleepHours} h · Entreno ${d.adherenceTraining}/10 · Dieta ${d.adherenceDiet}/10 · Energía ${d.energy}/10</p><p>${d.notes ?? ""}</p>`,
  );
  return NextResponse.json({ ok: true });
}

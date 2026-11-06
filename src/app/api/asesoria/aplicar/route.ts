import { NextResponse } from "next/server";
import { z } from "zod";
import { tx } from "@/lib/db";
import { notifyAdmin } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  fullName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(6).max(30),
  country: z.string().min(2).max(60),
  instagram: z.string().max(60).optional().or(z.literal("")),
  goal: z.enum(["perder_grasa", "ganar_musculo", "recomposicion", "competir"]),
  experienceYears: z.coerce.number().min(0).max(50),
  trainingDays: z.coerce.number().int().min(1).max(7),
  injuries: z.string().max(1000).optional().or(z.literal("")),
  why: z.string().min(10).max(2000),
});

/** POST /api/asesoria/aplicar -> crea el alumno en estado 'aplicado' y devuelve el link para agendar la evaluación. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisá los campos", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  try {
    await tx(async (c) => {
      const { rows: [cu] } = await c.query<{ id: string }>(
        `INSERT INTO customers (email, full_name, phone, country, instagram) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (lower(email)) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone,
           country = EXCLUDED.country, instagram = COALESCE(NULLIF(EXCLUDED.instagram,''), customers.instagram)
         RETURNING id`,
        [d.email.toLowerCase(), d.fullName, d.phone, d.country, d.instagram || null],
      );
      await c.query(
        `INSERT INTO coaching_clients (customer_id, goal, experience_years, training_days, injuries, application)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [cu.id, d.goal, d.experienceYears, d.trainingDays, d.injuries || null, d],
      );
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Ya tenés una aplicación activa. Te escribimos pronto." }, { status: 409 });
    }
    throw err;
  }

  await notifyAdmin(
    `Nueva aplicación a Asesoría: ${d.fullName}`,
    `<p><b>${d.fullName}</b> (${d.email}, ${d.phone}, ${d.country})</p><p>Objetivo: ${d.goal} · ${d.experienceYears} años · ${d.trainingDays} días/sem</p><p>${d.why}</p>`,
  );

  return NextResponse.json({ ok: true, calUrl: process.env.NEXT_PUBLIC_CAL_URL });
}

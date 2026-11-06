import "server-only";
import { hasDb, query } from "./db";
import type { Level, Product, Transformation } from "@/types";

// Datos de ejemplo para poder levantar el front sin base de datos (npm run dev sin DATABASE_URL).
const DEMO_PRODUCTS: Product[] = [
  { id: "demo-1", slug: "base-natural", type: "rutina", name: "Base Natural", short_desc: "Construí la técnica y el hábito con un full body progresivo.", description: null, level: "principiante", duration_weeks: 12, days_per_week: 3, price_cents: 9900, currency: "USD", pdf_path: null, cover_image: null, features: ["3 días por semana", "Videos de técnica", "Guía de nutrición inicial"] },
  { id: "demo-2", slug: "hipertrofia-torso-pierna", type: "rutina", name: "Hipertrofia Torso/Pierna", short_desc: "Volumen bien distribuido para ganar masa muscular limpia.", description: null, level: "intermedio", duration_weeks: 16, days_per_week: 4, price_cents: 19900, currency: "USD", pdf_path: null, cover_image: null, features: ["4 días por semana", "Periodización por bloques", "Planilla de seguimiento"] },
  { id: "demo-3", slug: "ppl-natural-pro", type: "rutina", name: "PPL Natural Pro", short_desc: "El sistema que usa Cristian en temporada fuera de competencia.", description: null, level: "avanzado", duration_weeks: 20, days_per_week: 6, price_cents: 40000, currency: "USD", pdf_path: null, cover_image: null, features: ["6 días por semana", "Técnicas de intensidad", "Protocolo de deload"] },
];

const DEMO_TRANSFORMATIONS: Transformation[] = [
  { id: "t1", client_name: "Martín R.", weeks: 16, summary: "-9 kg de grasa manteniendo fuerza", before_url: "/transformaciones/antes-1.svg", after_url: "/transformaciones/despues-1.svg" },
  { id: "t2", client_name: "Lucía P.", weeks: 20, summary: "Recomposición corporal completa", before_url: "/transformaciones/antes-2.svg", after_url: "/transformaciones/despues-2.svg" },
  { id: "t3", client_name: "Diego S.", weeks: 24, summary: "+6 kg de masa magra, 100% natural", before_url: "/transformaciones/antes-3.svg", after_url: "/transformaciones/despues-3.svg" },
];

export async function getRoutines(level?: Level): Promise<Product[]> {
  if (!hasDb) return level ? DEMO_PRODUCTS.filter((p) => p.level === level) : DEMO_PRODUCTS;
  return query<Product>(
    `SELECT id, slug, type, name, short_desc, description, level, duration_weeks, days_per_week,
            price_cents, currency, pdf_path, cover_image, features
       FROM products
      WHERE is_active AND type = 'rutina' AND ($1::difficulty_level IS NULL OR level = $1)
      ORDER BY sort_order, price_cents`,
    [level ?? null],
  );
}

export async function getTransformations(): Promise<Transformation[]> {
  if (!hasDb) return DEMO_TRANSFORMATIONS;
  const rows = await query<Transformation>(
    `SELECT id, client_name, weeks, summary, before_url, after_url
       FROM transformations WHERE is_published ORDER BY sort_order LIMIT 12`,
  );
  return rows.length ? rows : DEMO_TRANSFORMATIONS;
}

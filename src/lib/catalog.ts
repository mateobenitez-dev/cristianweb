import "server-only";
import { hasDb, query } from "./db";
import type { Level, Product, Transformation } from "@/types";

// Datos de ejemplo para levantar el front sin base de datos. Textos vacíos = cartel "Poner texto acá".
const DEMO_PRODUCTS: Product[] = [
  { id: "demo-1", slug: "base-natural", type: "rutina", name: "Base Natural", short_desc: "", description: null, level: "principiante", duration_weeks: null, days_per_week: null, price_cents: 9900, currency: "USD", pdf_path: null, cover_image: null, features: [] },
  { id: "demo-2", slug: "hipertrofia-torso-pierna", type: "rutina", name: "Hipertrofia Torso/Pierna", short_desc: "", description: null, level: "intermedio", duration_weeks: null, days_per_week: null, price_cents: 19900, currency: "USD", pdf_path: null, cover_image: null, features: [] },
  { id: "demo-3", slug: "ppl-natural-pro", type: "rutina", name: "PPL Natural Pro", short_desc: "", description: null, level: "avanzado", duration_weeks: null, days_per_week: null, price_cents: 40000, currency: "USD", pdf_path: null, cover_image: null, features: [] },
];

const DEMO_TRANSFORMATIONS: Transformation[] = [
  { id: "t1", client_name: "Alumno 1", weeks: null, summary: null, before_url: "/transformaciones/antes-1.svg", after_url: "/transformaciones/despues-1.svg" },
  { id: "t2", client_name: "Alumno 2", weeks: null, summary: null, before_url: "/transformaciones/antes-2.svg", after_url: "/transformaciones/despues-2.svg" },
  { id: "t3", client_name: "Alumno 3", weeks: null, summary: null, before_url: "/transformaciones/antes-3.svg", after_url: "/transformaciones/despues-3.svg" },
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

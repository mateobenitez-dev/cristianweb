export type Level = "principiante" | "intermedio" | "avanzado";

export interface Product {
  id: string;
  slug: string;
  type: "rutina" | "asesoria";
  name: string;
  short_desc: string;
  description: string | null;
  level: Level | null;
  duration_weeks: number | null;
  days_per_week: number | null;
  price_cents: number;
  currency: string;
  pdf_path: string | null;
  cover_image: string | null;
  features: string[];
}

export interface Transformation {
  id: string;
  client_name: string;
  weeks: number | null;
  summary: string | null;
  before_url: string;
  after_url: string;
}

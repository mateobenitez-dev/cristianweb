import { CheckoutButton } from "./CheckoutButton";
import { formatPrice, LEVEL_LABEL } from "@/lib/format";
import type { Product } from "@/types";

const LEVEL_STYLE = {
  principiante: "border-neutral-600 text-neutral-400",
  intermedio: "border-neutral-300 text-neutral-200",
  avanzado: "border-white bg-white text-ink",
} as const;

export function RoutineCard({ p }: { p: Product }) {
  const featured = p.level === "avanzado";
  return (
    <article className={`relative flex flex-col rounded-2xl border bg-surface p-6 transition hover:-translate-y-1 ${featured ? "border-gold shadow-xl shadow-white/5" : "border-line"}`}>
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">El que uso yo</span>
      )}
      {p.level && (
        <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${LEVEL_STYLE[p.level]}`}>
          {LEVEL_LABEL[p.level]}
        </span>
      )}
      <h3 className="mt-4 text-2xl">{p.name}</h3>
      <p className="mt-2 text-sm text-neutral-400">{p.short_desc}</p>

      <div className="mt-4 flex gap-4 text-xs uppercase tracking-wider text-neutral-400">
        {p.duration_weeks && <span>{p.duration_weeks} semanas</span>}
        {p.days_per_week && <span>{p.days_per_week} días/sem</span>}
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {p.features.map((f) => (
          <li key={f} className="flex gap-2"><span className="text-gold">✓</span>{f}</li>
        ))}
      </ul>

      <p className="mt-6 font-display text-4xl text-white">
        {formatPrice(p.price_cents, p.currency)} <span className="text-sm font-sans normal-case text-neutral-500">pago único</span>
      </p>
      <div className="mt-4"><CheckoutButton productSlug={p.slug} /></div>
      <p className="mt-3 text-center text-xs text-neutral-500">PDF al instante en tu email</p>
    </article>
  );
}

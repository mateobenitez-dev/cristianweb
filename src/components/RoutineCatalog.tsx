"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVEL_LABEL } from "@/lib/format";
import { RoutineCard } from "./RoutineCard";
import type { Level, Product } from "@/types";

const FILTERS: (Level | "todas")[] = ["todas", "principiante", "intermedio", "avanzado"];

/** Filtro por nivel sincronizado con ?nivel= (link compartible). Filtra en cliente: sin round-trip al server. */
export function RoutineCatalog({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = (params.get("nivel") as Level | null) ?? "todas";
  const visible = active === "todas" ? products : products.filter((p) => p.level === active);

  return (
    <>
      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={active === f}
            onClick={() => router.replace(f === "todas" ? "/rutinas" : `/rutinas?nivel=${f}`, { scroll: false })}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-wider transition ${
              active === f ? "border-white bg-white text-ink" : "border-line text-neutral-300 hover:border-gold hover:text-gold"
            }`}
          >
            {f === "todas" ? "Todas" : LEVEL_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => <RoutineCard key={p.id} p={p} />)}
        {!visible.length && <p className="text-neutral-400">No hay rutinas para este nivel todavía.</p>}
      </div>
    </>
  );
}

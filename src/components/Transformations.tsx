import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Placeholder } from "./Placeholder";
import type { Transformation } from "@/types";

export function Transformations({ items }: { items: Transformation[] }) {
  return (
    <section id="transformaciones" className="py-20">
      <div className="container-x">
        <p className="text-sm font-bold uppercase tracking-[.3em] text-brand">Resultados reales</p>
        <h2 className="mt-2 text-4xl sm:text-5xl">Transformaciones</h2>
        <p className="mt-3 max-w-xl text-neutral-400">Arrastrá el divisor para comparar.</p>

        {/* Mobile: carrusel con scroll-snap · Desktop: grilla */}
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {items.map((t) => (
            <figure key={t.id} className="w-[80%] shrink-0 snap-center md:w-auto">
              <BeforeAfterSlider before={t.before_url} after={t.after_url} alt={t.client_name} />
              <figcaption className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-lg uppercase text-white">{t.client_name}</span>
                {t.weeks && <span className="text-sm text-gold">{t.weeks} semanas</span>}
              </figcaption>
              {t.summary ? <p className="text-sm text-neutral-400">{t.summary}</p> : <Placeholder className="mt-2" label="Poner fotos y resultado del alumno" />}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

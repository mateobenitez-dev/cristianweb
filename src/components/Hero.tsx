import Link from "next/link";
import { CGMark } from "./CGMark";
import { LoopVideo } from "./LoopVideo";
import { Placeholder } from "./Placeholder";

export const INSTAGRAM = "https://instagram.com/cristiangiudicii";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Mismo loop que la intro: ya está en caché y la transición queda continua */}
      <LoopVideo src="/video/intro-loop.mp4" poster="/img/intro-poster.jpg"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_25%] opacity-70 grayscale md:left-auto md:w-[55%]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/20 md:bg-gradient-to-r md:from-ink md:via-ink/80 md:to-transparent" />

      <div className="container-x flex min-h-[88dvh] flex-col justify-end pb-16 pt-24 md:justify-center md:pb-0">
        {/* Destino del logo de la intro animada */}
        <div data-hero-logo className="w-28 sm:w-36"><CGMark idPrefix="hero" className="block h-auto w-full" /></div>

        <p data-hero-line className="mt-8 text-sm font-bold uppercase tracking-[.35em] text-gold">Fisicoculturista natural · Entrenador online</p>
        <h1 data-hero-line className="mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
          Construí un físico <span className="text-outline">de verdad</span>. Sin atajos.
        </h1>
        <div data-hero-line className="mt-6"><Placeholder /></div>
        <div data-hero-line className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/rutinas" className="btn-primary">Comprar rutinas</Link>
          <Link href="/asesoria" className="btn-gold">Asesoría Premium 1 a 1</Link>
        </div>
        <dl data-hero-line className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
          {[["134K", "seguidores en IG"], ["", "Poner dato"], ["100%", "natural"]].map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-3xl text-white">{n || <Placeholder label="Dato" className="!py-1" />}</dt>
              <dd className="text-xs uppercase tracking-wider text-neutral-400">{l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

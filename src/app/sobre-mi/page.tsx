import Image from "next/image";
import Link from "next/link";
import { LoopVideo } from "@/components/LoopVideo";
import { Placeholder } from "@/components/Placeholder";
import type { Metadata } from "next";
import { PILLARS, STORY as TIMELINE } from "@/content/story";

export const metadata: Metadata = { title: "Sobre mí" };


export default function SobreMiPage() {
  return (
    <>
      <section className="container-x grid items-center gap-12 py-16 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
          <LoopVideo src="/video/sobre-mi.mp4" poster="/img/sobre-mi-poster.jpg" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[.3em] text-gold">Mi historia</p>
          <h1 className="mt-2 text-5xl">Cristian Giudici</h1>
          <p className="mt-2 text-neutral-400">Fisicoculturista natural · Entrenador online</p>
          <div className="mt-6"><Placeholder /></div>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <div className="container-x">
          <h2 className="text-4xl">El recorrido</h2>
          <ol className="mt-10 space-y-8 border-l border-brand/60 pl-6">
            {TIMELINE.map((t) => (
              <li key={t.title} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-brand" />
                {t.year ? <p className="font-display text-2xl text-gold">{t.year}</p> : <Placeholder label="Poner año" />}
                <p className="mt-1 text-neutral-300"><b className="text-white">{t.title}</b></p>
                {t.text ? <p className="text-neutral-300">{t.text}</p> : <Placeholder className="mt-2" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x pt-16">
        <h2 className="text-4xl">En la tarima</h2>
        <p className="mt-2 text-neutral-400">UFA Winter</p>
        <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {["escenario-frente-medallas", "escenario-grito", "escenario-perfil", "hero-medalla"].map((f) => (
            <div key={f} className="relative aspect-[3/4] w-48 shrink-0 snap-start overflow-hidden rounded-xl border border-line">
              <Image src={`/img/${f}.webp`} alt="Cristian Giudici compitiendo" fill sizes="192px" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-4xl">Mi filosofía</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILLARS.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-xl text-gold">{title}</h3>
              {text ? <p className="mt-2 text-neutral-400">{text}</p> : <div className="mt-3"><Placeholder /></div>}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link href="/rutinas" className="btn-primary">Ver rutinas</Link>
          <Link href="/asesoria" className="btn-gold">Trabajemos juntos</Link>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { StoryScroll } from "@/components/StoryScroll";
import { Transformations } from "@/components/Transformations";
import { RoutineCard } from "@/components/RoutineCard";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { getRoutines, getTransformations } from "@/lib/catalog";

export const revalidate = 300;

export default async function HomePage() {
  const [routines, transformations] = await Promise.all([getRoutines(), getTransformations()]);

  return (
    <>
      <Intro />
      <Hero />
      <StoryScroll />

      {/* Dos caminos */}
      <section className="border-y border-line bg-surface py-20">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <div className="relative isolate overflow-hidden rounded-2xl border border-line bg-ink p-8">
            <Image src="/img/gym-cartel-old-school.webp" alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="-z-10 object-cover opacity-30 grayscale" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[.3em] text-neutral-400">Autónomo</p>
            <h2 className="mt-2 text-3xl">Rutinas pre-hechas</h2>
            <p className="mt-3 text-neutral-400">Programas cerrados por nivel. Pagás una vez y el PDF te llega al email en segundos.</p>
            <Link href="/rutinas" className="btn-primary mt-6">Ver rutinas</Link>
          </div>
          <div className="relative isolate overflow-hidden rounded-2xl border border-gold/60 p-8">
            <Image src="/img/gym-espalda.webp" alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="-z-10 object-cover opacity-35 grayscale" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[.3em] text-gold">Premium</p>
            <h2 className="mt-2 text-3xl">Asesoría 1 a 1</h2>
            <p className="mt-3 text-neutral-300">Como un PT presencial, pero online: plan a medida, check-ins semanales y ajustes constantes.</p>
            <Link href="/asesoria" className="btn-gold mt-6">Quiero aplicar</Link>
          </div>
        </div>
      </section>

      <Transformations items={transformations} />

      <section className="pb-28 md:pb-20">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-4xl sm:text-5xl">Rutinas</h2>
            <Link href="/rutinas" className="text-sm uppercase tracking-wider text-gold hover:underline">Ver todas →</Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {routines.slice(0, 3).map((p) => <RoutineCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      <StickyMobileCTA />
    </>
  );
}

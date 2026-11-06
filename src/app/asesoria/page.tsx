import Image from "next/image";
import Link from "next/link";
import { LoopVideo } from "@/components/LoopVideo";
import type { Metadata } from "next";
import { CoachingApplyForm } from "@/components/CoachingApplyForm";

export const metadata: Metadata = {
  title: "Asesoría Premium 1 a 1",
  description: "Coaching online continuo: plan a medida, check-ins semanales y ajustes constantes. Como un PT presencial, pero online.",
};

const INCLUDES = [
  ["Plan 100% personalizado", "Entrenamiento y nutrición armados para tu cuerpo, tu agenda y tu objetivo."],
  ["Check-in semanal", "Reportás peso, medidas, fotos y sensaciones. Yo analizo y ajusto."],
  ["Corrección de técnica", "Mandás videos de tus series y te devuelvo correcciones puntuales."],
  ["Chat directo conmigo", "Dudas en el súper, en el gym o de viaje: respondo yo, no un bot."],
  ["Llamadas de seguimiento", "Videollamadas periódicas para revisar el proceso y planificar el bloque."],
  ["Ajustes constantes", "Si te estancás o cambia tu vida, el plan cambia contigo. Sin esperar al mes siguiente."],
];

const STEPS = ["Aplicás con el formulario", "Agendás la llamada de evaluación", "Si hay match, arrancamos con tu plan en 72 h"];

export default function AsesoriaPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <Image src="/img/gym-con-alumno.webp" alt="Cristian entrenando a un alumno" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_30%] opacity-50 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/30 md:bg-gradient-to-r md:from-ink md:via-ink/80 md:to-transparent" />
        <div className="container-x py-20">
          <p className="text-sm font-bold uppercase tracking-[.35em] text-gold">Premium · Cupos limitados</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
            No es una videollamada. <span className="text-outline">Es un acompañamiento.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-neutral-300">
            Trabajo con vos como un personal trainer presencial, pero online: te sigo semana a semana, corrijo, ajusto y te hago responsable del proceso.
          </p>
          <Link href="#aplicar" className="btn-primary mt-8">Aplicar al programa</Link>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {[["gym-corrigiendo-postura", "Corrección de postura en sala"], ["gym-entrenando-alumno", "Ajuste de técnica en cada serie"]].map(([f, alt]) => (
            <figure key={f} className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
              <Image src={`/img/${f}.webp`} alt={alt} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 text-sm uppercase tracking-wider text-white">{alt}</figcaption>
            </figure>
          ))}
        </div>
        <h2 className="text-4xl">Qué incluye</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDES.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-xl text-white">{t}</h3>
              <p className="mt-2 text-neutral-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface py-20">
        <div className="container-x grid items-center gap-12 md:grid-cols-[1fr_320px]">
          <div>
          <h2 className="text-4xl">Cómo funciona</h2>
          <ol className="mt-10 grid gap-6">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="font-display text-5xl text-outline">{i + 1}</span>
                <p className="pt-2 text-lg text-neutral-200">{s}</p>
              </li>
            ))}
          </ol>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border border-gold/40">
            <LoopVideo src="/video/asesoria-polea.mp4" poster="/img/asesoria-polea-poster.jpg" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section id="aplicar" className="container-x scroll-mt-20 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gold/50 bg-surface p-6 sm:p-10">
          <CoachingApplyForm />
        </div>
      </section>
    </>
  );
}

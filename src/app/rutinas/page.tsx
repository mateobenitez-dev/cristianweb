import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { RoutineCatalog } from "@/components/RoutineCatalog";
import { getRoutines } from "@/lib/catalog";

export const metadata: Metadata = { title: "Rutinas", description: "Programas de entrenamiento por nivel: principiante, intermedio y avanzado." };
export const revalidate = 300;

export default async function RutinasPage() {
  const products = await getRoutines();
  return (
    <section className="py-16">
      <div className="container-x">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_340px]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.3em] text-brand">Tienda</p>
            <h1 className="mt-2 text-5xl sm:text-6xl">Rutinas</h1>
            <p className="mt-3 max-w-xl text-neutral-400">Elegí tu nivel. Pago único con Mercado Pago y el PDF llega automáticamente a tu email.</p>
            <p className="mt-6 font-display text-2xl uppercase text-white">Sumate al <span className="text-gold">Team Giudici</span></p>
          </div>
          <div className="relative hidden aspect-[3/4] overflow-hidden rounded-2xl border border-line md:block">
            <Image src="/img/tienda-remera-team-giudici.webp" alt="Alumnos con la remera Team Giudici" fill priority sizes="340px" className="object-cover" />
          </div>
        </div>
        <div className="mt-10">
          <Suspense>
            <RoutineCatalog products={products} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

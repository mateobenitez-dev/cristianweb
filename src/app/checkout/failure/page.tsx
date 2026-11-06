import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pago no completado", robots: { index: false } };

export default function FailurePage() {
  return (
    <section className="container-x flex min-h-[70dvh] items-center py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl sm:text-5xl">El pago no se completó</h1>
        <p className="mt-4 text-neutral-300">No se realizó ningún cobro. Probá con otro medio de pago o tarjeta.</p>
        <Link href="/rutinas" className="btn-primary mt-8">Volver a intentar</Link>
      </div>
    </section>
  );
}

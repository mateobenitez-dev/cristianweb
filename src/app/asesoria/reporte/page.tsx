import type { Metadata } from "next";
import { ProgressReportForm } from "./ProgressReportForm";

export const metadata: Metadata = { title: "Reporte semanal", robots: { index: false } };

export default function ReportePage() {
  return (
    <section className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[.3em] text-gold">Alumnos 1 a 1</p>
        <h1 className="mt-2 text-5xl">Reporte semanal</h1>
        <p className="mt-3 text-neutral-400">Completalo el mismo día cada semana, en ayunas y después de ir al baño.</p>
        <div className="mt-10 rounded-2xl border border-line bg-surface p-6 sm:p-8"><ProgressReportForm /></div>
      </div>
    </section>
  );
}

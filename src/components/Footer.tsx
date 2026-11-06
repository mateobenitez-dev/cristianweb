import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg uppercase tracking-widest text-white">Cristian <span className="text-neutral-400">Giudici</span></p>
          <p className="mt-2 text-sm text-neutral-400">Fisicoculturista natural · Entrenador online</p>
          <a href="https://instagram.com/cristiangiudicii" target="_blank" rel="noopener" className="mt-3 inline-block text-sm text-gold hover:underline">@cristiangiudicii</a>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/rutinas" className="hover:text-gold">Rutinas</Link>
          <Link href="/asesoria" className="hover:text-gold">Asesoría 1 a 1</Link>
          <Link href="/asesoria/reporte" className="hover:text-gold">Reporte semanal (alumnos)</Link>
          <Link href="/sobre-mi" className="hover:text-gold">Sobre mí</Link>
        </div>
        <p className="text-xs text-neutral-500 sm:text-right">
          Pagos procesados de forma segura por Mercado Pago.<br />© {new Date().getFullYear()} Cristian Giudici.
        </p>
      </div>
    </footer>
  );
}

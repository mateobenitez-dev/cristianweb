/** Cartel visible para marcar dónde falta el texto real de Cristian. Buscar "<Placeholder" para encontrar todos. */
export function Placeholder({ label = "Poner texto acá", className = "" }: { label?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border border-dashed border-white/40 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[.2em] text-neutral-300 ${className}`}>
      <span aria-hidden>✎</span>{label}
    </span>
  );
}

import Link from "next/link";

/** Barra fija en mobile: los 2 CTAs siempre a un toque del pulgar. */
export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-ink/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: "max(.75rem, env(safe-area-inset-bottom))" }}>
      <Link href="/rutinas" className="btn-primary !px-3 !py-3 text-xs">Rutinas</Link>
      <Link href="/asesoria#aplicar" className="btn-gold !px-3 !py-3 text-xs">Asesoría 1 a 1</Link>
    </div>
  );
}

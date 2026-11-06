"use client";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface Props {
  before: string;
  after: string;
  alt: string;
  initial?: number; // 0-100
  className?: string;
}

/** Comparador Antes/Después: arrastre con mouse/touch (pointer events) + teclado (input range accesible). */
export function BeforeAfterSlider({ before, after, alt, initial = 50, className = "" }: Props) {
  const [pos, setPos] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className={`relative aspect-[3/4] select-none overflow-hidden rounded-xl border border-line bg-surface touch-pan-y ${className}`}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); update(e.clientX); }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* DESPUÉS (fondo) */}
      <Image src={after} alt={`${alt} - después`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" draggable={false} />
      {/* ANTES (recortado) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={`${alt} - antes`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover grayscale-[30%]" draggable={false} />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded bg-ink/80 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-white">Antes</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">Después</span>

      {/* Divisor + manija */}
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold bg-ink text-gold shadow-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </div>
      </div>

      <input
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes y después: ${alt}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

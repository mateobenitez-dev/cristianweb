"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/rutinas", label: "Rutinas" },
  { href: "/asesoria", label: "Asesoría 1 a 1" },
  { href: "/sobre-mi", label: "Sobre mí" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ink/80 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-display text-lg uppercase tracking-widest text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/logo-cg-mark-blanco.svg" alt="" width={36} height={36} className="h-9 w-9" />
          <span>Cristian <span className="text-neutral-400">Giudici</span></span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-sm uppercase tracking-wider transition hover:text-gold ${pathname.startsWith(l.href) ? "text-white underline underline-offset-8" : "text-neutral-400"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/asesoria#aplicar" className="btn-primary !py-2.5">Aplicar</Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="p-2 md:hidden" aria-label="Abrir menú" aria-expanded={open}>
          <span className={`block h-0.5 w-6 bg-white transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`my-1.5 block h-0.5 w-6 bg-white transition ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="py-3 text-base uppercase tracking-wider text-neutral-200">{l.label}</Link>
            ))}
            <Link href="/asesoria#aplicar" className="btn-primary mt-2">Aplicar a la asesoría</Link>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PILLARS, STORY } from "@/content/story";
import { Placeholder } from "./Placeholder";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Mi historia": se abre al scrollear.
 *  - Una línea SVG blanca se va dibujando con el scroll (scrub) y une los capítulos.
 *  - Cada capítulo entra deslizándose y su año aparece gigante de fondo con parallax.
 *  - El título se "abre" con una máscara (clip-path) al entrar en pantalla.
 */
export function StoryScroll() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      // Título que se abre desde el centro
      gsap.fromTo("[data-story-title]", { clipPath: "inset(0 50% 0 50%)" }, {
        clipPath: "inset(0 0% 0 0%)", duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: "[data-story-title]", start: "top 85%" },
      });

      // Línea que se dibuja con el scroll
      const path = el.querySelector<SVGPathElement>("[data-story-path]")!;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: "[data-story-track]", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
      });

      // Capítulos
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((ch, i) => {
        const side = i % 2 ? 1 : -1;
        gsap.from(ch.querySelector("[data-chapter-card]"), {
          x: 60 * side, autoAlpha: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ch, start: "top 75%" },
        });
        gsap.from(ch.querySelector("[data-chapter-dot]"), {
          scale: 0, duration: 0.6, ease: "back.out(3)",
          scrollTrigger: { trigger: ch, start: "top 70%" },
        });
        gsap.fromTo(ch.querySelector("[data-chapter-year]"), { yPercent: 40 }, {
          yPercent: -40, ease: "none",
          scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.from("[data-pillar]", {
        y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: "[data-pillars]", start: "top 80%" },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="historia" className="relative overflow-hidden py-24">
      <div className="container-x">
        <p className="text-sm font-bold uppercase tracking-[.35em] text-brand">Mi historia</p>
        <h2 data-story-title className="mt-3 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
          De flaco sin idea a <span className="text-outline">culturista natural</span>
        </h2>

        <div data-story-track className="relative mt-20">
          {/* Línea que se dibuja: centrada en desktop, a la izquierda en mobile */}
          <svg className="pointer-events-none absolute left-3 top-0 h-full w-6 md:left-1/2 md:-translate-x-1/2" viewBox="0 0 24 1000" preserveAspectRatio="none" aria-hidden>
            <path d="M12 0 V1000" stroke="#262626" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path data-story-path d="M12 0 V1000" stroke="#fff" strokeWidth="3" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.6))" }} />
          </svg>

          <ol className="space-y-24 md:space-y-32">
            {STORY.map((s, i) => (
              <li key={s.title} data-chapter className={`relative grid pl-12 md:grid-cols-2 md:pl-0`}>
                <span data-chapter-dot className="absolute left-[7px] top-2 h-4 w-4 rounded-full border-2 border-gold bg-ink md:left-1/2 md:-translate-x-1/2" />
                <span data-chapter-year aria-hidden
                  className={`pointer-events-none absolute -top-10 select-none font-display text-[22vw] leading-none text-white/[.04] md:text-[11rem] right-0 ${i % 2 ? "md:left-0 md:right-auto" : ""}`}>
                  {s.year || "····"}
                </span>
                <div data-chapter-card className={`relative ${i % 2 ? "md:col-start-2 md:pl-16" : "md:pr-16 md:text-right"}`}>
                  {s.year ? <p className="font-display text-2xl text-gold">{s.year}</p> : <Placeholder label="Poner año" />}
                  <h3 className="mt-1 text-3xl sm:text-4xl">{s.title}</h3>
                  {s.text ? <p className="mt-3 text-lg text-neutral-400">{s.text}</p> : <div className="mt-3"><Placeholder /></div>}
                  {s.img && (
                    <div className={`relative mt-6 aspect-[4/5] w-44 overflow-hidden rounded-xl border border-line sm:w-52 ${i % 2 ? "" : "md:ml-auto"}`}>
                      <Image src={s.img} alt={s.title} fill sizes="208px" className="object-cover" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div data-pillars className="mt-32">
          <h3 className="text-3xl sm:text-4xl">Mi filosofía</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PILLARS.map(([t, d]) => (
              <div key={t} data-pillar className="rounded-2xl border border-line bg-surface p-6">
                <h4 className="font-display text-xl uppercase text-gold">{t}</h4>
                {d ? <p className="mt-2 text-neutral-400">{d}</p> : <div className="mt-3"><Placeholder /></div>}
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/asesoria" className="btn-primary">Entrená conmigo 1 a 1</Link>
            <Link href="/rutinas" className="btn-gold">Ver rutinas</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

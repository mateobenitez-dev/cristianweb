"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CGMark } from "./CGMark";
import { LoopVideo } from "./LoopVideo";

/**
 * Intro animada de la Home (concepto de la web de Juanse, adaptado a Cristian):
 *  1. El aro se dibuja mientras carga la página (hace de barra de carga).
 *  2. La C entra deslizándose desde la izquierda y la G desde la derecha, primero como trazo
 *     que se dibuja y después se rellenan. Destello y entra "PERSONAL TRAINER".
 *  3. El logo late. Al deslizar / scroll / tap / Enter la pantalla se abre en dos, el logo vuela
 *     a su lugar en el hero y debajo queda abierta la sección "Mi historia".
 * Desde la 2ª visita es más corta y entra sola (localStorage).
 */

// Loop de Cristian posando (vertical, sin audio). Si no carga, queda el poster / fondo negro con grano.
const VIDEO = "/video/intro-loop.mp4";
const POSTER = "/img/intro-poster.jpg";
const FALLBACK = "/img/intro-loop.webp";
const SEEN_KEY = "cg-intro-visto";
const BEAT = 60 / 128;

function prepareDraw(el: SVGGeometryElement) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = `${len}`;
  el.style.strokeDashoffset = `${len}`;
  return len;
}

export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const $ = <T extends Element = SVGElement>(s: string) => el.querySelector<T>(s)!;
    const $$ = <T extends Element = SVGElement>(s: string) => Array.from(el.querySelectorAll<T>(s));

    const logo = $<HTMLElement>("[data-logo]");
    const ring = $<SVGCircleElement>('[data-cg="ring"]');
    const ringBase = $<SVGPathElement>('[data-cg="ring-base"]');
    const c = $<SVGPathElement>('[data-cg="c"]');
    const g = $<SVGPathElement>('[data-cg="g"]');
    const tagText = $<SVGPathElement>('[data-cg="tag-text"]');
    const tagLines = $<SVGPathElement>('[data-cg="tag-lines"]');
    const bg = $<HTMLElement>("[data-bg]");
    const enter = $<HTMLElement>("[data-enter]");
    const flash = $<HTMLElement>("[data-flash]");
    const pct = $<HTMLElement>("[data-pct]");
    const halves = $$<HTMLElement>("[data-half]");

    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch {}
    const inApp = /Instagram|FBAN|FBAV/i.test(navigator.userAgent); // la mayoría llega desde IG
    const minLoad = seen ? 0.7 : inApp ? 1.8 : 2.4;
    const k = seen ? 0.55 : 1; // factor de velocidad

    window.scrollTo(0, 0);
    let ready = false;
    let leaving = false;
    let beat: gsap.core.Tween | null = null;

    // Estado inicial
    const ringLen = prepareDraw(ring);
    prepareDraw(c);
    prepareDraw(g);
    gsap.set([c, g], { fillOpacity: 0 });
    gsap.set(c, { x: -90 });
    gsap.set(g, { x: 90 });
    gsap.set(ringBase, { opacity: 0 });
    gsap.set(tagText, { opacity: 0, y: 24, clipPath: "inset(0 50% 0 50%)" });
    gsap.set(tagLines, { scaleX: 0, svgOrigin: "500 888" });
    gsap.set(logo, { autoAlpha: 1 });

    const ctx = gsap.context(() => {
      gsap.fromTo(bg, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1.05, duration: 2.4 * k, ease: "power2.out" });
    }, el);

    // 1. Aro = barra de carga: avanza con la carga real pero nunca más rápido que minLoad.
    const start = performance.now();
    const progress = { v: 0 };
    let pageLoaded = document.readyState === "complete";
    const onLoad = () => (pageLoaded = true);
    window.addEventListener("load", onLoad);
    const tick = () => {
      const byTime = Math.min((performance.now() - start) / 1000 / minLoad, 1);
      const target = pageLoaded ? byTime : Math.min(byTime, 0.85);
      progress.v += (target - progress.v) * 0.12;
      ring.style.strokeDashoffset = `${ringLen * (1 - progress.v)}`;
      pct.textContent = `${Math.round(progress.v * 100)}`;
      if (progress.v > 0.995) {
        gsap.ticker.remove(tick);
        ring.style.strokeDashoffset = "0";
        gsap.to(pct, { autoAlpha: 0, duration: 0.3 });
        reveal();
      }
    };
    gsap.ticker.add(tick);

    // 2. Las letras se deslizan dibujándose y después se rellenan.
    function reveal() {
      gsap.timeline({ defaults: { ease: "power3.inOut" } })
        .to(ringBase, { opacity: 1, duration: 1.2 * k }, 0)
        .to(c, { strokeDashoffset: 0, x: 0, duration: 1.5 * k }, 0)
        .to(g, { strokeDashoffset: 0, x: 0, duration: 1.5 * k }, 0.15 * k)
        .to([c, g], { fillOpacity: 1, duration: 0.6 * k, ease: "power2.out" }, 1.25 * k)
        .fromTo(flash, { opacity: 0.18 }, { opacity: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, 1.9 * k)
        .fromTo(logo, { scale: 1.06 }, { scale: 1, duration: 0.6, ease: "back.out(3)", immediateRender: false }, 1.9 * k)
        .to(tagLines, { scaleX: 1, duration: 0.6 * k, ease: "power2.out" }, 2 * k)
        .to(tagText, { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0%)", duration: 0.9 * k, ease: "expo.out" }, 2 * k)
        .add(() => { beat = gsap.to(logo, { scale: 1.02, duration: BEAT / 2, repeat: -1, yoyo: true, ease: "power1.out" }); })
        .add(() => {
          ready = true;
          if (seen) return exit();
          gsap.to(enter, { autoAlpha: 1, duration: 0.6 });
        }, seen ? "+=0.5" : "+=0.9");
    }

    // 3. Salida: se abre la pantalla y el logo vuela al hero.
    function exit() {
      if (leaving) return;
      leaving = true;
      beat?.kill();
      removeListeners();
      gsap.set(logo, { scale: 1 });
      gsap.set([c, g], { fillOpacity: 1, x: 0, strokeDashoffset: 0 });

      const from = logo.getBoundingClientRect();
      const to = document.querySelector<HTMLElement>("[data-hero-logo]")?.getBoundingClientRect();
      const heroLines = document.querySelectorAll("[data-hero-line]");

      const tl = gsap.timeline({
        onComplete: () => {
          try { localStorage.setItem(SEEN_KEY, "1"); } catch {}
          setDone(true);
        },
      });
      tl.to(enter, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(bg, { opacity: 0, scale: 1.25, duration: 1.1, ease: "power2.in" }, 0)
        .to("[data-grain]", { opacity: 0, duration: 1.2 }, 0.2)
        .to(halves[0], { yPercent: -100, duration: 1.6, ease: "expo.inOut" }, 0.25)
        .to(halves[1], { yPercent: 100, duration: 1.6, ease: "expo.inOut" }, 0.25);

      if (to && to.width > 0) {
        tl.to(logo, { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width, duration: 1.7, ease: "expo.inOut" }, 0);
      } else {
        tl.to(logo, { autoAlpha: 0, duration: 0.5 }, 0);
      }
      if (heroLines.length) tl.from(heroLines, { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 1.1);
    }

    // Disparadores: scroll, swipe hacia arriba, teclado o tap
    let touchY = 0;
    const onWheel = (e: WheelEvent) => ready && e.deltaY > 0 && exit();
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => ready && touchY - e.touches[0].clientY > 30 && exit();
    const onKey = (e: KeyboardEvent) => {
      if (ready && ["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); exit(); }
    };
    const onClick = () => ready && exit();
    function removeListeners() {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      el?.removeEventListener("click", onClick);
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    el.addEventListener("click", onClick);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      window.removeEventListener("load", onLoad);
      removeListeners();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} id="intro" className="intro" role="dialog" aria-label="Entrada a la web de Cristian Giudici">
      <div data-half className="intro__half top-0" />
      <div data-half className="intro__half bottom-0" />

      <div data-bg className="intro__bg">
        <LoopVideo src={VIDEO} poster={POSTER} fallback={FALLBACK} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.08),transparent_55%)]" />
      </div>
      <div data-grain className="intro__grain" aria-hidden />
      <div data-flash className="pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-screen" aria-hidden />

      <div data-logo className="intro__logo invisible">
        <CGMark idPrefix="intro" animated className="block h-auto w-full overflow-visible" />
        <span data-pct className="absolute inset-x-0 -bottom-10 text-center font-display text-sm tracking-[.4em] text-gold">0</span>
      </div>

      <button data-enter type="button" aria-label="Entrar" className="intro__enter">
        <span className="mb-3 whitespace-nowrap text-[10px] font-bold uppercase tracking-[.3em] text-neutral-300 sm:text-[11px] sm:tracking-[.4em]">Deslizá y conocé mi historia</span>
        <span className="intro__chevron" aria-hidden />
        <span className="intro__chevron" aria-hidden />
      </button>
    </div>
  );
}

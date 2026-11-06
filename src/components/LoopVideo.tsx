"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  poster?: string;
  /** Imagen animada (webp) que reemplaza al video si el teléfono bloquea el autoplay (iPhone en ahorro de batería, navegador de Instagram). */
  fallback?: string;
  className?: string;
}

const esc = (s: string) => s.replace(/"/g, "&quot;");

/**
 * Video de fondo en loop que NO se queda pausado en el celular:
 *  - El <video> se escribe como HTML crudo para que el atributo `muted` llegue en el HTML del servidor
 *    (React no lo serializa y sin él iOS bloquea el autoplay y muestra el video quieto).
 *  - Ante cualquier pausa / corte de datos / volver a la pestaña se vuelve a dar play, más un control cada 0,6 s.
 *  - Si el sistema bloquea el autoplay (NotAllowedError) o no arranca, se cambia por la misma toma como webp animado.
 */
export function LoopVideo({ src, poster, fallback, className = "" }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [useImg, setUseImg] = useState(false);

  useEffect(() => {
    if (useImg) return;
    const v = wrap.current?.querySelector("video");
    if (!v) return;
    let fails = 0;
    let dead = false;
    const toFallback = () => { if (fallback && !dead) { dead = true; setUseImg(true); } };
    const play = () => {
      if (dead || document.hidden) return;
      v.muted = true;
      v.defaultMuted = true;
      if (v.ended) v.currentTime = 0;
      if (!v.paused) return;
      v.play().then(() => { fails = 0; }).catch((err: DOMException) => {
        if (err?.name === "NotAllowedError" || ++fails >= 6) toFallback();
      });
    };
    const events = ["canplay", "loadeddata", "pause", "ended", "stalled", "suspend", "emptied"] as const;
    const onEvent = () => setTimeout(play, 50);
    events.forEach((e) => v.addEventListener(e, onEvent));
    const winEvents = ["touchstart", "pointerdown", "pageshow", "focus"] as const;
    winEvents.forEach((e) => window.addEventListener(e, play, { passive: true }));
    document.addEventListener("visibilitychange", play);
    const watchdog = window.setInterval(play, 600);
    // Tiene datos pero sigue quieto a los 2,5 s => el sistema bloquea el autoplay.
    const check = window.setTimeout(() => {
      if (v.paused && v.currentTime === 0 && v.readyState >= 3) toFallback();
    }, 2500);
    play();
    return () => {
      dead = true;
      clearInterval(watchdog);
      clearTimeout(check);
      events.forEach((e) => v.removeEventListener(e, onEvent));
      winEvents.forEach((e) => window.removeEventListener(e, play));
      document.removeEventListener("visibilitychange", play);
    };
  }, [useImg, fallback]);

  if (useImg && fallback) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallback} alt="" aria-hidden className={className} decoding="async" />;
  }

  return (
    <div
      ref={wrap}
      className="contents"
      aria-hidden
      dangerouslySetInnerHTML={{
        __html: `<video src="${esc(src)}"${poster ? ` poster="${esc(poster)}"` : ""} class="${esc(className)}" muted autoplay loop playsinline webkit-playsinline preload="auto" disablepictureinpicture disableremoteplayback x-webkit-airplay="deny" tabindex="-1"></video>`,
      }}
    />
  );
}

"use client";
import { useEffect, useRef } from "react";

/** Video en loop, mudo y sin controles. Fuerza muted + play() porque iOS / el navegador de IG a veces lo frenan. */
export function LoopVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const play = () => v.paused && v.play().catch(() => {});
    play();
    document.addEventListener("visibilitychange", play);
    window.addEventListener("touchstart", play, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", play);
      window.removeEventListener("touchstart", play);
    };
  }, []);
  return (
    <video ref={ref} src={src} poster={poster} muted autoPlay loop playsInline preload="metadata" tabIndex={-1}
      disablePictureInPicture disableRemotePlayback aria-hidden className={className} />
  );
}

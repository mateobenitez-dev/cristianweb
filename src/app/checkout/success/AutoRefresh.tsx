"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Mientras el webhook no confirmó el pago, re-renderiza la página cada 4 s (máx ~1 min). */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => (++n > 15 ? clearInterval(id) : router.refresh()), 4000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}

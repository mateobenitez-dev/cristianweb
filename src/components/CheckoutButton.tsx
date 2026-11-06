"use client";
import { useState } from "react";

/** Pide nombre + email (para enviar el PDF), crea la orden y redirige al checkout de Mercado Pago. */
export function CheckoutButton({ productSlug, label = "Comprar ahora" }: { productSlug: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, email: form.get("email"), fullName: form.get("fullName") }),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) throw new Error(data.error ?? "No se pudo iniciar el pago");
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary w-full">{label}</button>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input name="fullName" required minLength={2} placeholder="Nombre y apellido" autoComplete="name" className="input" />
      <input name="email" type="email" required placeholder="Email (acá te llega el PDF)" autoComplete="email" className="input" />
      {error && <p className="text-sm text-brand">{error}</p>}
      <button disabled={loading} className="btn-primary w-full">{loading ? "Redirigiendo…" : "Pagar con Mercado Pago"}</button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:text-neutral-300">Cancelar</button>
    </form>
  );
}

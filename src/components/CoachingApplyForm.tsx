"use client";
import { useState } from "react";

const GOALS = [
  ["perder_grasa", "Perder grasa"],
  ["ganar_musculo", "Ganar músculo"],
  ["recomposicion", "Recomposición"],
  ["competir", "Preparar competencia"],
] as const;

/** Paso 1: aplicación. Paso 2: agenda la llamada de evaluación (Cal.com embebido). */
export function CoachingApplyForm() {
  const [step, setStep] = useState<"form" | "agenda">("form");
  const [calUrl, setCalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/asesoria/aplicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(json.error ?? "No se pudo enviar la aplicación");
    const base = json.calUrl ?? process.env.NEXT_PUBLIC_CAL_URL;
    // Prefill de Cal.com con nombre y email
    setCalUrl(base ? `${base}?name=${encodeURIComponent(String(data.fullName))}&email=${encodeURIComponent(String(data.email))}&embed=true&theme=dark` : null);
    setStep("agenda");
  }

  if (step === "agenda") {
    return (
      <div>
        <p className="text-sm font-bold uppercase tracking-[.3em] text-gold">Paso 2 de 2</p>
        <h3 className="mt-2 text-3xl">Agendá tu llamada de evaluación</h3>
        <p className="mt-2 text-neutral-400">Elegí el día y horario que te quede cómodo.</p>
        {calUrl ? (
          <iframe src={calUrl} title="Agendar evaluación" className="mt-6 h-[700px] w-full rounded-xl border border-line bg-ink" />
        ) : (
          <p className="mt-6 text-neutral-300">¡Listo! Te contactamos por WhatsApp/email en las próximas 24 h.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <p className="text-sm font-bold uppercase tracking-[.3em] text-gold sm:col-span-2">Paso 1 de 2 · Aplicación</p>
      <input name="fullName" required placeholder="Nombre y apellido" className="input" autoComplete="name" />
      <input name="email" type="email" required placeholder="Email" className="input" autoComplete="email" />
      <input name="phone" required placeholder="WhatsApp (con código de país)" className="input" autoComplete="tel" />
      <input name="country" required placeholder="País" className="input" autoComplete="country-name" />
      <input name="instagram" placeholder="Instagram (opcional)" className="input" />
      <select name="goal" required defaultValue="" className="input">
        <option value="" disabled>Objetivo principal</option>
        {GOALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <input name="experienceYears" type="number" step="0.5" min={0} required placeholder="Años entrenando" className="input" />
      <input name="trainingDays" type="number" min={1} max={7} required placeholder="Días disponibles por semana" className="input" />
      <textarea name="injuries" rows={2} placeholder="Lesiones o limitaciones (opcional)" className="input sm:col-span-2" />
      <textarea name="why" rows={3} required minLength={10} placeholder="¿Por qué querés trabajar conmigo y por qué ahora?" className="input sm:col-span-2" />
      {error && <p className="text-sm text-brand sm:col-span-2">{error}</p>}
      <button disabled={loading} className="btn-primary sm:col-span-2">{loading ? "Enviando…" : "Enviar aplicación"}</button>
    </form>
  );
}

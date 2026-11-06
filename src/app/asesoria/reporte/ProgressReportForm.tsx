"use client";
import { useState } from "react";

const SCORES = [
  ["adherenceTraining", "Cumplimiento del entrenamiento"],
  ["adherenceDiet", "Cumplimiento de la dieta"],
  ["energy", "Energía general"],
] as const;

export function ProgressReportForm() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/asesoria/reporte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const json = await res.json().catch(() => ({}));
    setState(res.ok ? "ok" : "error");
    setMsg(res.ok ? "¡Recibido! Te devuelvo el feedback en 24–48 h." : json.error ?? "Error al enviar");
  }

  if (state === "ok") return <p className="text-lg text-gold">{msg}</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="email" type="email" required placeholder="Tu email de alumno" className="input sm:col-span-2" />
      <input name="weightKg" type="number" step="0.1" required placeholder="Peso (kg)" className="input" />
      <input name="waistCm" type="number" step="0.5" placeholder="Cintura (cm)" className="input" />
      <input name="sleepHours" type="number" step="0.5" required placeholder="Horas de sueño promedio" className="input sm:col-span-2" />
      {SCORES.map(([name, label]) => (
        <label key={name} className="flex flex-col gap-2 text-sm sm:col-span-2">
          <span className="flex justify-between"><span>{label}</span><span className="text-neutral-500">0–10</span></span>
          <input name={name} type="range" min={0} max={10} defaultValue={7} className="accent-white" />
        </label>
      ))}
      <textarea name="notes" rows={4} placeholder="¿Cómo te sentiste? Dudas, molestias, cambios en la rutina…" className="input sm:col-span-2" />
      {state === "error" && <p className="text-sm text-brand sm:col-span-2">{msg}</p>}
      <button disabled={state === "loading"} className="btn-primary sm:col-span-2">{state === "loading" ? "Enviando…" : "Enviar reporte"}</button>
    </form>
  );
}

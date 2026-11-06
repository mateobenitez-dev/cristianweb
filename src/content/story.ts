// Historia de Cristian: los títulos quedan, los años y textos van cuando los pase Cristian.
// text vacío = se muestra el cartel "Poner texto acá".
export const STORY: { year: string; title: string; text: string; img?: string }[] = [
  { year: "", title: "El primer día", text: "" },
  { year: "", title: "Del gym al oficio", text: "" },
  { year: "", title: "Primera competencia", img: "/img/escenario-grito.webp", text: "" },
  { year: "", title: "La comunidad", img: "/img/gym-con-alumno.webp", text: "" },
  { year: "Hoy", title: "Entrenador online", img: "/img/ufa-winter-frase.webp", text: "" },
];

export const PILLARS = [
  ["Natural siempre", ""],
  ["Técnica antes que ego", ""],
  ["Datos, no sensaciones", ""],
] as const;

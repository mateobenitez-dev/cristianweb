// TODO: completar con la historia real de Cristian (fechas, competencias, fotos).
export const STORY: { year: string; title: string; text: string; img?: string }[] = [
  { year: "2014", title: "El primer día", text: "Entré al gimnasio flaco y sin idea. Lo único que tenía claro era que no iba a aflojar." },
  { year: "2017", title: "Del gym al oficio", text: "Me certifiqué como personal trainer y empecé a entrenar a mis primeros alumnos en sala." },
  { year: "2019", title: "Primera competencia", img: "/img/escenario-grito.webp", text: "Subí a la tarima por primera vez en culturismo natural testeado. Ahí entendí lo que es la disciplina de verdad." },
  { year: "2022", title: "La comunidad", img: "/img/gym-con-alumno.webp", text: "Empecé a mostrar el proceso real en Instagram: sin filtros, sin atajos. Hoy somos más de 134 mil." },
  { year: "Hoy", title: "Entrenador online", img: "/img/ufa-winter-frase.webp", text: "Acompaño alumnos de todo el mundo con el mismo método que uso para competir." },
];

export const PILLARS = [
  ["Natural siempre", "Sin atajos ni promesas mágicas. Progreso real, sostenible y medible."],
  ["Técnica antes que ego", "Cada repetición cuenta. La carga sube cuando la ejecución lo permite."],
  ["Datos, no sensaciones", "Registramos cargas, medidas y fotos para ajustar con criterio."],
] as const;

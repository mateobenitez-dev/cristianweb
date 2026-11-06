export const formatPrice = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

export const LEVEL_LABEL = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
} as const;

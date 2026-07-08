/** Convierte minutos a "2h 15m". */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function mediaTypeLabel(type: "movie" | "tv"): string {
  return type === "movie" ? "Película" : "Serie";
}

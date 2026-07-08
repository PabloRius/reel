/** Construye URLs de imágenes de TMDB. */
const IMG_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "original" = "w342",
): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

export function backdropUrl(
  path: string | null,
  size: "w780" | "w1280" | "original" = "w1280",
): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

import type { Genre, MediaResult, MediaType } from "@/lib/types";

/** Llamadas desde el navegador a nuestros route handlers (/api/tmdb/*). */

export async function searchMedia(query: string): Promise<MediaResult[]> {
  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("No se pudo buscar en TMDB");
  const data = (await res.json()) as { results: MediaResult[] };
  return data.results;
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch("/api/tmdb/genres");
  if (!res.ok) throw new Error("No se pudieron cargar los géneros");
  const data = (await res.json()) as { genres: Genre[] };
  return data.genres;
}

/** Detalles completos (runtime real) para una peli/serie. */
export async function fetchDetails(
  mediaType: MediaType,
  id: number,
): Promise<MediaResult | null> {
  const res = await fetch(`/api/tmdb/details?mediaType=${mediaType}&id=${id}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { result: MediaResult | null };
  return data.result;
}

import "server-only";
import type { Genre, MediaResult, MediaType, Trailer } from "@/lib/types";

/**
 * Cliente TMDB del lado servidor. La clave (TMDB_ACCESS_TOKEN) NUNCA se envía
 * al navegador: todo pasa por los route handlers en /api/tmdb/*.
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const LANG = "es-ES";

function authHeaders(): HeadersInit {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Falta TMDB_ACCESS_TOKEN. Añádelo a .env.local (ver .env.example).",
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  };
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", LANG);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: authHeaders(),
    // Cachea catálogos poco cambiantes durante 1h.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

interface RawMedia {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  runtime?: number;
  episode_run_time?: number[];
}

function normalize(raw: RawMedia, forcedType?: MediaType): MediaResult | null {
  const mediaType = (raw.media_type ?? forcedType) as MediaType | undefined;
  if (mediaType !== "movie" && mediaType !== "tv") return null;

  const date = raw.release_date || raw.first_air_date || null;
  const runtime =
    raw.runtime ??
    (raw.episode_run_time && raw.episode_run_time.length
      ? raw.episode_run_time[0]
      : null);

  return {
    tmdbId: raw.id,
    mediaType,
    title: raw.title || raw.name || "Sin título",
    overview: raw.overview || "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    releaseDate: date,
    year: date ? Number(date.slice(0, 4)) || null : null,
    voteAverage: raw.vote_average ?? 0,
    genreIds: raw.genre_ids ?? [],
    runtime: runtime ?? null,
  };
}

/** Busca películas y series a la vez. */
export async function searchMulti(query: string): Promise<MediaResult[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<{ results: RawMedia[] }>("/search/multi", {
    query,
    include_adult: "false",
    page: "1",
  });
  return data.results
    .map((r) => normalize(r))
    .filter((r): r is MediaResult => r !== null)
    .slice(0, 20);
}

/** Detalles (incluye runtime real) de una película o serie. */
export async function getDetails(
  mediaType: MediaType,
  id: number,
): Promise<MediaResult | null> {
  const raw = await tmdbFetch<RawMedia>(`/${mediaType}/${id}`);
  return normalize(raw, mediaType);
}

interface RawVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
}

/**
 * Devuelve el mejor tráiler de YouTube para una peli/serie, priorizando:
 * tipo Trailer > Teaser, oficial, y en español si existe (con respaldo en
 * cualquier idioma). `null` si no hay ninguno.
 */
export async function getTrailer(
  mediaType: MediaType,
  id: number,
): Promise<Trailer | null> {
  // Pedimos en español e inglés y combinamos para maximizar resultados.
  const [es, en] = await Promise.all([
    tmdbFetch<{ results: RawVideo[] }>(`/${mediaType}/${id}/videos`, {
      language: "es-ES",
    }),
    tmdbFetch<{ results: RawVideo[] }>(`/${mediaType}/${id}/videos`, {
      language: "en-US",
    }),
  ]);

  const videos = [...es.results, ...en.results].filter(
    (v) => v.site === "YouTube",
  );
  if (videos.length === 0) return null;

  const score = (v: RawVideo) => {
    let s = 0;
    if (v.type === "Trailer") s += 100;
    else if (v.type === "Teaser") s += 50;
    if (v.official) s += 20;
    if (v.iso_639_1 === "es") s += 10;
    return s;
  };

  const best = videos.sort((a, b) => score(b) - score(a))[0];
  return { key: best.key, name: best.name, site: best.site };
}

/** Lista de géneros combinada de cine y TV. */
export async function getGenres(): Promise<Genre[]> {
  const [movie, tv] = await Promise.all([
    tmdbFetch<{ genres: Genre[] }>("/genre/movie/list"),
    tmdbFetch<{ genres: Genre[] }>("/genre/tv/list"),
  ]);
  const byId = new Map<number, Genre>();
  for (const g of [...movie.genres, ...tv.genres]) byId.set(g.id, g);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

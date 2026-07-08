import type { PickerFilters, RoomMovie } from "@/lib/types";

export const defaultFilters: PickerFilters = {
  genreIds: [],
  mediaType: "any",
  addedByUid: null,
  maxRuntime: null,
  minRating: 0,
  includeWatched: false,
};

/** Devuelve las películas que cumplen todos los filtros activos. */
export function applyFilters(
  movies: RoomMovie[],
  filters: PickerFilters,
): RoomMovie[] {
  return movies.filter((m) => {
    if (!filters.includeWatched && m.watched) return false;
    if (filters.mediaType !== "any" && m.mediaType !== filters.mediaType)
      return false;
    if (filters.addedByUid && m.addedByUid !== filters.addedByUid) return false;
    if (filters.minRating > 0 && m.voteAverage < filters.minRating) return false;
    if (
      filters.maxRuntime !== null &&
      m.runtime !== null &&
      m.runtime > filters.maxRuntime
    )
      return false;
    if (filters.genreIds.length > 0) {
      const match = filters.genreIds.some((gid) => m.genreIds.includes(gid));
      if (!match) return false;
    }
    return true;
  });
}

/** Elige un elemento aleatorio del array (o null si está vacío). */
export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

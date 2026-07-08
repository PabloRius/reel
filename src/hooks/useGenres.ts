"use client";

import { useEffect, useState } from "react";
import { fetchGenres } from "@/lib/tmdb-client";
import type { Genre } from "@/lib/types";

let cache: Genre[] | null = null;

/** Carga y cachea la lista de géneros de TMDB (una vez por sesión). */
export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let active = true;
    fetchGenres()
      .then((g) => {
        cache = g;
        if (active) setGenres(g);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return genres;
}

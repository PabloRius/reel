"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { posterUrl } from "@/lib/images";
import { mediaTypeLabel } from "@/lib/format";
import { fetchDetails, searchMedia } from "@/lib/tmdb-client";
import { addMovie } from "@/lib/rooms";
import { useGenres } from "@/hooks/useGenres";
import type { MediaResult } from "@/lib/types";
import type { User } from "firebase/auth";

export function AddMovieDialog({
  roomId,
  user,
  existingIds,
  onClose,
}: {
  roomId: string;
  user: User;
  existingIds: Set<string>;
  onClose: () => void;
}) {
  const genres = useGenres();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim()) {
      setLoading(true);
    } else {
      setResults([]);
      setLoading(false);
    }
  }

  // Búsqueda con debounce (el setState vive en el callback asíncrono).
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const t = setTimeout(async () => {
      try {
        setResults(await searchMedia(q));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  async function handleAdd(media: MediaResult) {
    const id = `${media.mediaType}-${media.tmdbId}`;
    if (existingIds.has(id)) return;
    setAddingId(id);
    try {
      // Completa el runtime real con los detalles.
      const detailed = (await fetchDetails(media.mediaType, media.tmdbId)) ?? media;
      await addMovie(roomId, { ...media, runtime: detailed.runtime }, genres, user);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[8vh] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg glass rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Añadir a la sala</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-surface-2 transition"
          >
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Busca una película o serie…"
          className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border outline-none focus:border-accent transition mb-4"
        />

        <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2 space-y-2">
          {loading && <p className="text-sm text-muted py-4 text-center">Buscando…</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-muted py-4 text-center">
              Sin resultados para “{query}”.
            </p>
          )}
          <AnimatePresence>
            {results.map((r) => {
              const id = `${r.mediaType}-${r.tmdbId}`;
              const added = existingIds.has(id);
              const poster = posterUrl(r.posterPath, "w185");
              return (
                <motion.button
                  key={id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  disabled={added || addingId === id}
                  onClick={() => handleAdd(r)}
                  className="w-full flex gap-3 p-2 rounded-xl hover:bg-surface-2 transition text-left disabled:opacity-60"
                >
                  <div className="relative w-12 h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-surface-2">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={r.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid place-items-center h-full text-xl">🎞️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.title}</p>
                    <p className="text-xs text-muted">
                      {mediaTypeLabel(r.mediaType)}
                      {r.year ? ` · ${r.year}` : ""}
                      {r.voteAverage > 0 ? ` · ⭐ ${r.voteAverage.toFixed(1)}` : ""}
                    </p>
                    <p className="text-xs text-muted line-clamp-1 mt-0.5">
                      {r.overview || "Sin sinopsis."}
                    </p>
                  </div>
                  <span className="self-center text-sm font-semibold text-accent whitespace-nowrap">
                    {added ? "✓ Añadida" : addingId === id ? "…" : "+ Añadir"}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

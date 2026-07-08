"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchTrailer } from "@/lib/tmdb-client";
import { mediaTypeLabel } from "@/lib/format";
import type { RoomMovie, Trailer } from "@/lib/types";

type Status = "loading" | "ready" | "none";

export function TrailerModal({
  movie,
  onClose,
}: {
  movie: RoomMovie;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [trailer, setTrailer] = useState<Trailer | null>(null);

  useEffect(() => {
    let active = true;
    fetchTrailer(movie.mediaType, movie.tmdbId)
      .then((t) => {
        if (!active) return;
        setTrailer(t);
        setStatus(t ? "ready" : "none");
      })
      .catch(() => active && setStatus("none"));
    return () => {
      active = false;
    };
  }, [movie.mediaType, movie.tmdbId]);

  // Cierra con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${movie.title} tráiler`,
  )}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-3xl glass rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="min-w-0">
            <h2 className="font-bold truncate">{movie.title}</h2>
            <p className="text-xs text-muted">
              {mediaTypeLabel(movie.mediaType)}
              {movie.year ? ` · ${movie.year}` : ""} · Tráiler
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-surface-2 transition shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black">
          {status === "loading" && (
            <div className="absolute inset-0 grid place-items-center text-muted">
              <span className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
            </div>
          )}

          {status === "ready" && trailer && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {status === "none" && (
            <div className="absolute inset-0 grid place-items-center text-center px-6">
              <div>
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-muted mb-4">
                  No hemos encontrado un tráiler para “{movie.title}”.
                </p>
                <a
                  href={youtubeSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block btn-gradient text-white font-semibold px-5 py-2.5 rounded-full"
                >
                  Buscar en YouTube
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

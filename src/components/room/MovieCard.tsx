"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { posterUrl } from "@/lib/images";
import { formatRuntime, mediaTypeLabel } from "@/lib/format";
import type { RoomMovie } from "@/lib/types";

export function MovieCard({
  movie,
  onRemove,
  onToggleWatched,
}: {
  movie: RoomMovie;
  onRemove: () => void;
  onToggleWatched: () => void;
}) {
  const poster = posterUrl(movie.posterPath, "w342");
  const runtime = formatRuntime(movie.runtime);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl overflow-hidden glass"
    >
      <div className="relative aspect-[2/3] bg-surface-2">
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            className={`object-cover transition ${movie.watched ? "grayscale opacity-50" : ""}`}
          />
        ) : (
          <div className="grid place-items-center h-full text-4xl">🎞️</div>
        )}

        <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-black/60 backdrop-blur px-2 py-1 rounded-full">
          {mediaTypeLabel(movie.mediaType)}
        </span>

        {movie.voteAverage > 0 && (
          <span className="absolute top-2 right-2 text-[11px] font-bold bg-black/60 backdrop-blur px-2 py-1 rounded-full">
            ⭐ {movie.voteAverage.toFixed(1)}
          </span>
        )}

        {movie.watched && (
          <span className="absolute bottom-2 left-2 text-[11px] font-semibold bg-emerald-500/80 px-2 py-1 rounded-full">
            Vista
          </span>
        )}

        {/* Acciones al hacer hover */}
        <div className="absolute inset-0 flex items-end justify-center gap-2 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onToggleWatched}
            title={movie.watched ? "Marcar como no vista" : "Marcar como vista"}
            className="text-xs font-medium bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full transition"
          >
            {movie.watched ? "↩ No vista" : "✓ Vista"}
          </button>
          <button
            onClick={onRemove}
            title="Quitar de la sala"
            className="text-xs font-medium bg-red-500/70 hover:bg-red-500 px-3 py-1.5 rounded-full transition"
          >
            Quitar
          </button>
        </div>
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
          {movie.title}
        </h4>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted mt-1">
          {movie.year && <span>{movie.year}</span>}
          {runtime && <span>· {runtime}</span>}
        </div>
        {movie.genreNames.length > 0 && (
          <p className="text-[11px] text-muted mt-1 line-clamp-1">
            {movie.genreNames.slice(0, 3).join(", ")}
          </p>
        )}
        <p className="text-[11px] text-accent/80 mt-2">
          Añadida por {movie.addedByName}
        </p>
      </div>
    </motion.div>
  );
}

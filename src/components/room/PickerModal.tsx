"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { backdropUrl, posterUrl } from "@/lib/images";
import { formatRuntime, mediaTypeLabel } from "@/lib/format";
import { pickRandom } from "@/lib/picker";
import type { RoomMovie } from "@/lib/types";

/**
 * Muestra una animación de "sorteo" recorriendo varias carátulas y aterriza
 * en la película elegida (`winner`).
 */
export function PickerModal({
  candidates,
  winner,
  onClose,
  onReroll,
  onMarkWatched,
}: {
  candidates: RoomMovie[];
  winner: RoomMovie;
  onClose: () => void;
  onReroll: () => void;
  onMarkWatched: () => void;
}) {
  const [phase, setPhase] = useState<"shuffling" | "revealed">("shuffling");
  const [current, setCurrent] = useState<RoomMovie>(
    () => pickRandom(candidates) ?? winner,
  );

  // El componente se remonta en cada tirada (key en el padre), así que el
  // estado inicial ya es "shuffling"; aquí solo animamos de forma asíncrona.
  useEffect(() => {
    const start = Date.now();
    const duration = 1600;

    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setCurrent(winner);
        setPhase("revealed");
        return;
      }
      setCurrent(pickRandom(candidates) ?? winner);
      // Desaceleración progresiva.
      const delay = 60 + (elapsed / duration) * 220;
      timer = setTimeout(tick, delay);
    };
    let timer = setTimeout(tick, 60);
    return () => clearTimeout(timer);
  }, [candidates, winner]);

  const shown = phase === "revealed" ? winner : current;
  const backdrop = backdropUrl(shown.backdropPath) ?? posterUrl(shown.posterPath, "w500");
  const poster = posterUrl(shown.posterPath, "w342");
  const runtime = formatRuntime(shown.runtime);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden glass"
      >
        {/* Backdrop */}
        <div className="relative h-40 bg-surface-2">
          {backdrop && (
            <Image
              src={backdrop}
              alt=""
              fill
              sizes="480px"
              className="object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <p className="absolute top-4 left-0 right-0 text-center text-sm font-semibold tracking-widest uppercase text-white/90">
            {phase === "shuffling" ? "Eligiendo…" : "¡Esta noche toca!"}
          </p>
        </div>

        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex gap-4">
            <motion.div
              key={shown.id + phase}
              initial={{ scale: 0.8, opacity: 0.4, rotate: -2 }}
              animate={{
                scale: phase === "revealed" ? 1 : 0.94,
                opacity: 1,
                rotate: 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-28 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl bg-surface-2"
            >
              {poster ? (
                <Image src={poster} alt={shown.title} fill sizes="112px" className="object-cover" />
              ) : (
                <div className="grid place-items-center h-full text-3xl">🎞️</div>
              )}
            </motion.div>

            <div className="flex-1 pt-16 min-w-0">
              <motion.h2
                key={shown.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-black leading-tight line-clamp-2"
              >
                {shown.title}
              </motion.h2>
              <p className="text-xs text-muted mt-1">
                {mediaTypeLabel(shown.mediaType)}
                {shown.year ? ` · ${shown.year}` : ""}
                {runtime ? ` · ${runtime}` : ""}
                {shown.voteAverage > 0 ? ` · ⭐ ${shown.voteAverage.toFixed(1)}` : ""}
              </p>
            </div>
          </div>

          {phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {shown.genreNames.length > 0 && (
                <p className="text-xs text-accent mt-4">
                  {shown.genreNames.slice(0, 4).join(" · ")}
                </p>
              )}
              <p className="text-sm text-muted mt-2 line-clamp-4">
                {shown.overview || "Sin sinopsis disponible."}
              </p>
              <p className="text-xs text-muted mt-3">
                Añadida por {shown.addedByName}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  onClick={onReroll}
                  className="flex-1 min-w-[7rem] py-3 rounded-xl border border-border hover:bg-surface-2 transition font-medium"
                >
                  🎲 Otra vez
                </button>
                <button
                  onClick={onMarkWatched}
                  className="flex-1 min-w-[7rem] py-3 rounded-xl border border-border hover:bg-surface-2 transition font-medium"
                >
                  ✓ Marcar vista
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 min-w-[7rem] btn-gradient text-white font-semibold py-3 rounded-xl"
                >
                  ¡Vamos!
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useGenres } from "@/hooks/useGenres";
import type { PickerFilters, Room, RoomMovie } from "@/lib/types";

const RUNTIME_OPTIONS = [
  { label: "Sin límite", value: null },
  { label: "≤ 90 min", value: 90 },
  { label: "≤ 120 min", value: 120 },
  { label: "≤ 150 min", value: 150 },
];

export function FiltersBar({
  filters,
  onChange,
  room,
  movies,
}: {
  filters: PickerFilters;
  onChange: (f: PickerFilters) => void;
  room: Room;
  movies: RoomMovie[];
}) {
  const allGenres = useGenres();

  // Solo mostramos géneros presentes en la sala.
  const presentGenreIds = useMemo(() => {
    const set = new Set<number>();
    movies.forEach((m) => m.genreIds.forEach((g) => set.add(g)));
    return set;
  }, [movies]);

  const genres = allGenres.filter((g) => presentGenreIds.has(g.id));
  const members = Object.values(room.members);

  function toggleGenre(id: number) {
    const has = filters.genreIds.includes(id);
    onChange({
      ...filters,
      genreIds: has
        ? filters.genreIds.filter((g) => g !== id)
        : [...filters.genreIds, id],
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="glass rounded-2xl p-5 space-y-5 overflow-hidden"
    >
      {/* Tipo */}
      <Row label="Tipo">
        {(
          [
            ["any", "Todo"],
            ["movie", "Películas"],
            ["tv", "Series"],
          ] as const
        ).map(([value, label]) => (
          <Chip
            key={value}
            active={filters.mediaType === value}
            onClick={() => onChange({ ...filters, mediaType: value })}
          >
            {label}
          </Chip>
        ))}
      </Row>

      {/* Duración */}
      <Row label="Duración máx.">
        {RUNTIME_OPTIONS.map((opt) => (
          <Chip
            key={opt.label}
            active={filters.maxRuntime === opt.value}
            onClick={() => onChange({ ...filters, maxRuntime: opt.value })}
          >
            {opt.label}
          </Chip>
        ))}
      </Row>

      {/* Quién la añadió */}
      <Row label="Añadida por">
        <Chip
          active={filters.addedByUid === null}
          onClick={() => onChange({ ...filters, addedByUid: null })}
        >
          Cualquiera
        </Chip>
        {members.map((m) => (
          <Chip
            key={m.uid}
            active={filters.addedByUid === m.uid}
            onClick={() => onChange({ ...filters, addedByUid: m.uid })}
          >
            {m.displayName}
          </Chip>
        ))}
      </Row>

      {/* Géneros */}
      {genres.length > 0 && (
        <Row label="Géneros">
          {genres.map((g) => (
            <Chip
              key={g.id}
              active={filters.genreIds.includes(g.id)}
              onClick={() => toggleGenre(g.id)}
            >
              {g.name}
            </Chip>
          ))}
        </Row>
      )}

      {/* Nota mínima */}
      <Row label={`Nota mínima: ${filters.minRating.toFixed(1)}`}>
        <input
          type="range"
          min={0}
          max={9}
          step={0.5}
          value={filters.minRating}
          onChange={(e) =>
            onChange({ ...filters, minRating: Number(e.target.value) })
          }
          className="w-full max-w-xs accent-[var(--color-accent)]"
        />
      </Row>

      {/* Incluir vistas */}
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.includeWatched}
          onChange={(e) =>
            onChange({ ...filters, includeWatched: e.target.checked })
          }
          className="w-4 h-4 accent-[var(--color-accent)]"
        />
        Incluir las ya vistas
      </label>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-full border transition ${
        active
          ? "btn-gradient text-white border-transparent"
          : "border-border hover:bg-surface-2 text-muted"
      }`}
    >
      {children}
    </button>
  );
}

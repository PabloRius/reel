"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { MovieCard } from "@/components/room/MovieCard";
import { AddMovieDialog } from "@/components/room/AddMovieDialog";
import { FiltersBar } from "@/components/room/FiltersBar";
import { PickerModal } from "@/components/room/PickerModal";
import { useAuth } from "@/context/AuthContext";
import {
  deleteRoom,
  joinRoom,
  leaveRoom,
  removeMovie,
  subscribeRoom,
  subscribeRoomMovies,
  toggleWatched,
} from "@/lib/rooms";
import { applyFilters, defaultFilters, pickRandom } from "@/lib/picker";
import type { PickerFilters, Room, RoomMovie } from "@/lib/types";

function RoomView() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [movies, setMovies] = useState<RoomMovie[]>([]);
  const [filters, setFilters] = useState<PickerFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [adding, setAdding] = useState(false);
  const [winner, setWinner] = useState<RoomMovie | null>(null);
  const [candidates, setCandidates] = useState<RoomMovie[]>([]);
  const [pickCount, setPickCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  // Suscripción a la sala.
  useEffect(() => {
    const unsub = subscribeRoom(roomId, setRoom);
    return () => unsub();
  }, [roomId]);

  // Suscripción a las películas.
  useEffect(() => {
    const unsub = subscribeRoomMovies(roomId, setMovies);
    return () => unsub();
  }, [roomId]);

  // Unirse automáticamente al abrir el link.
  useEffect(() => {
    if (room && user && !room.memberIds.includes(user.uid)) {
      joinRoom(roomId, user).catch(() => {});
    }
  }, [room, user, roomId]);

  const filtered = useMemo(
    () => applyFilters(movies, filters),
    [movies, filters],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.mediaType !== "any") n++;
    if (filters.maxRuntime !== null) n++;
    if (filters.addedByUid) n++;
    if (filters.minRating > 0) n++;
    if (filters.genreIds.length) n++;
    if (filters.includeWatched) n++;
    return n;
  }, [filters]);

  const existingIds = useMemo(
    () => new Set(movies.map((m) => m.id)),
    [movies],
  );

  function handlePick() {
    const pool = applyFilters(movies, filters);
    if (pool.length === 0) {
      setNoMatch(true);
      setTimeout(() => setNoMatch(false), 2500);
      return;
    }
    setCandidates(pool);
    setWinner(pickRandom(pool));
    setPickCount((c) => c + 1);
  }

  async function handleShare() {
    const url = `${window.location.origin}/rooms/${roomId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: room?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelado */
    }
  }

  async function handleLeave() {
    if (!user) return;
    if (!confirm("¿Seguro que quieres salir de la sala?")) return;
    await leaveRoom(roomId, user.uid);
    router.push("/rooms");
  }

  async function handleDelete() {
    if (!confirm("Esto eliminará la sala y todas sus películas. ¿Continuar?"))
      return;
    await deleteRoom(roomId);
    router.push("/rooms");
  }

  if (room === undefined) return <Spinner label="Entrando en la sala…" />;

  if (room === null) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-5xl mb-4">🕳️</div>
        <h1 className="text-2xl font-bold mb-2">Sala no encontrada</h1>
        <p className="text-muted mb-6">
          Puede que se haya eliminado o que el link no sea correcto.
        </p>
        <button
          onClick={() => router.push("/rooms")}
          className="btn-gradient text-white font-semibold px-6 py-3 rounded-full"
        >
          Volver a mis salas
        </button>
      </main>
    );
  }

  const isOwner = room.ownerId === user?.uid;
  const members = Object.values(room.members);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{room.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {members.slice(0, 6).map((m) => (
                <span
                  key={m.uid}
                  title={m.displayName}
                  className="grid place-items-center w-7 h-7 rounded-full btn-gradient text-white text-xs font-semibold border-2 border-bg"
                >
                  {m.displayName.slice(0, 1).toUpperCase()}
                </span>
              ))}
            </div>
            <span className="text-sm text-muted">
              {members.length} {members.length === 1 ? "persona" : "personas"} ·{" "}
              {movies.length} en la lista
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full glass hover:bg-surface-2 transition text-sm font-medium"
          >
            {copied ? "¡Link copiado!" : "🔗 Compartir"}
          </button>
          <button
            onClick={handleLeave}
            className="px-4 py-2 rounded-full border border-border hover:bg-surface-2 transition text-sm font-medium"
          >
            Salir
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3 mb-6 sticky top-16 z-20 py-3">
        <button
          onClick={() => setAdding(true)}
          className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-full"
        >
          + Añadir peli/serie
        </button>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="px-5 py-2.5 rounded-full glass hover:bg-surface-2 transition font-medium"
        >
          Filtros
          {activeFilterCount > 0 && (
            <span className="ml-2 text-xs btn-gradient text-white rounded-full px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:inline">
            {filtered.length} candidata{filtered.length === 1 ? "" : "s"}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePick}
            disabled={movies.length === 0}
            className="btn-gradient text-white font-bold px-6 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🎲 ¡Elegir!
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {noMatch && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 text-sm text-amber-300 bg-amber-400/10 rounded-xl px-4 py-3"
          >
            Ninguna película cumple esos filtros. Prueba a relajarlos.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <div className="mb-6">
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              room={room}
              movies={movies}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Rejilla de películas */}
      {movies.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center mt-4">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-bold mb-2">La lista está vacía</h3>
          <p className="text-muted mb-6 max-w-sm mx-auto">
            Añade las pelis y series que os apetezca ver. Cuando haya varias,
            pulsa <b>¡Elegir!</b> y que decida la suerte.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="btn-gradient text-white font-semibold px-6 py-3 rounded-full"
          >
            + Añadir la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {movies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onRemove={() => removeMovie(roomId, m.id)}
                onToggleWatched={() => toggleWatched(roomId, m.id, !m.watched)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modales */}
      <AnimatePresence>
        {adding && user && (
          <AddMovieDialog
            roomId={roomId}
            user={user}
            existingIds={existingIds}
            onClose={() => setAdding(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winner && (
          <PickerModal
            key={pickCount}
            candidates={candidates}
            winner={winner}
            onClose={() => setWinner(null)}
            onReroll={() => {
              const pool = applyFilters(movies, filters);
              if (pool.length) {
                setCandidates(pool);
                setWinner(pickRandom(pool));
                setPickCount((c) => c + 1);
              }
            }}
            onMarkWatched={async () => {
              await toggleWatched(roomId, winner.id, true);
              setWinner(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function RoomPage() {
  return (
    <AuthGate>
      <RoomView />
    </AuthGate>
  );
}

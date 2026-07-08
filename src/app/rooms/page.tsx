"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
import { createRoom, subscribeUserRooms } from "@/lib/rooms";
import type { Room } from "@/lib/types";

function RoomsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserRooms(user.uid, setRooms);
    return () => unsub();
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    try {
      const id = await createRoom(user, name);
      router.push(`/rooms/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 flex-1 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Tus salas</h1>
          <p className="text-muted text-sm mt-1">
            Crea una sala o entra a una existente.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-full whitespace-nowrap"
        >
          + Nueva sala
        </button>
      </div>

      {rooms === null ? (
        <Spinner label="Cargando salas…" />
      ) : rooms.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/rooms/${room.id}`}
                  className="block glass rounded-2xl p-5 h-full hover:border-accent transition group"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg group-hover:gradient-text transition">
                      {room.name}
                    </h3>
                    <span className="text-xs text-muted">
                      {room.memberIds.length} 👥
                    </span>
                  </div>
                  <div className="flex -space-x-2 mt-4">
                    {Object.values(room.members)
                      .slice(0, 5)
                      .map((m) => (
                        <span
                          key={m.uid}
                          title={m.displayName}
                          className="grid place-items-center w-7 h-7 rounded-full btn-gradient text-white text-xs font-semibold border-2 border-surface"
                        >
                          {m.displayName.slice(0, 1).toUpperCase()}
                        </span>
                      ))}
                  </div>
                  {room.ownerId === user?.uid && (
                    <span className="inline-block mt-4 text-[11px] text-accent bg-accent/10 rounded-full px-2 py-0.5">
                      Eres el anfitrión
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setCreating(false)}
          >
            <motion.form
              onSubmit={handleCreate}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass rounded-3xl p-7"
            >
              <h2 className="text-xl font-bold mb-1">Nueva sala</h2>
              <p className="text-sm text-muted mb-5">
                Ponle un nombre. Luego podrás invitar con un link.
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Noche de peli con la peña"
                className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border outline-none focus:border-accent transition mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="flex-1 py-3 rounded-xl border border-border hover:bg-surface-2 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="flex-1 btn-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                >
                  {busy ? "Creando…" : "Crear"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-12 text-center"
    >
      <div className="text-5xl mb-4">🍿</div>
      <h3 className="text-xl font-bold mb-2">Aún no tienes salas</h3>
      <p className="text-muted mb-6 max-w-sm mx-auto">
        Crea tu primera sala, invita a tus amigos y empezad a llenar la lista de
        pelis y series.
      </p>
      <button
        onClick={onCreate}
        className="btn-gradient text-white font-semibold px-6 py-3 rounded-full"
      >
        Crear mi primera sala
      </button>
    </motion.div>
  );
}

export default function RoomsPage() {
  return (
    <AuthGate>
      <RoomsDashboard />
    </AuthGate>
  );
}

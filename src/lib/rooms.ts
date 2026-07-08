import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Genre,
  MediaResult,
  Room,
  RoomMember,
  RoomMovie,
} from "@/lib/types";
import type { User } from "firebase/auth";

const roomsCol = () => collection(db, "rooms");
const roomDoc = (roomId: string) => doc(db, "rooms", roomId);
const moviesCol = (roomId: string) =>
  collection(db, "rooms", roomId, "movies");

function memberFromUser(user: User): RoomMember {
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "Anónimo",
    photoURL: user.photoURL ?? null,
    joinedAt: Date.now(),
  };
}

/** Crea una sala y devuelve su id. El creador queda dentro automáticamente. */
export async function createRoom(user: User, name: string): Promise<string> {
  const member = memberFromUser(user);
  const ref = await addDoc(roomsCol(), {
    name: name.trim() || "Sala sin nombre",
    ownerId: user.uid,
    memberIds: [user.uid],
    members: { [user.uid]: member },
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Suscripción en tiempo real a las salas en las que participa el usuario. */
export function subscribeUserRooms(
  uid: string,
  cb: (rooms: Room[]) => void,
): Unsubscribe {
  const q = query(roomsCol(), where("memberIds", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs.map((d) => mapRoom(d.id, d.data()));
    rooms.sort((a, b) => b.createdAt - a.createdAt);
    cb(rooms);
  });
}

/** Suscripción en tiempo real a una sala concreta. `null` si no existe. */
export function subscribeRoom(
  roomId: string,
  cb: (room: Room | null) => void,
): Unsubscribe {
  return onSnapshot(roomDoc(roomId), (snap) => {
    cb(snap.exists() ? mapRoom(snap.id, snap.data()) : null);
  });
}

/** Añade al usuario actual como miembro de la sala (al abrir el link). */
export async function joinRoom(roomId: string, user: User): Promise<void> {
  const ref = roomDoc(roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("La sala no existe o fue eliminada");
  const data = snap.data();
  if ((data.memberIds as string[])?.includes(user.uid)) return;

  const member = memberFromUser(user);
  await updateDoc(ref, {
    [`members.${user.uid}`]: member,
    memberIds: [...(data.memberIds as string[]), user.uid],
  });
}

/**
 * El usuario sale de la sala. Si era el último miembro, la sala se elimina
 * por completo (junto con sus películas).
 */
export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  const ref = roomDoc(roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const remaining = (data.memberIds as string[]).filter((id) => id !== uid);

  if (remaining.length === 0) {
    await deleteRoom(roomId);
    return;
  }

  const members = { ...(data.members as Record<string, RoomMember>) };
  delete members[uid];
  // Si el dueño se va, transfiere la propiedad al primer miembro restante.
  const ownerId = data.ownerId === uid ? remaining[0] : data.ownerId;

  await updateDoc(ref, { memberIds: remaining, members, ownerId });
}

/** Elimina la sala y todas sus películas. */
export async function deleteRoom(roomId: string): Promise<void> {
  const movies = await getDocs(moviesCol(roomId));
  const batch = writeBatch(db);
  movies.forEach((m) => batch.delete(m.ref));
  batch.delete(roomDoc(roomId));
  await batch.commit();
}

/** Suscripción en tiempo real a las películas/series de una sala. */
export function subscribeRoomMovies(
  roomId: string,
  cb: (movies: RoomMovie[]) => void,
): Unsubscribe {
  const q = query(moviesCol(roomId), orderBy("addedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as RoomMovie));
  });
}

/** Añade una película/serie a la sala. Idempotente por (mediaType, tmdbId). */
export async function addMovie(
  roomId: string,
  media: MediaResult,
  genres: Genre[],
  user: User,
): Promise<void> {
  const id = `${media.mediaType}-${media.tmdbId}`;
  const genreMap = new Map(genres.map((g) => [g.id, g.name]));
  const movie: RoomMovie = {
    id,
    tmdbId: media.tmdbId,
    mediaType: media.mediaType,
    title: media.title,
    overview: media.overview,
    posterPath: media.posterPath,
    backdropPath: media.backdropPath,
    year: media.year,
    voteAverage: media.voteAverage,
    genreIds: media.genreIds,
    genreNames: media.genreIds
      .map((gid) => genreMap.get(gid))
      .filter((n): n is string => Boolean(n)),
    runtime: media.runtime,
    addedByUid: user.uid,
    addedByName:
      user.displayName || user.email?.split("@")[0] || "Anónimo",
    addedAt: Date.now(),
    watched: false,
  };
  await setDoc(doc(moviesCol(roomId), id), movie);
}

export async function removeMovie(
  roomId: string,
  movieId: string,
): Promise<void> {
  await deleteDoc(doc(moviesCol(roomId), movieId));
}

export async function toggleWatched(
  roomId: string,
  movieId: string,
  watched: boolean,
): Promise<void> {
  await updateDoc(doc(moviesCol(roomId), movieId), { watched });
}

// --- helpers ---

function mapRoom(id: string, data: Record<string, unknown>): Room {
  const created = data.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    name: (data.name as string) ?? "Sala",
    ownerId: (data.ownerId as string) ?? "",
    memberIds: (data.memberIds as string[]) ?? [],
    members: (data.members as Record<string, RoomMember>) ?? {},
    createdAt: created?.toMillis?.() ?? Date.now(),
  };
}

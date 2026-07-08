/** Tipos de dominio compartidos entre cliente y servidor. */

export type MediaType = "movie" | "tv";

/** Resultado normalizado de una búsqueda en TMDB (película o serie). */
export interface MediaResult {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null; // ISO "YYYY-MM-DD"
  year: number | null;
  voteAverage: number;
  genreIds: number[];
  runtime: number | null; // minutos (puede venir null en búsqueda)
}

export interface Genre {
  id: number;
  name: string;
}

/** Miembro de una sala. */
export interface RoomMember {
  uid: string;
  displayName: string;
  photoURL: string | null;
  joinedAt: number; // epoch ms
}

/** Documento de sala en Firestore: rooms/{roomId}. */
export interface Room {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[]; // para queries "salas donde participo"
  members: Record<string, RoomMember>;
  createdAt: number;
}

/** Película/serie añadida a una sala: rooms/{roomId}/movies/{movieId}. */
export interface RoomMovie {
  id: string; // `${mediaType}-${tmdbId}`
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: number | null;
  voteAverage: number;
  genreIds: number[];
  genreNames: string[];
  runtime: number | null; // minutos
  addedByUid: string;
  addedByName: string;
  addedAt: number;
  watched: boolean;
}

/** Filtros aplicados al hacer el "picker" aleatorio. */
export interface PickerFilters {
  genreIds: number[]; // vacío = cualquiera
  mediaType: MediaType | "any";
  addedByUid: string | null; // null = cualquiera
  maxRuntime: number | null; // minutos, null = sin límite
  minRating: number; // 0-10
  includeWatched: boolean;
}

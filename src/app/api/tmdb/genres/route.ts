import { NextResponse } from "next/server";
import { getGenres } from "@/lib/tmdb";

export async function GET() {
  try {
    const genres = await getGenres();
    return NextResponse.json({ genres });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en TMDB";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

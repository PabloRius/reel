import { NextResponse } from "next/server";
import { getDetails } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get("mediaType") as MediaType | null;
  const id = Number(searchParams.get("id"));

  if ((mediaType !== "movie" && mediaType !== "tv") || !id) {
    return NextResponse.json(
      { error: "Parámetros inválidos: se requiere mediaType e id" },
      { status: 400 },
    );
  }

  try {
    const result = await getDetails(mediaType, id);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en TMDB";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

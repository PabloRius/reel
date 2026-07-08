import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  try {
    const results = await searchMulti(query);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en TMDB";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

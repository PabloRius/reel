import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Reel — Elige qué ver, juntos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Tarjeta de previsualización que se muestra al compartir el enlace en redes,
// chats, etc. Reutiliza el logo (public/logo.png) sobre el degradado de marca.
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 25% 20%, #a855f7 0%, transparent 45%)," +
            "radial-gradient(circle at 80% 85%, #ec4899 0%, transparent 45%)," +
            "#0a0a10",
          color: "#ececf4",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Reel"
          width={200}
          height={200}
          style={{ borderRadius: 40 }}
        />
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            marginTop: 24,
            letterSpacing: -2,
            background: "linear-gradient(120deg, #c084fc, #f472b6)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Reel
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#9494ad",
            marginTop: 4,
          }}
        >
          ¿Qué vemos esta noche?
        </div>
      </div>
    ),
    { ...size },
  );
}

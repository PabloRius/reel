import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "Reel — Elige qué ver, juntos";
const description =
  "Crea salas con tus amigos, añadid películas y series, y dejad que la suerte elija qué ver esta noche.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Reel",
  // Los iconos (favicon, apple-icon) y las imágenes de OG/Twitter se detectan
  // automáticamente desde src/app/{icon,apple-icon,opengraph-image,twitter-image}.
  openGraph: {
    type: "website",
    siteName: "Reel",
    title,
    description,
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="aurora-bg" aria-hidden />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

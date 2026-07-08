"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

const features = [
  {
    icon: "🎬",
    title: "Crea una sala",
    text: "Monta una sala en segundos y comparte el link con quien quieras.",
  },
  {
    icon: "🍿",
    title: "Añadid pelis y series",
    text: "Cada persona añade lo que le apetece ver, con datos reales de TMDB.",
  },
  {
    icon: "🎲",
    title: "Deja que decida la suerte",
    text: "Filtra por género, duración o quién la añadió y pulsa: ¡a ver!",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/rooms");
  }, [user, loading, router]);

  return (
    <main className="flex-1">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Logo />
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-2 rounded-full glass hover:bg-surface-2 transition"
        >
          Entrar
        </Link>
      </nav>

      <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block text-xs uppercase tracking-widest text-muted mb-5">
            Vuestro cine, sin discusiones
          </span>
          <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight">
            ¿Qué vemos <span className="gradient-text">esta noche?</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
            Reunid vuestras pelis y series en una sala compartida y dejad que Reel
            elija por vosotros. Se acabó el scroll infinito.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="btn-gradient text-white font-semibold px-7 py-3 rounded-full"
            >
              Empezar gratis
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 grid gap-5 sm:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
            <p className="text-sm text-muted">{f.text}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}

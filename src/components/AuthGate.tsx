"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/Spinner";
import { Navbar } from "@/components/Navbar";

/**
 * Envuelve páginas que requieren sesión. Muestra spinner mientras carga y
 * redirige a /login (conservando la ruta de destino) si no hay usuario.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && configured && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, configured, pathname, router]);

  if (!configured) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Configura Firebase</h1>
        <p className="text-muted">
          Copia <code className="text-accent">.env.example</code> a{" "}
          <code className="text-accent">.env.local</code> y rellena las claves de
          Firebase y TMDB para empezar.
        </p>
      </main>
    );
  }

  if (loading || !user) return <Spinner label="Cargando…" />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

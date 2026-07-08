"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/Spinner";

function LoginInner() {
  const { user, loading, configured, signInWithEmail, signUpWithEmail, signInWithGoogle } =
    useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/rooms";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      router.replace(next);
    } catch (err) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace(next);
    } catch (err) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Configura Firebase</h1>
        <p className="text-muted">
          Rellena <code className="text-accent">.env.local</code> con tus claves
          de Firebase y TMDB (ver <code className="text-accent">.env.example</code>).
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 grid place-items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm glass rounded-3xl p-8"
      >
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">
          {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h1>
        <p className="text-sm text-muted text-center mb-6">
          {mode === "login"
            ? "Entra para ver tus salas"
            : "Empieza a elegir pelis en segundos"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <Input
              placeholder="Tu nombre"
              value={name}
              onChange={setName}
              type="text"
              required
            />
          )}
          <Input
            placeholder="Email"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <Input
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-gradient text-white font-semibold w-full py-3 rounded-xl disabled:opacity-60"
          >
            {busy ? "Cargando…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-xs text-muted">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-3 rounded-xl border border-border hover:bg-surface-2 transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <GoogleIcon /> Continuar con Google
        </button>

        <p className="text-sm text-muted text-center mt-6">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-accent font-medium hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Entra"}
          </button>
        </p>
      </motion.div>
    </main>
  );
}

function Input({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border outline-none focus:border-accent transition placeholder:text-muted"
    />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.9 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function translateError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/user-not-found": "No existe ninguna cuenta con ese email.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/email-already-in-use": "Ese email ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El email no es válido.",
    "auth/popup-closed-by-user": "Has cerrado la ventana de Google.",
  };
  return map[code] || "Algo salió mal. Inténtalo de nuevo.";
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginInner />
    </Suspense>
  );
}

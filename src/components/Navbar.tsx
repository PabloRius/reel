"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = (user?.displayName || user?.email || "?")
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Logo href={user ? "/rooms" : "/"} />

        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-surface-2 transition"
            >
              <span className="grid place-items-center w-8 h-8 rounded-full btn-gradient text-white text-sm font-semibold">
                {initials}
              </span>
              <span className="text-sm text-muted max-w-[10rem] truncate">
                {user.displayName || user.email}
              </span>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-44 glass rounded-xl overflow-hidden shadow-xl"
                onMouseLeave={() => setOpen(false)}
              >
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-surface-2 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

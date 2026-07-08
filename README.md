# 🎬 Reel — Movie/Series Picker

Crea salas con tus amigos, añadid películas y series, aplicad filtros y dejad que
la suerte elija qué ver esta noche.

Stack: **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** ·
**Firebase** (Auth + Firestore) · **TMDB** · **Motion** (animaciones) ·
**pnpm** · entorno reproducible con **Nix flakes + direnv**.

---

## 1. Entorno de desarrollo (NixOS)

El repo trae un `flake.nix` que provee Node 22 y pnpm, y un `.envrc` para direnv.

```bash
# La primera vez, autoriza direnv en el directorio:
direnv allow

# A partir de ahí, al entrar en la carpeta tendrás node y pnpm disponibles.
# (o entra manualmente al shell:)
nix develop
```

Instala las dependencias:

```bash
pnpm install
```

## 2. Variables de entorno

Copia el ejemplo y rellena tus claves:

```bash
cp .env.example .env.local
```

### TMDB (catálogo de películas/series)

1. Crea una cuenta gratis en <https://www.themoviedb.org/>.
2. Ve a **Settings → API** y solicita una API key.
3. Copia el **API Read Access Token (v4)** (empieza por `eyJ...`) en
   `TMDB_ACCESS_TOKEN`. Esta clave vive **solo en el servidor** (route handlers
   en `/api/tmdb/*`), nunca se expone al navegador.

### Firebase (auth + base de datos)

1. Crea un proyecto en <https://console.firebase.google.com/>.
2. **Authentication → Sign-in method**: habilita *Email/Password* y *Google*.
3. **Firestore Database**: créala en modo producción.
4. **Project settings → General → Your apps → Web app**: registra una app web y
   copia la config en las variables `NEXT_PUBLIC_FIREBASE_*` de `.env.local`.
5. Publica las reglas de seguridad incluidas en `firestore.rules`:

   ```bash
   # con Firebase CLI (opcional):
   firebase deploy --only firestore:rules
   ```

   O pégalas manualmente en **Firestore → Rules**.

## 3. Arrancar en desarrollo

```bash
pnpm dev
# http://localhost:3000
```

## 4. Scripts

| Comando        | Descripción                     |
| -------------- | ------------------------------- |
| `pnpm dev`     | Servidor de desarrollo          |
| `pnpm build`   | Build de producción             |
| `pnpm start`   | Sirve el build                  |
| `pnpm lint`    | ESLint                          |

---

## Estructura

```
src/
├─ app/
│  ├─ api/tmdb/        # Route handlers (proxy seguro a TMDB)
│  ├─ login/           # Login / registro
│  ├─ rooms/           # Listado de salas y sala [roomId]
│  ├─ layout.tsx       # Layout raíz + AuthProvider
│  └─ page.tsx         # Landing
├─ components/         # UI (Navbar, AuthGate, room/*)
├─ context/            # AuthContext (Firebase Auth)
├─ hooks/              # useGenres
└─ lib/                # firebase, tmdb, rooms (Firestore), picker, tipos
```

## Modelo de datos (Firestore)

- `rooms/{roomId}`: `{ name, ownerId, memberIds[], members{}, createdAt }`
- `rooms/{roomId}/movies/{mediaType-tmdbId}`: película/serie añadida, con género,
  duración, quién la añadió y si está vista.

Una sala existe hasta que alguien la elimina o hasta que **sale la última
persona** (entonces se borra automáticamente con todas sus películas).

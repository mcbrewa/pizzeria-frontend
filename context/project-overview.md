# Project Overview

## Przegląd

Frontend SSR (TanStack Start) do backendu (Express) z systemem autoryzacji (JWT + refresh token cookie), RBAC, zarządzaniem użytkownikami, rolami, permissionami i adresami.

Backend to osobny serwis działający na `http://localhost:5000` — ścieżki `/api/*` są proxy-owane przez Vite do backendu.

**Ścieżki:**
- Frontend: `C:\Users\brw\Desktop\tanstakstartfront\frontend\`
- Backend (tylko referencyjna): `C:\Users\brw\Desktop\refaktor_fullstack\backend\`

---

## Tech Stack

| Kategoria | Technologia |
|---|---|
| Framework | TanStack Start (SSR) + Vite |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query v5 |
| UI | React 19 |
| Język | TypeScript 5 (strict) |
| Stylowanie | SCSS Modules (własne komponenty) + Tailwind 4 (tylko shadcn/ui) |
| Komponenty UI | shadcn/ui, Radix UI, lucide-react |
| HTTP client | Axios |
| Walidacja | Zod v4 |
| Testy | Vitest + Testing Library |
| Backend | Express (osobny serwis) |

---

## Architektura frontend

### Zasada: Routes vs Pages

**Routes** (`src/routes/`) — cienkie pliki file-based routingu TanStack Router. Odpowiadają TYLKO za:
- Definicję route (`createFileRoute`)
- Import gotowego Page
- Loader / beforeLoad (auth guard, prefetch danych)
- Head/meta tagi

**Pages** (`src/pages/`) — pełna implementacja strony. Każda strona to folder:

```
src/pages/
├── HomePage/
│   ├── index.tsx              # Główny komponent strony
│   ├── types.ts               # Typy specyficzne dla strony
│   ├── style.module.scss      # Style strony
│   └── components/            # Komponenty używane TYLKO na tej stronie
│       ├── HeroSection/
│       │   ├── index.tsx
│       │   ├── style.module.scss
│       │   └── types.ts
│       └── FeatureGrid/
│           ├── index.tsx
│           └── style.module.scss
├── LoginPage/
│   ├── index.tsx
│   └── components/LoginForm/
└── DashboardPage/
    ├── index.tsx
    └── components/
```

### Przykład relacji Route → Page

```tsx
// src/routes/index.tsx (CIENKI — tylko routing)
import { createFileRoute } from '@tanstack/react-router'
import HomePage from '@/pages/HomePage'

export const Route = createFileRoute('/')({
  component: HomePage,
})
```

```tsx
// src/pages/HomePage/index.tsx (GRUBY — cała logika strony)
import HeroSection from './components/HeroSection'
import FeatureGrid from './components/FeatureGrid'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeatureGrid />
    </div>
  )
}
```

### Layouts

Layouty w `src/layouts/` — współdzielone wrappery stron. Nie duplikujemy kodu layoutu w każdej stronie.

```
src/layouts/
├── RootLayout/           # Bazowy layout (html, head, body)
│   ├── index.tsx
│   └── style.module.scss
├── AuthLayout/           # Layout dla stron logowania/rejestracji (centrowany card)
│   ├── index.tsx
│   └── style.module.scss
└── DashboardLayout/      # Layout panelu (sidebar + topbar + content area)
    ├── index.tsx
    ├── style.module.scss
    └── components/
        ├── Sidebar/
        └── Topbar/
```

Layouty aplikujemy w `__root.tsx` lub w route groupach TanStack Router (np. `_auth.tsx`, `_dashboard.tsx`).

### SSR i data fetching

Korzystamy z **SSR-first** podejścia TanStack Start:

- **Server functions** (`createServerFn`) — logika serwerowa (Node.js), dostęp do `getWebRequest()` (cookies, headers)
- **Loaders** w routes — prefetch danych na serwerze, dane dostępne od pierwszego renderowania (zero flash)
- **`beforeLoad`** — guardy autoryzacji, redirecty (działa na serwerze i kliencie)

**Zasada:** Dane potrzebne przy pierwszym renderowaniu → loader + server function. Dane ładowane po interakcji usera (np. submit formularza) → client-side API calls (axios).

#### Autoryzacja SSR

1. Root loader wywołuje server function `getServerAuthState()`
2. Server function forwarduje cookies do backendu → refresh token → access token → profil usera
3. Wynik trafia do `AuthProvider` jako `initialAuthState` → user zalogowany od pierwszego renderowania
4. Client-side interceptor 401 w axios to **fallback** — obsługuje wygaśnięcie tokenu w trakcie sesji

---

## Pełna struktura `src/`

```
src/
├── api/                   # Warstwa komunikacji z backendem
│   ├── client.ts          # Axios instance (base URL, interceptory, token store)
│   ├── server-auth.ts     # Server function: getServerAuthState() — SSR auth via cookies
│   ├── auth.ts            # Client-side endpointy auth (login, register, logout...)
│   ├── users.ts           # Endpointy users
│   ├── roles.ts           # Endpointy roles
│   ├── permissions.ts     # Endpointy permissions
│   └── addresses.ts       # Endpointy addresses
├── components/            # Współdzielone komponenty (globalne, reużywalne — 2+ stron)
│   └── ui/                # shadcn/ui komponenty (Button/, Card/, Input/, Label/...)
├── hooks/                 # Custom hooks
│   ├── useAuth.tsx        # AuthProvider (context) + useAuth hook
│   └── ...
├── layouts/               # Layouty stron
├── lib/                   # Utility functions
│   ├── utils.ts           # cn() helper (shadcn/ui)
│   └── validations/       # Zod schematy walidacji
│       └── auth.ts        # loginSchema, registerSchema
├── pages/                 # Implementacje stron (GRUBE)
├── routes/                # File-based routing (CIENKIE)
├── types/                 # Współdzielone typy / DTO
│   ├── api.ts             # ApiResponse, PaginatedResponse, ApiErrorDetail
│   ├── auth.ts            # UserDto, UserProfileDto, AuthResponse, SessionDto...
│   └── index.ts           # Barrel re-export
├── router.tsx             # Konfiguracja routera
└── styles.css             # Globalne style / Tailwind + shadcn CSS variables
```

---

## Backend API (reference)

Base URL: `http://localhost:5000/api` (proxy przez Vite jako `/api`)

### Auth (`/api/auth`)

| Metoda | Endpoint | Opis | Auth |
|---|---|---|---|
| POST | `/register` | Rejestracja | publiczny |
| POST | `/login` | Logowanie → `{ user, accessToken, session }` | publiczny |
| POST | `/refresh` | Odświeżenie tokenu (cookie) → `{ accessToken }` | publiczny |
| POST | `/logout` | Wylogowanie | auth |
| POST | `/logout-all` | Wylogowanie ze wszystkich urządzeń | auth |
| POST | `/logout-other-devices` | Wylogowanie z innych urządzeń | auth |
| POST | `/change-password` | Zmiana hasła | auth |
| POST | `/request-password-reset` | Żądanie resetu hasła | publiczny |
| POST | `/reset-password` | Reset hasła (token + nowe hasło) | publiczny |

### Users (`/api/users`)

| Metoda | Endpoint | Opis | Permission |
|---|---|---|---|
| GET | `/profile` | Profil zalogowanego (z rolami) | auth |
| PATCH | `/profile` | Aktualizacja profilu | auth |
| GET | `/` | Lista userów (paginacja, filtry) | users.read |
| GET | `/:id` | Szczegóły usera | users.read |
| PATCH | `/:id/ban` | Zablokowanie usera | users.update |
| PATCH | `/:id/unban` | Odblokowanie usera | users.update |
| PATCH | `/:id/activate` | Aktywacja usera | users.update |
| PATCH | `/:id/deactivate` | Deaktywacja usera | users.update |
| DELETE | `/:id` | Usunięcie usera | users.delete |

### Roles (`/api/roles`)

| Metoda | Endpoint | Opis | Permission |
|---|---|---|---|
| GET | `/` | Lista ról | roles.read |
| GET | `/:id` | Szczegóły roli | roles.read |
| POST | `/` | Tworzenie roli | roles.create |
| PATCH | `/:id` | Edycja roli | roles.update |
| DELETE | `/:id` | Usunięcie roli | roles.delete |
| GET | `/:id/permissions` | Permissiony roli | roles.read |
| POST | `/:id/permissions` | Dodanie permissiona do roli | roles.update |
| DELETE | `/:id/permissions/:permissionId` | Usunięcie permissiona z roli | roles.update |

### Permissions (`/api/permissions`)

| Metoda | Endpoint | Opis | Permission |
|---|---|---|---|
| GET | `/` | Lista (paginacja, filtr group/search) | permissions.read |
| GET | `/:id` | Szczegóły | permissions.read |

### Addresses (`/api/addresses`)

| Metoda | Endpoint | Opis | Auth |
|---|---|---|---|
| GET | `/` | Lista adresów usera | auth |
| GET | `/:id` | Szczegóły adresu | auth |
| POST | `/` | Tworzenie adresu | auth |
| PATCH | `/:id` | Edycja adresu | auth |
| DELETE | `/:id` | Usunięcie adresu | auth |
| PATCH | `/:id/default` | Ustaw jako domyślny | auth |

### Response envelope

```typescript
// Sukces
{ success: true, data: T }

// Błąd
{ success: false, error: { code: string, message: string, details?: Record<string, unknown> } }
```

Kody błędów: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`

### Auth mechanizm

- Access token: JWT w headerze `Authorization: Bearer <token>`
- Refresh token: HTTP-only cookie (path: `/api/auth`)
- Token storage: in-memory zmienna modułowa (nie localStorage — SSR-safe)
- SSR flow: root loader → server function forwarduje cookie → refresh → profil → `AuthProvider` initial state
- Client-side flow: axios interceptor 401 → auto refresh → retry

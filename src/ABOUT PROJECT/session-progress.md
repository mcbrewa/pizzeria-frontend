# Stan projektu — podsumowanie sesji 2026-06-19

> Wczytaj ten plik przed każdą sesją dotyczącą pizzeria-backend lub frontendu.
> Zawiera pełny obraz co zostało zbudowane i co czeka na implementację.

---

## Lokalizacje projektów

| Projekt | Ścieżka | Port | Status |
|---|---|---|---|
| Frontend (TanStack Start) | `C:\Users\brw\Desktop\Majowy_Projekt\frontend` | 3000 | W budowie |
| Backend użytkowników (refaktor) | `C:\Users\brw\Desktop\refaktor_fullstack\backend` | 5000 | Gotowy |
| Backend pizzerii | `C:\Users\brw\Desktop\Majowy_Projekt\backend` | 5001 | Fundament gotowy |

---

## Backend użytkowników — `refaktor_fullstack` (port 5000)

### Stack
Express 5 + Mongoose 9 + Zod 4 + TypeScript (TS 5.9.3) + MongoDB Atlas (`bookstore` db)

> Uwaga: baza danych w Atlas nazywa się `bookstore` (nie `refaktor-db` jak w starszej dokumentacji)

### Co jest zaimplementowane

| Feature | Endpointy | Status |
|---|---|---|
| JWT Auth | `POST /api/auth/login`, `logout`, `refresh`, `register` | ✅ |
| Multi-session | `POST /api/auth/logout-all`, `GET /api/users/active-sessions` | ✅ |
| OAuth Google + GitHub | `GET /api/auth/google*`, `GET /api/auth/github*` | ✅ |
| Weryfikacja email | `POST /api/auth/verify-email`, `resend-verification` | ✅ |
| Reset hasła | `POST /api/auth/forgot-password`, `reset-password`, `change-password` | ✅ |
| RBAC (role, permisje) | `GET/POST/PATCH/DELETE /api/roles*`, `/api/permissions*` | ✅ |
| Zarządzanie userami (admin) | `GET/PATCH/DELETE /api/users*` | ✅ |
| Profil usera | `GET/PATCH /api/users/profile` | ✅ |
| Adresy usera | `GET/POST/PATCH/DELETE /api/addresses*` | ✅ |
| Admin Invitation Flow | `POST /api/users/invite`, `POST /api/auth/accept-invitation` | ✅ |
| Organisation model | Model + seed (defaultOrg `mcbrewa`) | ✅ |

### JWT payload — aktualny kształt

```typescript
type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  organisationId: string;
  roles?: string[];        // opcjonalne — KROK 1 z refaktor-next-steps.md jeszcze nie zrobiony
  permissions?: string[];  // opcjonalne — j.w.
};
```

### Zmienne środowiskowe (.env)

```env
MONGODB_URI="mongodb+srv://konradbrewczynski1_db_user:abc123brewa@cluster0.tsqdzyi.mongodb.net/bookstore?appName=Cluster0"
PORT=5000
ACCESS_TOKEN_SECRET=your_super_secret_access_key_change_me_123
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_change_me_456
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DEFAULT_ROLE_SLUG=customer
```

### Co jeszcze NIE jest zrobione w refaktorze (blokuje pełne działanie pizzerii)

| Krok | Opis | Priorytet |
|---|---|---|
| KROK 1 | Org-aware RBAC — `roles[]` i `permissions[]` w JWT, `organisationId` w `UserRole` | Wysoki |
| KROK 2 | Rejestracja z `organisationSlug` | Średni |
| KROK 3 | Invitation flow z `organisationId` | Średni |
| KROK 4 | Organisation CRUD routes | Niski |

> Bez KROKU 1 — `requirePermission` w pizzerii nie blokuje niczego (permissions[] będzie puste/undefined).
> Panel logowania na frontendzie DZIAŁA bez tych kroków — login/logout/profil nie wymagają org-aware RBAC.

---

## Backend pizzerii — `Majowy_Projekt/backend` (port 5001)

### Stack
Express 5 + Mongoose 9 + Zod 4 + TypeScript 6.0.3 (ESM) + MongoDB Atlas (`pizzeria-db`)

### Zmienne środowiskowe (.env)

```env
PORT=5001
MONGODB_URI="mongodb+srv://konradbrewczynski1_db_user:abc123brewa@cluster0.tsqdzyi.mongodb.net/pizzeria-db?appName=Cluster0"
JWT_SECRET=your_super_secret_access_key_change_me_123
PIZZERIA_ORG_ID=
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> `JWT_SECRET` = `ACCESS_TOKEN_SECRET` z refaktora (identyczny — oba weryfikują te same tokeny)
> `PIZZERIA_ORG_ID` — puste, bo org pizzerii nie istnieje jeszcze w bazie

### Co jest zaimplementowane

```
src/
├── config/
│   ├── db/index.ts              — connectDB()
│   └── container/
│       ├── services.config.ts   — tokenConfig (JWT_SECRET), authConfig (PIZZERIA_ORG_ID)
│       ├── services.ts          — instancja TokenService
│       ├── middleware.ts        — requireAuth + requirePermission
│       └── index.ts             — re-export
├── controllers/
│   └── common/
│       ├── types.ts             — createSuccessResponse, createErrorResponse, ErrorCodes
│       ├── errorHandler.ts      — handleControllerError()
│       ├── validation.ts        — validateRequest()
│       └── schemas.ts           — mongoIdSchema, paginationSchema, nameSchema
├── errors/
│   ├── BaseError.ts, NotFoundError.ts, ConflictError.ts
│   ├── UnauthorizedError.ts, ForbiddenError.ts
│   ├── ValidationError.ts, TooManyRequestsError.ts
│   └── index.ts
├── middlewares/
│   ├── requireAuth.ts           — weryfikuje JWT + sprawdza PIZZERIA_ORG_ID
│   └── requirePermission.ts     — czyta permissions[] z JWT (zero DB)
├── services/
│   └── TokenService/
│       ├── index.ts             — tylko verifyAccessToken()
│       └── types.ts             — AccessTokenPayload, ITokenService
├── types/
│   └── express.d.ts             — rozszerzenie Request (userId, sessionId, organisationId, roles, permissions)
├── app.ts                       — Express setup (cors, helmet, morgan, cookieParser)
└── server.ts                    — dotenv, connectDB, app.listen (port 5001)
```

### Co jeszcze NIE jest zaimplementowane w pizzerii

```
models/          — Promotion, Store, Category, Product, Order
services/        — PromotionService, StoreService, CategoryService, ProductService, OrderService
controllers/     — PromotionController, StoreController, ...
routes/          — PromotionRoutes, StoreRoutes, ...
seeds/           — seed.ts (dane testowe)
```

### Kolejność implementacji

```
1. Model Promotion + PromotionService + PromotionController + PromotionRoutes
   → GET /api/promotions  ← odblokuje PromotionsGallery na frontendzie
2. Model Store + StoreService + StoreController + StoreRoutes
   → GET /api/stores?city=&street=  ← odblokuje DeliveryForm / PickupForm
3. Composition Root — podłączyć routery do app.ts
4. Seed — kategorie, produkty, promocje, lokale testowe
5. Model Category + Product + Order
```

---

## Frontend — `Majowy_Projekt/frontend` (port 3000)

### Stack
TanStack Start + React 19 + TanStack Router + Axios + Zod 4 + SCSS modules

### Co jest skonfigurowane

- `vite.config.ts` — proxy ustawiony (dodano w tej sesji):
  ```typescript
  '/api-auth' → http://localhost:5000  (refaktor — login, profil, adresy)
  '/api'      → http://localhost:5001  (pizzeria — menu, promocje, zamówienia)
  ```

### Co czeka na implementację (frontend)

| Komponent | Blokuje go | Status |
|---|---|---|
| Panel logowania — `useAuth`, `AuthProvider`, axios interceptor | `ACCESS_TOKEN_SECRET` refaktora | Do zrobienia |
| `PromotionsGallery` | `GET /api/promotions` (pizzeria) | Gotowy komponent, brak API |
| `DeliveryForm` submit | `GET /api/stores?city=&street=` | Gotowy komponent, brak API |
| `PickupForm` submit + mapa | `GET /api/stores/nearby?lat=&lng=` | Gotowy komponent, brak API |

### Jak działa auth na frontendzie (plan)

```
1. authClient.post('/api-auth/auth/login') → refaktor :5000
2. Refaktor zwraca: { accessToken } + httpOnly cookie (refresh token)
3. accessToken przechowywany in-memory (nie localStorage)
4. Każdy request do pizzerii: Authorization: Bearer <accessToken>
5. pizzeriaClient automatycznie dołącza token przez axios interceptor
```

---

## Jak uruchomić projekt lokalnie

```bash
# Terminal 1 — backend refaktor
cd C:\Users\brw\Desktop\refaktor_fullstack\backend
npm run dev   # → http://localhost:5000

# Terminal 2 — backend pizzeria
cd C:\Users\brw\Desktop\Majowy_Projekt\backend
npm run dev   # → http://localhost:5001

# Terminal 3 — frontend
cd C:\Users\brw\Desktop\Majowy_Projekt\frontend
npm run dev   # → http://localhost:3000
```

---

## Wzorzec kodu (obowiązuje w obu backendach)

```
Request
  └── Router (class-based, getRouter())
        └── Middleware (requireAuth → requirePermission)
              └── Controller (Zod validation, guard checks z named boolean, early return)
                    └── Service (logika biznesowa, MongoDB queries)
                          └── Mongoose Model
```

**Zasady niezmienne:**
- Nigdy `any`, nigdy `!` na `req.userId` / `req.sessionId`
- Warunki `if` zawsze w named variables (`isXxx`, `hasXxx`, `canXxx`)
- Guard check z early return w każdym handlerze
- Composition Root DI
- Nigdy auto-commit, nigdy `git add .`

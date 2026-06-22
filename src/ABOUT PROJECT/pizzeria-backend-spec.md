# Pizzeria Backend — Specyfikacja nowego repozytorium

> Dokument dla agenta AI. Wczytaj przed każdą sesją dotyczącą `pizzeria-backend`.
> Zawiera decyzje architektoniczne podjęte w sesji 2026-06-18, kontekst frontendu
> i pełną specyfikację nowego serwisu domenowego pizzerii.

---

## Kontekst — skąd ten projekt pochodzi

Projekt to system trzech serwisów:

| Serwis | Repo / Ścieżka | Port | Status |
|---|---|---|---|
| Frontend (TanStack Start) | `C:\Users\brw\Desktop\Majowy_Projekt\frontend` | 3000 | W budowie |
| Backend użytkowników | `C:\Users\brw\Desktop\refaktor_fullstack\backend` | 5000 | Gotowy |
| **Pizzeria backend** | **nowe repo** | **5001** | **Do stworzenia** |

Właściciel projektu buduje platformę multi-tenant: jeden system auth (`refaktor_fullstack`)
obsługuje wiele niezależnych serwisów domenowych (pizzeria, hotel, itd.).
Każdy serwis domenowy to osobne repozytorium z własną bazą, ale wspólnym JWT.

**Pizzeria backend NIE zajmuje się auth.** Całe logowanie, rejestracja, zarządzanie
userem i RBAC żyją w `refaktor_fullstack`. Pizzeria-backend tylko weryfikuje JWT
i operuje na domenie pizzerii.

---

## Decyzje architektoniczne (podjęte 2026-06-18)

### Stack — identyczny jak refaktor (świadoma decyzja)
```
Node.js + TypeScript 5.9 (strict, ESM — "module": "NodeNext")
Express 5
Mongoose 9
Zod 4
```
Wzorce DI, walidacji i obsługi błędów: 1:1 z refaktorem — właściciel zna te wzorce.

### Wspólny kod z refaktorem — kopiuj-wklej
Nie ma shared npm package. Pliki `common/` (errors, DTOs, validation, response types)
są kopiowane do pizzeria-backend i ewoluują niezależnie. Prosto, zero overhead.

### Baza danych — jeden Atlas cluster, osobna baza
```
refaktor:   mongodb+srv://...@cluster.mongodb.net/refaktor-db
pizzeria:   mongodb+srv://...@cluster.mongodb.net/pizzeria-db
```
Ten sam klaster MongoDB Atlas (jeden free tier), dwie oddzielne bazy.
Zero cross-contamination kolekcji, niezależny backup, możliwość osobnego skalowania.
`userId` w zamówieniach to zwykły `string` z JWT — nie `ref` do User w innej bazie.

### Integracja auth — shared JWT secret
```
JWT_SECRET=<identyczny w obu .env>
PIZZERIA_ORG_ID=<_id dokumentu Organisation z refaktor-db>
```
Pizzeria-backend weryfikuje JWT lokalnie (zero HTTP calls do refaktora per-request).
JWT payload (po zmianach w refaktorze) niesie:
```typescript
{
  userId: string,
  sessionId: string,
  organisationId: string,
  roles: string[],        // ['manager'] / ['customer'] / ['staff']
  permissions: string[]   // ['orders.read', 'menu.manage', ...]
}
```

### RBAC — centralnie w JWT, nie w pizzeria-backend
Pizzeria-backend **nie ma własnych tabel ról**. Czyta `permissions[]` z JWT.
Middleware `requirePermission('orders.read')` sprawdza tylko `req.permissions.includes(slug)`.
Zarządzanie rolami/permisami odbywa się w panelu refaktora.

**WAŻNE:** To wymaga ukończenia KROK 1 z `refaktor-next-steps.md` zanim
ten backend zostanie uruchomiony produkcyjnie. W fazie developmentu można
tymczasowo pominąć sprawdzanie permissions i dodać je później.

### Rejestracja klientów pizzerii
Frontend pizzerii wysyła przy rejestracji `organisationSlug: "pizzeria"` — zakodowane
w kliencie axios, niewidoczne dla użytkownika. Refaktor przypisuje org na podstawie slugu.
Szczegóły w `refaktor-next-steps.md` → KROK 2.

---

## Co jest już napisane na frontendzie (wymaga backendu)

### Gotowe komponenty czekające na API

| Komponent | Plik | Czeka na endpoint |
|---|---|---|
| `PromotionsGallery` | `src/pages/HomePage/components/PromotionsGallery/` | `GET /api/promotions` |
| `DeliveryForm` — submit | `src/pages/HomePage/components/OrderPanel/components/DeliveryForm/index.tsx:13` | `GET /api/stores?city=&street=` |
| `PickupForm` — submit | `src/pages/HomePage/components/OrderPanel/components/PickupForm/index.tsx:13` | `GET /api/stores?city=&street=` |
| `PickupForm` — mapa | jak wyżej | `GET /api/stores/nearby?lat=&lng=` |
| `OrderPanel` — greeting | `src/pages/HomePage/components/OrderPanel/index.tsx` | `useAuth()` → GET refaktor `/api/users/profile` |

### `useAuth` — aktualny stan (stub)
```typescript
// src/hooks/useAuth.ts — STUB, zwraca zawsze null
export const useAuth = (): { user: AuthUser | null } => {
  return { user: null }
}
```
Musi zostać zastąpiony prawdziwą implementacją z `AuthProvider` i axios do refaktora.
To jest praca po stronie **frontendu**, nie pizzeria-backend — ale blokuje greeting w OrderPanel.

### Hardcoded dane do zastąpienia
```typescript
// src/pages/HomePage/data.ts
// 6 slajdów z picsum.photos — do zastąpienia przez GET /api/promotions
```

### Priorytety frontendu (w kolejności odblokowania)
1. `GET /api/promotions` → odblokuje PromotionsGallery (łatwe, brak auth)
2. `GET /api/stores?city=&street=` → odblokuje submit formularzy w OrderPanel
3. Auth w frontendzie (praca przy refaktorze + frontend, nie pizzeria-backend)

---

## Architektura pizzeria-backend

### Wzorzec — identyczny z refaktorem
```
Request
  └── Express Router (class-based, getRouter())
        └── Middleware (requireAuth → requirePermission)
              └── Controller (Zod validation, guard checks, DTO mapping)
                    └── Service (logika biznesowa, MongoDB queries)
                          └── Mongoose Model
```

### Composition Root DI
```
src/config/container/
├── services.config.ts   — stałe z .env
├── services.ts          — instancje serwisów (dependency graph)
├── controllers.ts       — instancje kontrolerów
├── middleware.ts        — skonfigurowane middleware factories
├── routers.ts           — instancje routerów
└── index.ts             — re-export routerów + middleware
```

### Struktura katalogów
```
src/
├── config/
│   ├── db/                    — mongoose.connect()
│   └── container/             — Composition Root
├── controllers/
│   └── common/
│       ├── types.ts           — createSuccessResponse(), ErrorCodes
│       ├── errorHandler.ts    — handleControllerError()
│       ├── validation.ts      — validateRequest(schema, data, res)
│       └── schemas.ts         — mongoIdSchema, paginationSchema
├── errors/
│   ├── BaseError.ts
│   ├── NotFoundError.ts
│   ├── ConflictError.ts
│   ├── UnauthorizedError.ts
│   ├── ForbiddenError.ts
│   ├── ValidationError.ts
│   └── index.ts
├── middlewares/
│   ├── requireAuth.ts         — weryfikacja JWT + org check
│   └── requirePermission.ts   — sprawdza req.permissions[]
├── models/
│   ├── Promotion/
│   ├── Store/
│   ├── Category/
│   ├── Product/
│   └── Order/
├── services/
│   ├── TokenService/          — tylko verifyAccessToken (nie generuje tokenów)
│   ├── PromotionService/
│   ├── StoreService/
│   ├── CategoryService/
│   ├── ProductService/
│   └── OrderService/
├── routes/
│   ├── PromotionRoutes/
│   ├── StoreRoutes/
│   ├── CategoryRoutes/
│   ├── ProductRoutes/
│   └── OrderRoutes/
├── seeds/
│   └── seed.ts                — kategorie, przykładowe produkty, promocje, lokale
├── app.ts                     — express(), cors, cookieParser, middleware, routes
└── server.ts                  — import dotenv, connectDB, app.listen
```

---

## Modele Mongoose

### `Promotion`
```typescript
{
  title: string,                    // required
  description?: string,
  imageUrl: string,                 // required — URL do zdjęcia
  badge?: string,                   // np. "NOWOŚĆ", "HIT"
  discountType?: 'percent' | 'fixed',
  discountValue?: number,
  validFrom?: Date,
  validTo?: Date,
  isActive: boolean,                // default: true
  order: number,                    // kolejność wyświetlania w sliderze
  deletedAt?: Date,
}
// Indeksy: isActive, order, validTo
```

### `Store` (lokal/restauracja)
```typescript
{
  name: string,                     // required — "Pizzeria Centrum"
  address: {
    street: string,
    city: string,
    zipCode: string,
  },
  coordinates: {
    lat: number,
    lng: number,
  },
  phone?: string,
  email?: string,
  openingHours: {
    monday?: string,                // "10:00-22:00"
    tuesday?: string,
    // ... inne dni
  },
  isActive: boolean,                // default: true
  deletedAt?: Date,
}
// Indeksy: isActive, coordinates (2dsphere dla geo queries)
```

### `Category`
```typescript
{
  name: string,                     // "Pizze", "Napoje", "Desery"
  slug: string,                     // unique, lowercase
  imageUrl?: string,
  order: number,                    // kolejność w menu
  isActive: boolean,
  deletedAt?: Date,
}
```

### `Product`
```typescript
{
  name: string,                     // "Margherita"
  slug: string,                     // unique
  description?: string,
  categoryId: Types.ObjectId,       // ref: 'Category'
  variants: [{
    size: string,                   // "S" | "M" | "L" lub "330ml" | "500ml"
    price: number,                  // w groszach (integer) — unikaj float
  }],
  imageUrl?: string,
  ingredients?: string[],
  allergens?: string[],
  isActive: boolean,
  deletedAt?: Date,
}
// Indeksy: categoryId, isActive, slug
```

### `Order`
```typescript
{
  userId: string,                   // z JWT — string, NIE ObjectId (inna baza!)
  organisationId: string,           // z JWT — dla przyszłego filtrowania
  storeId: Types.ObjectId,          // ref: 'Store'
  type: 'delivery' | 'pickup',
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
  items: [{
    productId: Types.ObjectId,
    productName: string,            // snapshot — nie ref (cena/nazwa może się zmienić)
    variantSize: string,
    unitPrice: number,              // snapshot ceny w momencie zamówienia
    quantity: number,
  }],
  deliveryAddress?: {               // tylko gdy type: 'delivery'
    street: string,
    city: string,
    houseNumber: string,
    apartmentNumber?: string,
  },
  totalPrice: number,               // suma w groszach
  notes?: string,
  deletedAt?: Date,
}
// Indeksy: userId, storeId, status, createdAt
```

---

## Endpointy

### Publiczne (bez auth)

```
GET  /api/promotions                   — aktywne promocje, posortowane po order
GET  /api/categories                   — aktywne kategorie menu
GET  /api/products?categoryId=&slug=   — produkty per kategoria lub po slugu
GET  /api/stores?city=&street=         — lokale w danym mieście / ulicy (DeliveryForm submit)
GET  /api/stores/nearby?lat=&lng=&r=   — lokale w promieniu r km (PickupForm mapa)
GET  /api/stores/:id                   — szczegóły lokalu
```

### Wymagające auth (`requireAuth`)

```
GET  /api/orders                       — historia zamówień zalogowanego usera
POST /api/orders                       — złożenie zamówienia
GET  /api/orders/:id                   — szczegóły zamówienia (ownership guard)
```

### Wymagające auth + permission (`requirePermission`)

```
// menu.manage
POST   /api/promotions
PATCH  /api/promotions/:id
DELETE /api/promotions/:id

POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id

POST   /api/stores
PATCH  /api/stores/:id
DELETE /api/stores/:id

// orders.manage
GET    /api/orders/all                 — wszystkie zamówienia (panel staff/manager)
PATCH  /api/orders/:id/status          — zmiana statusu zamówienia
```

---

## Middleware `requireAuth` — implementacja

```typescript
// src/middlewares/requireAuth.ts
import { tokenService } from '../config/container';
import type { RequestHandler } from 'express';

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const hasNoBearer = !authHeader?.startsWith('Bearer ');

  if (hasNoBearer) {
    res.status(401).json(createErrorResponse('UNAUTHORIZED', 'No token provided'));
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = tokenService.verifyAccessToken(token);
  const isInvalidToken = !payload;

  if (isInvalidToken) {
    res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Invalid or expired token'));
    return;
  }

  const isWrongOrg = payload.organisationId !== process.env.PIZZERIA_ORG_ID;

  if (isWrongOrg) {
    res.status(403).json(createErrorResponse('FORBIDDEN', 'Not a pizzeria user'));
    return;
  }

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  req.organisationId = payload.organisationId;
  req.roles = payload.roles;
  req.permissions = payload.permissions;

  next();
};
```

**Uwaga:** `TokenService` w pizzeria-backend ma tylko `verifyAccessToken` — nie generuje tokenów.
`JWT_SECRET` musi być identyczny jak w refaktorze.

---

## `.env` pizzeria-backend

```env
PORT=5001
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/pizzeria-db
JWT_SECRET=<identyczny jak w refaktorze>
PIZZERIA_ORG_ID=<_id z kolekcji organisations w refaktor-db>
NODE_ENV=development
```

---

## Kolejność implementacji

```
FAZA 1 — Fundament
  1. Setup projektu (package.json, tsconfig.json, server.ts, app.ts, db/)
  2. Skopiuj z refaktora: src/errors/, src/controllers/common/
  3. TokenService (tylko verifyAccessToken — bez generateAccessToken)
  4. requireAuth middleware
  5. requirePermission middleware

FAZA 2 — Modele
  6. Promotion.model.ts
  7. Store.model.ts
  8. Category.model.ts
  9. Product.model.ts
  10. Order.model.ts

FAZA 3 — Publiczne endpointy (odblokowanie frontendu)
  11. PromotionService + PromotionController + PromotionRoutes
      → GET /api/promotions  ← odblokuje PromotionsGallery na froncie
  12. StoreService + StoreController + StoreRoutes
      → GET /api/stores?city=&street=  ← odblokuje DeliveryForm / PickupForm

FAZA 4 — Auth-gated endpointy
  13. CategoryService + CategoryController + CategoryRoutes
  14. ProductService + ProductController + ProductRoutes
  15. OrderService + OrderController + OrderRoutes

FAZA 5 — Composition Root
  16. src/config/container/ — sklejenie DI

FAZA 6 — Seed
  17. seed.ts — kilka kategorii, produktów, promocji, lokali testowych
```

---

## Zasady kodu (identyczne z refaktorem)

- Nigdy `any`, nigdy non-null `!` na `req.userId`
- Warunki `if` zawsze w named variables: `const isNotFound = !item`
- Guard check z early return w każdym handlerze
- Ceny zawsze w groszach (integer) — nigdy `float`
- `userId` w Order to `string` — NIE `Types.ObjectId` (inna baza MongoDB!)
- Snapshot cen i nazw produktów w items zamówienia — nie ref (dane mogą się zmienić)
- Nigdy auto-commit, nigdy `git add .`

---

## Powiązanie z frontendem — jak działa proxy Vite

```typescript
// vite.config.ts (do dodania w pizzeria-frontend)
proxy: {
  '/api-auth': {
    target: 'http://localhost:5000',
    rewrite: (path) => path.replace('/api-auth', '/api'),
  },
  '/api': {
    target: 'http://localhost:5001',
  },
}
```

```typescript
// src/api/client.ts (do stworzenia w frontendzie)
export const authClient = axios.create({ baseURL: '/api-auth' })    // → refaktor :5000
export const pizzeriaClient = axios.create({ baseURL: '/api' })     // → pizzeria :5001
```

Token z refaktora (access token) trafia jako `Authorization: Bearer <token>`
do obu klientów przez wspólny axios interceptor.

---

## Zależności między projektami — co musi być gotowe w refaktorze PRZED uruchomieniem

| Wymaganie | Gdzie opisane | Status |
|---|---|---|
| `organisationId` w JWT payload | `refaktor-next-steps.md` | ✅ Gotowe (2026-06-18) |
| `roles[]` i `permissions[]` w JWT | `refaktor-next-steps.md` → KROK 1 | ⏳ Do zrobienia |
| Rejestracja z `organisationSlug` | `refaktor-next-steps.md` → KROK 2 | ⏳ Do zrobienia |
| Organisation dla pizzerii w DB | ręcznie lub przez KROK 4 refaktora | ⏳ Do zrobienia |
| `PIZZERIA_ORG_ID` znane | po stworzeniu org w DB | ⏳ Do zrobienia |

**Minimalny start:** wystarczy ukończony KROK 1 + org pizzerii w DB + `PIZZERIA_ORG_ID` w `.env`.
Bez `roles[]`/`permissions[]` w JWT: `requirePermission` middleware tymczasowo pomija sprawdzanie.

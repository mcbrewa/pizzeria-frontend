# Multi-Backend Architecture — Pizzeria + Refaktor

> Dokument dla agenta AI. Wczytaj go przed każdą sesją dotyczącą integracji
> backendu zarządzania użytkownikami (refaktor) z backendem pizzerii (nowym).

---

## Kontekst projektu

Projekt składa się z **trzech serwisów**:

| Serwis | Lokalizacja | Port | Status |
|---|---|---|---|
| Frontend (TanStack Start) | `C:\Users\brw\Desktop\Majowy_Projekt\frontend` | 3000 | W budowie |
| Backend użytkowników | `C:\Users\brw\Desktop\refaktor_fullstack\backend` | 5000 | Gotowy |
| Backend pizzerii | *(do stworzenia)* | 5001 | Nie istnieje |

---

## Backend użytkowników — `refaktor_fullstack`

### Stack

Express 5 + Mongoose 9 + Zod 4 + TypeScript 5.9 (ESM), MongoDB.
Architektura: Composition Root DI, class-based controllers/services, factory middlewares.

### Co jest już zaimplementowane

| Feature | Endpointy | Status |
|---|---|---|
| JWT Auth (register, login, logout, refresh) | `POST /api/auth/*` | ✅ Gotowy |
| Multi-session (wiele urządzeń) | `POST /api/auth/logout*`, `GET /api/users/active-sessions` | ✅ Gotowy |
| OAuth — Google + GitHub | `GET /api/auth/google*`, `GET /api/auth/github*` | ✅ Gotowy |
| Weryfikacja email | `POST /api/auth/verify-email`, `resend-verification` | ✅ Gotowy |
| Reset hasła | `POST /api/auth/forgot-password`, `reset-password`, `change-password` | ✅ Gotowy |
| RBAC (role, permisje, hierarchia) | `GET/POST/PATCH/DELETE /api/roles*`, `/api/permissions*` | ✅ Gotowy |
| Zarządzanie userami (admin) | `GET/PATCH/DELETE /api/users*` | ✅ Gotowy |
| Profil usera (self-service) | `GET/PATCH /api/users/profile` | ✅ Gotowy |
| Adresy usera | `GET/POST/PATCH/DELETE /api/addresses*` | ✅ Gotowy |
| Admin Invitation Flow | `POST /api/users/invite`, `POST /api/auth/accept-invitation` | ✅ Gotowy |
| Organisation model + seed | `Organisation` model, `seed.ts` tworzy `mcbrewa` jako default org | ✅ Gotowy |

### Model User — kluczowe pola

```typescript
{
  email: string,
  passwordHash?: string,       // select: false
  firstName?: string,
  lastName?: string,
  phone?: string,
  status: 'active' | 'inactive' | 'banned' | 'pending_verification' | 'invited',
  oauthProviders: [{ provider: 'google'|'github', providerId: string }],
  organisationId: Types.ObjectId,   // REQUIRED — multi-tenant, ref: 'Organisation'
  deletedAt?: Date,                 // soft delete
}
```

### Model Organisation — kluczowe pola

```typescript
{
  name: string,
  slug: string,      // unique, lowercase
  isDefault: boolean,
  status: 'active' | 'inactive',
  deletedAt?: Date,
}
```

### JWT payload — aktualny kształt

```typescript
type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  organisationId: string;   // dodane 2026-06-18
};
```

**Mechanizm:** access token (short-lived, Bearer header) + refresh token (long-lived, httpOnly cookie).

---

## Zmiany wprowadzone 2026-06-18

> Te zmiany były potrzebne żeby pizzeria-backend mógł samodzielnie weryfikować
> przynależność usera do organizacji bez callbacku do refaktora per-request.

### 1. `src/services/TokenService/types.ts`

Dodano `organisationId: string` do `AccessTokenPayload` i sygnatury `ITokenService.generateAccessToken`.

### 2. `src/services/TokenService/index.ts`

Rozszerzono `generateAccessToken(userId, sessionId, organisationId)` — `organisationId` trafia do JWT payload.

### 3. `src/services/AuthService/index.ts`

- Prywatna metoda `generateTokens` — dodany parametr `organisationId`
- Prywatna metoda `createAuthenticatedSession` — dodany parametr `organisationId` (między `userId` a `deviceInfo`)
- Wszystkie 5 wywołań `createAuthenticatedSession` zaktualizowane: każde przekazuje `user.organisationId.toString()`
- `refreshTokens` — dodane `userService.getById(session.userId)` żeby pobrać `organisationId` przed `generateTokens`

### 4. `src/seeds/superadmin.seed.ts`

- Dodano import `Organisation`
- Lookup `defaultOrg` przed upsert usera
- Dodano `organisationId: defaultOrg._id` do `$set` — naprawia cichy bug (pole `required`, ale `findOneAndUpdate` bez `runValidators` go pomijało)

### Weryfikacja

Po tych zmianach: `npx tsc --noEmit` w katalogu backendu — **0 błędów**.

---

## Backend pizzerii — do stworzenia

### Cel

Serwis domenowy wyłącznie dla pizzerii. Nie duplikuje auth/user management —
polega na tokenach z `refaktor_fullstack`. Własna baza MongoDB.

### Stack (identyczny jak refaktor — znasz wzorce)

Express 5 + Mongoose 9 + Zod 4 + TypeScript 5.9 (ESM).
Ten sam DI pattern (Composition Root), te same common utils (błędy, DTOs, validation).

### Middleware `requireAuth` — jak działa w kontekście pizzerii

```typescript
// Pseudokod — ten sam pattern co w refaktorze
const payload = tokenService.verifyAccessToken(bearerToken);
// payload: { userId, sessionId, organisationId }

const isWrongOrg = payload.organisationId !== process.env.PIZZERIA_ORG_ID;
if (isWrongOrg) throw new ForbiddenError('Not a pizzeria user');

req.userId = payload.userId;
req.organisationId = payload.organisationId;
```

`PIZZERIA_ORG_ID` to `_id` dokumentu Organisation stworzego dla pizzerii w MongoDB refaktora.
Shared secret: oba backendy mają ten sam `JWT_SECRET` w `.env`.

### Modele do stworzenia

| Model | Pola (szkic) | Uwagi |
|---|---|---|
| `Category` | `name`, `slug`, `imageUrl`, `isActive` | np. Pizze, Napoje, Desery |
| `Product` | `name`, `slug`, `description`, `categoryId`, `variants: [{size, price}]`, `imageUrl`, `isActive` | Pizza ma rozmiary S/M/L |
| `Promotion` | `title`, `description`, `imageUrl`, `discountType`, `discountValue`, `validFrom`, `validTo`, `isActive` | Zastąpi hardcoded `data.ts` w froncie |
| `Store` | `name`, `address`, `city`, `coordinates: {lat, lng}`, `phone`, `openingHours`, `isActive` | Lokale — do wyszukiwania po adresie |
| `Order` | `userId`, `storeId`, `items: [{productId, variantId, qty, price}]`, `deliveryAddress?`, `type: 'delivery'|'pickup'`, `status`, `totalPrice` | `userId` z JWT, nie z User DB |

### Endpointy do stworzenia (priorytet)

```
GET  /api/promotions                    — lista aktywnych (frontend: PromotionsGallery)
GET  /api/categories                    — lista kategorii menu
GET  /api/products?categoryId=          — produkty per kategoria
GET  /api/stores?city=&street=          — wyszukiwanie lokali po adresie (DeliveryForm submit)
GET  /api/stores/nearby?lat=&lng=       — lokale na mapie (PickupForm)
POST /api/orders                        — złożenie zamówienia (wymaga auth)
GET  /api/orders                        — historia zamówień zalogowanego (wymaga auth)
```

---

## Integracja — jak frontend komunikuje się z oboma backendami

```typescript
// src/api/client.ts (do stworzenia)
export const authClient = axios.create({ baseURL: '/api-auth' })    // proxy → :5000
export const pizzeriaClient = axios.create({ baseURL: '/api' })     // proxy → :5001
```

Vite proxy (`vite.config.ts`):
```typescript
'/api-auth': { target: 'http://localhost:5000', rewrite: path => path.replace('/api-auth', '/api') },
'/api':      { target: 'http://localhost:5001' },
```

Token z refaktora trafia jako `Authorization: Bearer <token>` do obu klientów
przez wspólny interceptor axios.

---

## Kolejność dalszych prac

1. **Stworzenie Organisation dla pizzerii** w refaktorze — przez seed lub nowe `/api/organisations` routes
2. **Szkielet pizzeria-backend** — setup projektu (package.json, tsconfig, app.ts), Composition Root, skopiowane common utils z refaktora
3. **`requireAuth` w pizzeria-backend** — weryfikacja JWT (shared secret) + sprawdzenie `organisationId`
4. **Model + routes `Promotion`** — odblokuje PromotionsGallery na frontendzie (zastąpi hardcoded `data.ts`)
5. **Model + routes `Store`** — odblokuje submit DeliveryForm / PickupForm
6. **`src/api/` w frontendzie** — `authClient`, `pizzeriaClient`, `AuthProvider`, prawdziwy `useAuth`
7. **Modele + routes `Category`, `Product`** — strona menu
8. **Model + routes `Order`** — zamówienia

---

## Znany dług techniczny (refaktor)

| Problem | Plik | Priorytet |
|---|---|---|
| Brak CRUD routes dla Organisation | brak `OrganisationRoutes/` | Średni — potrzebny do zarządzania org pizzerii |
| Literówka folderu `UserAdressService` (jedno `d`) | `src/services/UserAdressService/` | Niski (breaking change przy rename) |
| `superadmin` nie miał `organisationId` | naprawione 2026-06-18 | ✅ Zamknięte |
| `books.*` permissions w seedzie — stara domena | `src/seeds/permissions.seed.ts` | Do decyzji |

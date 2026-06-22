# Refaktor Backend — Następne Kroki (kontekst dla agenta)

> Wczytaj ten plik przed każdą sesją dotyczącą `refaktor_fullstack` backendu.
> Zawiera pełny stan projektu po sesji 2026-06-18 i dokładną specyfikację
> tego co trzeba zaimplementować zanim powstanie pizzeria-backend.

---

## Lokalizacje projektów

| Projekt | Ścieżka |
|---|---|
| Refaktor backend | `C:\Users\brw\Desktop\refaktor_fullstack\backend\src` |
| Pizzeria frontend | `C:\Users\brw\Desktop\Majowy_Projekt\frontend` |
| Pizzeria backend | *(nowe repo — jeszcze nie istnieje)* |

---

## Stan refaktora po sesji 2026-06-18

### Co było zrobione wcześniej (gotowe, nie ruszaj)

Kompletny auth + user management starter kit:
- JWT auth (register, login, logout, refresh) — `AuthController`, `AuthService`
- Multi-session (wiele urządzeń) — `AuthSessionService`
- OAuth Google + GitHub — `OAuthController`, `OAuthProviderService`
- Weryfikacja email + reset hasła — `VerificationTokenService`, `EmailService`
- RBAC: role, permisje, hierarchia — `RoleService`, `PermissionService`, `RolePermissionService`, `UserRoleService`
- Zarządzanie userami (admin) — `UserManagementController`, `UserService`
- Profil usera (self-service) — `UserController`
- Adresy usera — `AddressController`, `UserAdressService` (literówka w nazwie folderu — `UserAdressService`, jedno `d`)
- Admin Invitation Flow — `InvitationService`, `InvitationController`
- Organisation model — `src/models/Organisation/Organisation.model.ts`
- Seedy: `seed.ts` (defaultOrg `mcbrewa`, role, permisje), `users.seed.ts`, `superadmin.seed.ts`

### Co zostało zmienione 2026-06-18

**Cel zmian:** JWT musi nieść `organisationId` żeby przyszły pizzeria-backend mógł weryfikować przynależność usera do organizacji bez callbacku do refaktora per-request.

**1. `src/services/TokenService/types.ts`**
```typescript
// Zmienione — dodano organisationId
export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  organisationId: string;   // NOWE
};
// + zaktualizowana sygnatura ITokenService.generateAccessToken
```

**2. `src/services/TokenService/index.ts`**
- `generateAccessToken(userId, sessionId, organisationId)` — dodany 3. parametr
- Walidacja `organisationId` przez `Validation.input(...).isString().isEmpty()`
- `organisationId` trafia do `jwt.sign` payload

**3. `src/services/AuthService/index.ts`**
- `createAuthenticatedSession(userId, organisationId, deviceInfo?)` — `organisationId` jako 2. parametr (przed `deviceInfo`)
- `generateTokens(userId, sessionId, organisationId)` — dodany 3. parametr
- 5 wywołań `createAuthenticatedSession` zaktualizowane: każde przekazuje `user.organisationId.toString()`
- `refreshTokens` — dodano `const user = await this.config.userService.getById(session.userId.toString())` żeby pobrać `organisationId` przed `generateTokens`

**4. `src/seeds/superadmin.seed.ts`**
- Dodano `import { Organisation }` 
- Lookup `defaultOrg` przed upsert usera
- Dodano `organisationId: defaultOrg._id` do `$set` — naprawa bugu (pole `required`, ale `findOneAndUpdate` bez `runValidators` pomijało walidację)

**Weryfikacja:** `npx tsc --noEmit` — 0 błędów.

---

## Co trzeba zaimplementować (w tej kolejności)

### KROK 1 — Org-aware RBAC (najważniejszy, zrób jako pierwszy)

**Kontekst decyzji:**
Właściciel projektu chce tworzyć wiele serwisów (pizzeria, hotel, itd.) na jednym systemie auth.
User może mieć różne role w różnych organizacjach: manager w pizzerii, customer w hotelu.
Przy migracji user → nowy serwis: wystarczy dodać `UserRole` z nowym `organisationId` w panelu refaktora.
Każdy serwis tylko czyta roles/permissions z JWT — zero callbacków do refaktora per-request.

**Problem z obecnym stanem:**
`UserRole` to `{ userId, roleId }` — rola jest globalna, niezwiązana z żadną org.
JWT niesie tylko `{ userId, sessionId, organisationId }` — brak ról/permisji w tokenie.

**Co zmienić:**

#### 1a. `src/models/UserRole/UserRole.model.ts`
Dodać pole `organisationId`, zmienić composite unique index:
```typescript
// Dodać pole:
organisationId: { type: Schema.Types.ObjectId, ref: 'Organisation', required: true }

// Zmienić unique index z:
{ userId: 1, roleId: 1 }
// na:
{ userId: 1, roleId: 1, organisationId: 1 }
```

#### 1b. `src/models/UserRole/types.ts`
Dodać `organisationId: Types.ObjectId` do interfejsu `IUserRoleData`.

#### 1c. `src/services/UserRoleService/index.ts`
Wszystkie metody muszą filtrować po `organisationId`:

```typescript
// Zmienić sygnatury:
getUserRoles(userId: string, organisationId: string): Promise<Role[]>
getUserPermissions(userId: string, organisationId: string): Promise<Permission[]>
hasPermission(userId: string, slug: string, organisationId: string): Promise<boolean>
assign(userId: string, roleId: string, assignedBy: string, organisationId: string): Promise<void>
remove(userId: string, roleId: string, organisationId: string): Promise<void>
canManageUser(managerId: string, targetUserId: string, organisationId: string): Promise<boolean>
canManageRole(userId: string, roleId: string, organisationId: string): Promise<boolean>
```

Wszystkie zapytania Mongoose dodają `{ organisationId }` do filtra.

#### 1d. `src/services/TokenService/types.ts`
Rozszerzyć `AccessTokenPayload`:
```typescript
export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  organisationId: string;
  roles: string[];        // NOWE — slugi ról, np. ['manager']
  permissions: string[];  // NOWE — slugi permisji, np. ['orders.read', 'menu.manage']
};
```

#### 1e. `src/services/TokenService/index.ts`
```typescript
generateAccessToken(
  userId: string,
  sessionId: string,
  organisationId: string,
  roles: string[],        // NOWE
  permissions: string[]   // NOWE
): string
```

#### 1f. `src/services/AuthService/index.ts`
W metodzie `createAuthenticatedSession` — przed wywołaniem `generateAccessToken` pobrać role i permisje:
```typescript
// Przed generateAccessToken:
const roles = await this.config.userRoleService.getUserRoles(userId, organisationId);
const permissions = await this.config.userRoleService.getUserPermissions(userId, organisationId);
const roleSlugs = roles.map(r => r.slug);
const permissionSlugs = permissions.map(p => p.slug);

// Przekazać do generateAccessToken:
this.config.tokenService.generateAccessToken(userId, sessionId, organisationId, roleSlugs, permissionSlugs);
```

#### 1g. `src/middlewares/requirePermission.ts`
Zamiast odpytywać DB per request — czytać z JWT:
```typescript
// Obecny sposób (DB lookup):
const hasPermission = await userRoleService.hasPermission(req.userId, slug);

// Nowy sposób (JWT claim):
const hasPermission = req.permissions?.includes(slug) ?? false;
```
`req.permissions` ustawiany przez `requireAuth` z payload JWT.

#### 1h. `src/middlewares/requireAuth.ts`
Po weryfikacji tokenu — ustawić `req.roles` i `req.permissions` z payload:
```typescript
req.userId = payload.userId;
req.sessionId = payload.sessionId;
req.organisationId = payload.organisationId;
req.roles = payload.roles;           // NOWE
req.permissions = payload.permissions; // NOWE
```
Zaktualizować Express `Request` type extension.

#### 1i. Migracja danych w bazie
Seed lub jednorazowy skrypt migracyjny:
```typescript
// Znaleźć wszystkich userów z rolami bez organisationId
// Przypisać im organisationId = defaultOrg._id (McBrewa)
await UserRole.updateMany(
  { organisationId: { $exists: false } },
  { $set: { organisationId: defaultOrg._id } }
);
```

#### 1j. Zaktualizować seedy
`seed.ts`, `users.seed.ts`, `superadmin.seed.ts` — przy przypisywaniu ról dodawać `organisationId`:
```typescript
await UserRole.findOneAndUpdate(
  { userId, roleId, organisationId },
  { userId, roleId, organisationId, assignedBy: userId },
  { upsert: true }
);
```

---

### KROK 2 — Rejestracja z `organisationSlug` (Opcja A1)

**Kontekst decyzji:**
Pizzeria-frontend przy rejestracji klienta wysyła `organisationSlug: "pizzeria"` w body.
Pole jest niewidoczne dla usera — zakodowane na sztywno po stronie klienta axios pizzerii.
Refaktor waliduje że org o tym slugu istnieje i jest `active`, przypisuje `organisationId`.
Jeśli `organisationSlug` nie podany → fallback na default org (backward compatible).

**Co zmienić:**

#### 2a. `src/controllers/AuthController/schemas.ts`
Dodać opcjonalne pole `organisationSlug` do `registerSchema`:
```typescript
organisationSlug: z.string().min(1).optional()
```

#### 2b. `src/services/AuthService/index.ts` — metoda `register`
```typescript
// Jeśli organisationSlug podany → znajdź org po slugu
// Jeśli nie podany → użyj defaultOrg (obecne zachowanie)

const org = data.organisationSlug
  ? await this.config.organisationService.getBySlug(data.organisationSlug)
  : await this.config.organisationService.getDefault();

const isOrgInactive = org.status !== 'active';
if (isOrgInactive) throw new ForbiddenError('Organisation is not active');
```

#### 2c. `src/services/OrganisationService/index.ts`
Dodać metodę `getBySlug(slug: string): Promise<Organisation>` (jeśli jeszcze nie ma).

---

### KROK 3 — Invitation flow z `organisationId`

**Kontekst decyzji:**
Aktualny `inviteUserSchema` ma tylko `{ email, roleId }` — brak `organisationId`.
Zaproszony user dostaje defaultową org zamiast org do której zaprasza admin.
Superadmin zapraszając pracownika do pizzerii musi móc wskazać org.

**Co zmienić:**

#### 3a. `src/controllers/InvitationController/schemas.ts`
```typescript
// Dodać pole:
organisationId: mongoIdSchema  // lub organisationSlug: z.string()
```

#### 3b. `src/services/InvitationService/index.ts`
Przekazać `organisationId` do `userService.createInvited(...)`.

#### 3c. `src/services/UserService/index.ts` — metoda `createInvited`
Upewnić się że przyjmuje i zapisuje `organisationId`.

---

### KROK 4 — Organisation CRUD routes (opcjonalnie, ale przydatne)

**Kontekst:**
Model `Organisation` istnieje, seedy tworzą defaultową org `mcbrewa`, ale nie ma żadnych
HTTP endpointów do zarządzania organizacjami. Żeby stworzyć org dla pizzerii trzeba
to robić ręcznie w MongoDB lub przez seed.

Minimalne endpointy:
```
GET    /api/organisations          — lista (admin)
POST   /api/organisations          — tworzenie nowej org (superadmin)
GET    /api/organisations/:slug    — szczegóły po slugu
PATCH  /api/organisations/:id      — edycja
```

Pliki do stworzenia:
```
src/services/OrganisationService/index.ts   — getAll, getBySlug, getDefault, create, update
src/services/OrganisationService/types.ts
src/controllers/OrganisationController/index.ts
src/controllers/OrganisationController/schemas.ts
src/routes/OrganisationRoutes/index.ts
```

---

## Architektura docelowa (przypomnienie)

```
refaktor_fullstack (port 5000)
  └── auth, users, RBAC, adresy, organisations
  └── JWT payload: { userId, sessionId, organisationId, roles[], permissions[] }
  └── shared JWT_SECRET

pizzeria-backend (port 5001) — nowe repo
  └── menu, promocje, zamówienia, lokale
  └── requireAuth: weryfikuje JWT (shared secret) + sprawdza organisationId
  └── requirePermission: czyta permissions[] z JWT (nie odpytuje DB)
  └── userId z JWT → powiązanie zamówień z userem (string, nie MongoDB ref)
  └── osobna baza: pizzeria-db (ten sam Atlas cluster co refaktor-db)

pizzeria-frontend (port 3000)
  └── authClient → proxy do :5000 (login, rejestracja, profil, adresy)
  └── pizzeriaClient → proxy do :5001 (menu, promocje, zamówienia)
  └── rejestracja wysyła organisationSlug: "pizzeria" (zakodowane w kliencie)
```

---

## Wzorzec kodu w refaktorze (przypomnij agentowi)

```
Request
  └── Express Router (class-based, getRouter())
        └── Middleware (requireAuth → requirePermission)
              └── Controller (Zod validation, guard checks z named boolean, early return)
                    └── Service (logika, MongoDB queries)
                          └── Mongoose Model
```

**Zasady niezmienne:**
- Nigdy `any`, nigdy non-null `!` na `req.userId`
- Warunki `if` zawsze w named variables (`isXxx`, `hasXxx`, `canXxx`)
- Guard check z early return w każdym handlerze
- Composition Root DI — serwisy/kontrolery przez konstruktor, nie globalny import
- `findOneAndUpdate` z `{ upsert: true }` — zawsze sprawdzaj czy potrzebujesz `runValidators: true`
- Nigdy auto-commit, nigdy `git add .`

---

## Znany dług techniczny

| Problem | Lokalizacja | Priorytet |
|---|---|---|
| Literówka folderu `UserAdressService` (jedno `d`) | `src/services/UserAdressService/` | Niski |
| `books.*` permissions w seedzie — stara domena | `src/seeds/permissions.seed.ts` | Do decyzji |
| Brak Organisation CRUD routes | brak `OrganisationRoutes/` | Średni (KROK 4) |
| `resend` w package.json — nieużywana zależność | `package.json` | Bardzo niski |

---

## Kolejność implementacji (podsumowanie)

```
KROK 1  Org-aware UserRole + roles/permissions w JWT     ← ZRÓB NAJPIERW
KROK 2  Rejestracja z organisationSlug (Opcja A1)
KROK 3  Invitation flow z organisationId
KROK 4  Organisation CRUD routes (opcjonalnie)
──────────────────────────────────────────────────────
        Dopiero po KROKACH 1-3: tworzenie pizzeria-backend
```

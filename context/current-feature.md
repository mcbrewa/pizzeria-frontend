# Current Feature

## Status
In Progress

## Goals

- Zbudować `LoginPanel` — czysty komponent kompozycyjny osadzony w `Header`
- `LoginPanel` składa się z 4 pod-komponentów: `LoginButton`, `LanguageSelector`, `FavoritesButton`, `CartButton`
- Pełna responsywność: desktop (2-rzędowy panel) ↔ mobile (tylko ikony w headerze, reszta w drawerze)
- Działający przełącznik języka PL/EN/DE przez `i18n.changeLanguage()`
- Zarejestrowanie namespace `header` w i18n

## Component tree

```
Header/
├── Logo/
├── HeaderList/
├── LoginPanel/                    ← NOWY
│   ├── index.tsx                  # kompozycja, zero logiki
│   ├── data.ts                    # LANGUAGES array
│   ├── types.ts
│   ├── style.module.scss          # grid 2-rzędowy, mobile layout
│   └── components/
│       ├── LoginButton/           # "ZALOGUJ SIĘ →" + ikona User → stub modal
│       │   ├── index.tsx
│       │   └── style.module.scss
│       ├── LanguageSelector/      # flaga + ChevronDown → dropdown PL/EN/DE
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── style.module.scss
│       ├── FavoritesButton/       # ikona Heart → href="#" (/menu/favorites — placeholder)
│       │   ├── index.tsx
│       │   └── style.module.scss
│       └── CartButton/            # ikona ShoppingBasket → href="#" (/cart — placeholder)
│           ├── index.tsx
│           └── style.module.scss
└── Hamburger/                     # rozbudowany o drawer z LoginButton + LanguageSelector
```

## Responsywność

| Element | Desktop (`md+`) | Mobile header | Mobile drawer |
|---|---|---|---|
| `LoginButton` | ✅ widoczny | ❌ ukryty CSS | ✅ reużyty w drawerze |
| `LanguageSelector` | ✅ widoczny | ❌ ukryty CSS | ✅ reużyty w drawerze (flagi) |
| `FavoritesButton` | ✅ widoczny | ✅ widoczny | ❌ |
| `CartButton` | ✅ widoczny | ✅ widoczny | ❌ |

Breakpoint graniczny: `$bp-md: 768px` (z `src/styles/_breakpoints.scss`)

Mobile header layout:
```
[ ≡ Hamburger ]  [ Logo ]  ————  [ 🤍 FavoritesButton ]  [ 🛒 CartButton ]
```

Desktop header layout:
```
[ Logo ]  [ HeaderList ]  ————  [ LoginPanel ]
                                  ┌──────────────────────────┐
                                  │ ZALOGUJ SIĘ → 👤 | 🇵🇱 ˅ │
                                  │         🤍      |  🛒    │
                                  └──────────────────────────┘
```

## Dane

```ts
// LoginPanel/data.ts
export const LANGUAGES = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
] as const
```

## i18n

- Namespace `header` zarejestrować w `src/lib/i18n.ts` (pliki `header.json` istnieją dla pl/en/de)
- Klucze do użycia: `header:login`, `header:actions.favorites`, `header:actions.cart`
- `LanguageSelector` — `i18n.changeLanguage(code)` + `i18n.language` do odczytu aktywnego języka

## Routing

- `FavoritesButton` → `href="#"` (route `/menu/favorites` — nie istnieje, placeholder)
- `CartButton` → `href="#"` (route `/cart` — nie istnieje, placeholder)
- `LoginButton` → stub, onClick: `() => {}` (modal — osobny task)

## Zasady niezmienne

- `LoginButton` i `LanguageSelector` reużyte w Hamburger drawerze — te same komponenty, nie duplikujemy JSX
- Ikony z `lucide-react`: `User`, `Heart`, `ShoppingBasket`, `ChevronDown`
- Flagi języków — emoji lub SVG (do ustalenia przy implementacji)
- Bez `any`, bez `as`, strict TypeScript

## History

- 2026-06-17 — zaplanowano feature na podstawie screenshotów `loginpanel.png` i `mobile_home_page.png`

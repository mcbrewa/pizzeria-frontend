# Coding Standards

## Struktura komponentów

Każdy komponent (globalny, per-page, layout) to folder z nazwą w PascalCase:

```
NazwaKomponentu/
├── index.tsx           # Logika i JSX komponentu
├── types.ts            # Typy i interfejsy (opcjonalnie)
├── data.ts             # Stałe, dane statyczne (opcjonalnie)
└── style.module.scss   # Style SCSS Modules (opcjonalnie)
```

Komponenty per-page → `src/pages/NazwaPage/components/` (NIE w globalnym `src/components/`)
Komponenty globalne → `src/components/` — tylko jeśli używane na 2+ stronach

### Kiedy rozbijać na sub-komponenty

Jeśli strona / komponent ma wiele wizualnych sekcji — każda sekcja to osobny komponent w `components/`:

```
HomePage/
├── index.tsx                    # tylko kompozycja (~15 linii)
├── style.module.scss            # tylko wrapper .page
├── data.ts                      # stałe: tablice, konfiguracje
└── components/
    ├── HeroSection/
    │   ├── index.tsx
    │   └── style.module.scss
    ├── FeaturesSection/
    │   ├── index.tsx
    │   └── style.module.scss
    └── LandingFooter/
        ├── index.tsx
        └── style.module.scss
```

**Zasady podziału:**
- `index.tsx` strony/komponentu = tylko kompozycja, import sub-komponentów, zero logiki UI
- Każda sekcja z własnym wyglądem → osobny komponent z własnym `style.module.scss`
- Stałe / dane statyczne (tablice, konfiguracje) → `data.ts`, nie inline w JSX
- Sub-komponenty NIE są reużywane globalnie — żyją w `components/` swojego rodzica

---

## Stylowanie

### Podejście: SCSS Modules (primary) + Tailwind (shadcn/ui only)

- **Własne komponenty, pages, layouts** → SCSS Modules (`style.module.scss`)
- **shadcn/ui komponenty** → Tailwind classes (przychodzą z biblioteką, nie modyfikujemy)
- **NIE mieszamy** — nie piszemy Tailwind classes w naszych komponentach, używamy SCSS Modules

### Mobile-first responsive design

Piszemy style **od mobile w górę** — bazowy CSS to mobile, media queries dodają style dla większych ekranów.

```scss
// DOBRZE — mobile-first
.container {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem;
  }
}

// ŹLE — desktop-first
.container {
  padding: 3rem;
  @media (max-width: 767px) { padding: 1rem; }
}
```

### Breakpoints

```scss
// Używamy ZAWSZE min-width (mobile-first), NIGDY max-width
$breakpoint-sm: 640px;    // Duży telefon (landscape)
$breakpoint-md: 768px;    // Tablet
$breakpoint-lg: 1024px;   // Desktop
$breakpoint-xl: 1280px;   // Duży desktop
$breakpoint-2xl: 1536px;  // Ultra-wide
```

### Kolorystyka

Korzystamy z CSS variables zdefiniowanych przez shadcn/ui w `styles.css` (format oklch).

```scss
// DOBRZE — CSS variables z shadcn theme
.card {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
}

.errorMessage {
  color: var(--destructive);
}

// ŹLE — hardcodowane kolory
.card {
  background-color: #1e293b;
  color: white;
}
```

**Dostępne CSS variables (light/dark):**

| Variable | Zastosowanie |
|---|---|
| `--background` / `--foreground` | Tło i tekst strony |
| `--card` / `--card-foreground` | Karty i panele |
| `--primary` / `--primary-foreground` | Główne akcje (buttony, linki) |
| `--secondary` / `--secondary-foreground` | Drugorzędne akcje |
| `--muted` / `--muted-foreground` | Wyciszone elementy, placeholder tekst |
| `--accent` / `--accent-foreground` | Hover, podświetlenia |
| `--destructive` | Błędy, usuwanie, ostrzeżenia |
| `--border` | Obramowania |
| `--input` | Obramowania inputów |
| `--ring` | Focus ring |

Transparentność: `color-mix(in oklch, var(--primary) 15%, transparent)`

### SCSS Modules konwencje

- Klasy w **camelCase**: `styles.headerWrapper`, `styles.navItem`
- Jeden `style.module.scss` per komponent
- Importy: `import styles from './style.module.scss'`
- Nesting max **3 poziomy** głębokości
- Nie używamy `!important`

---

## TypeScript

- Strict mode — `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- Bez `any` — używamy `unknown` lub właściwych typów
- Bez castowania `as` — zamiast tego używamy type guardów
- Typy per komponent w `types.ts`
- Alias importów: `@/` = `./src`

---

## Konwencje kodu

- **Komponenty:** zawsze funkcje strzałkowe (`const MyComponent = () => {}`)
- **DRY:** wspólna logika → hooki, utilsy, komponenty
- **Warunki:** wyciągamy do zmiennych o pozytywnej nazwie (`const isValid = ...`, `const hasPermission = ...`)
- **Małe funkcje:** single responsibility, czytelne nazwy
- **Routes:** cienkie — tylko routing, loader, meta. Bez logiki UI
- **Pages:** grube — cała logika strony, komponowanie z komponentów

### Prettier config

```js
// prettier.config.js
{ semi: false, singleQuote: true, trailingComma: 'all' }
```

Bez średników, single quotes, trailing commas.

### Komentarze

Domyślnie bez komentarzy. Dodajemy tylko gdy WHY jest nieoczywiste — ukryte ograniczenie, workaround dla konkretnego buga, nieintuicyjne zachowanie. Nigdy nie komentujemy WHAT (co robi kod) — dobre nazwy już to robią.

---

## i18n (react-i18next)

Projekt obsługuje 3 języki: `pl` (domyślny), `en`, `de`. Jeden namespace: `common`.

### Zasady

- **Każdy hardcoded string w UI wymaga tłumaczenia** — etykiety, aria-labels, placeholder, komunikaty, tekst przycisków
- Klucze dodawać do **wszystkich 3 plików** jednocześnie: `src/locales/pl/common.json`, `en/common.json`, `de/common.json`
- Struktury kluczy zagnieżdżamy per sekcja/komponent: `"gallery.prevButton"`, `"nav.contact"`, itd.

### Użycie

```tsx
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation('common')

  return (
    <button aria-label={t('gallery.prevButton')}>
      {t('actions.cart')}
    </button>
  )
}
```

Interpolacja zmiennych: `t('gallery.goToSlide', { n: i + 1 })` → klucz: `"goToSlide": "Przejdź do slajdu {{n}}"`.

### Co NIE wymaga tłumaczenia

- Treści danych dynamicznych (tytuły, opisy) pobieranych z API — API zwraca je per język
- Placeholder dane statyczne (`data.ts`) które zostaną zastąpione przez API

---

## Routing (TanStack Router — file-based)

| Plik | Route |
|---|---|
| `routes/__root.tsx` | Root wrapper (auth setup, context) |
| `routes/index.tsx` | `/` |
| `routes/dashboard/index.tsx` | `/dashboard` |
| `routes/dashboard/profile.tsx` | `/dashboard/profile` |
| `routes/dashboard/admin/users.tsx` | `/dashboard/admin/users` (layout route) |
| `routes/dashboard/admin/users.index.tsx` | `/dashboard/admin/users/` (index) |
| `routes/dashboard/admin/users.$userId.tsx` | `/dashboard/admin/users/:userId` |

Konwencje:
- `$param` — dynamiczny segment route
- `.index` suffix — index route
- Layout routes renderują `<Outlet />` zamiast treści strony

### Przykład route z loaderem i guardem

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requirePermission } from '@/lib/auth-guard'

export const Route = createFileRoute('/dashboard/admin/users')({
  beforeLoad: ({ context }) => {
    requirePermission({ context }, 'users.read')
  },
  component: () => <Outlet />,
})
```

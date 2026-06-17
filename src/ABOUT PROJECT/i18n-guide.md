# Przewodnik po internacjonalizacji (i18n)

> Praktyczny przewodnik oparty na implementacji w tym projekcie.
> Biblioteki: `i18next` + `react-i18next`

---

## Od czego zacząć — kolejność kroków

### Krok 1 — Zdecyduj gdzie trzymasz język

To najważniejsza decyzja architektury. Trzy opcje:

| Podejście | SSR | SEO | Skomplikowanie |
|---|---|---|---|
| **URL** (`/pl/dashboard`) | ✅ | ✅ | Wysokie — refaktor wszystkich routes |
| **Cookie** | ✅ | ❌ | Średnie — server function odczytuje cookie |
| **localStorage** | ❌ | ❌ | Niskie — ale hydration mismatch na SSR |

W tym projekcie używamy **cookie** — serwer odczytuje `lang` cookie przy każdym żądaniu i ustawia i18n przed renderowaniem.

### Krok 2 — Zainstaluj biblioteki

```bash
npm install i18next react-i18next
```

### Krok 3 — Zaprojektuj strukturę plików tłumaczeń

```
src/locales/
├── pl/
│   ├── common.json      ← nawigacja, stopka, przyciski (używane wszędzie)
│   ├── landing.json     ← landing page
│   ├── auth.json        ← login, register, błędy formularzy
│   └── dashboard.json   ← panel, profil, adresy
├── en/
│   └── (te same pliki)
└── de/
    └── (te same pliki)
```

**Zasada namespace'ów:** jeden plik per obszar aplikacji. Komponent importuje tylko namespace którego potrzebuje — nie ładuje wszystkich tłumaczeń naraz.

### Krok 4 — Zaprojektuj klucze tłumaczeń ZANIM napiszesz kod

Klucze to kontrakt między kodem a tłumaczem. Zmienianie ich po fakcie to ból.

```json
// DOBRZE — hierarchiczne, czytelne
{
  "nav": {
    "signIn": "Zaloguj się",
    "getStarted": "Zacznij"
  },
  "hero": {
    "title": "Zaprojektowane z myślą o bezpieczeństwie.",
    "cta": {
      "primary": "Zacznij",
      "github": "Zobacz na GitHub"
    }
  }
}

// ŹLE — płaskie, nieczytelne przy dużej ilości kluczy
{
  "navSignIn": "Zaloguj się",
  "navGetStarted": "Zacznij",
  "heroTitle": "Zaprojektowane..."
}
```

### Krok 5 — Skonfiguruj i18next (`src/lib/i18n.ts`)

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Importy statyczne — Vite bundluje je razem z aplikacją
import plCommon from '@/locales/pl/common.json'
import enCommon from '@/locales/en/common.json'

export const SUPPORTED_LANGUAGES = ['pl', 'en', 'de'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

// Guard: i18n to singleton — inicjalizuj tylko raz
const isInitialized = i18n.isInitialized

if (!isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'pl',          // domyślny język — nadpisywany przez root loader
    fallbackLng: 'pl',  // gdy brakuje klucza w aktualnym języku
    ns: ['common', 'landing'],
    defaultNS: 'common',
    resources: {
      pl: { common: plCommon },
      en: { common: enCommon },
    },
    interpolation: {
      escapeValue: false, // React już escapuje — bez tego dostaniesz &amp; zamiast &
    },
  })
}

export default i18n
```

**Dlaczego `isInitialized` guard?**
i18n to moduł-singleton. W SSR ten plik może być importowany wielokrotnie. Bez guardu próbujesz inicjalizować już zainicjalizowaną instancję, co rzuca błąd.

### Krok 6 — Server function do wykrywania języka

```typescript
// src/api/server-language.ts
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export const getServerLanguage = createServerFn({ method: 'GET' }).handler(
  (): Language => {
    const request = getRequest()

    // Priorytet 1: cookie ustawione przez użytkownika
    const cookieHeader = request.headers.get('cookie') ?? ''
    const langFromCookie = parseLangFromCookie(cookieHeader)
    if (langFromCookie) return langFromCookie

    // Priorytet 2: preferencje przeglądarki
    const acceptHeader = request.headers.get('accept-language') ?? ''
    const langFromAccept = parseLangFromAcceptHeader(acceptHeader)
    if (langFromAccept) return langFromAccept

    // Fallback
    return 'pl'
  },
)
```

### Krok 7 — Podepnij w root loader

```typescript
// routes/__root.tsx — beforeLoad
const [authState, language] = await Promise.all([
  getServerAuthState(),
  getServerLanguage(),   // równolegle z auth — zero narzutu czasowego
])
await i18n.changeLanguage(language)
// NIE zwracaj language z beforeLoad — i18n to singleton, nie potrzebuje kontekstu routera
```

### Krok 8 — Hook do zmiany języka

```typescript
// src/hooks/useLanguage.tsx
export function useLanguage() {
  const { i18n } = useTranslation()

  const rawLanguage = i18n.language
  const currentLanguage: Language = isLanguage(rawLanguage) ? rawLanguage : 'pl'

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
    // Cookie z 1-rocznym wygasaniem, SameSite=Lax dla bezpieczeństwa
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`
  }

  return { currentLanguage, changeLanguage }
}
```

### Krok 9 — Użyj w komponentach

```tsx
// Namespace 'common' (domyślny) — nie musisz go podawać
const { t } = useTranslation()
<button>{t('nav.signIn')}</button>

// Inny namespace
const { t } = useTranslation('landing')
<h1>{t('hero.title')}</h1>

// Namespace z poziomu komponentu który używa innego domyślnego
<span>{t('nav.goToDashboard', { ns: 'common' })}</span>
```

---

## Pułapki i jak ich unikać

### Pułapka 1 — Hydration mismatch na `<html>`

Serwer renderuje `<html>` bez klasy `.dark`, ale inline script dodaje ją przed hydratacją Reacta. React widzi różnicę i narzeka.

**Fix:** `suppressHydrationWarning` na `<html>` — mówi Reactowi "ten element celowo różni się między SSR a klientem".

```tsx
<html lang="pl" suppressHydrationWarning>
```

### Pułapka 2 — Zwracanie języka z `beforeLoad` jako context

```typescript
// ŹLE
return { user: ..., language }  // psuje router jeśli 'language' nie ma w RouterContext

// DOBRZE
await i18n.changeLanguage(language)
return { user: ... }  // i18n to singleton — nie potrzebuje kontekstu routera
```

### Pułapka 3 — `escapeValue: true` (domyślne)

i18next domyślnie escapuje wartości HTML. React też escapuje. Podwójne escapowanie daje `&amp;` zamiast `&` w tekście.

```typescript
interpolation: { escapeValue: false }  // zawsze w projekcie React
```

### Pułapka 4 — `as Language` zamiast type guarda

```typescript
// ŹLE
const lang = i18n.language as Language

// DOBRZE
const rawLanguage = i18n.language
const lang: Language = isLanguage(rawLanguage) ? rawLanguage : 'pl'
```

### Pułapka 5 — Hardcoded strings po inicjalnym wdrożeniu

Jeśli zostawisz część stringów hardcoded, tłumacz nie będzie wiedział co tłumaczyć. Grep po `"` w komponentach przed wydaniem nowego języka.

---

## Kiedy używać którego namespace'u

```
common   → elementy wspólne: nav, footer, przyciski, komunikaty błędów API
landing  → strona główna / marketing
auth     → login, register, forgot-password, verify-email
dashboard → panel główny, profil, adresy
admin    → zarządzanie userami, rolami, permissionami
```

Jeden komponent = jeden namespace. Wyjątek: komponent reużywalny w wielu sekcjach → `common`.

---

## Dodawanie nowego języka

1. Stwórz folder `src/locales/XX/` z kopiami wszystkich JSON
2. Przetłumacz wartości (nie klucze!)
3. Dodaj do `SUPPORTED_LANGUAGES` w `i18n.ts`
4. Dodaj import i wpis w `resources` w `i18n.ts`
5. Dodaj etykietę w `LanguageSwitcher` (`LANGUAGE_LABELS`)

Zero zmian w komponentach — wszystkie `t('klucz')` działają automatycznie.

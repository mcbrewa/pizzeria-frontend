# Frontend — Core Architecture Rules

---

## 1. Routing i Ładowanie Danych

**Thin Routes, Fat Pages**
Pliki routingu (`src/routes/`) są "chude" — odpowiadają wyłącznie za definicję ścieżki, guardy i loadery. Cała logika UI, stan i handlery żyją w komponentach stron (`src/pages/`).

**SSR-First**
Dane krytyczne dla SEO i pierwszego renderowania (listy produktów, profil) muszą być pobierane po stronie serwera (w loaderze). Cel: zero migających stanów ładowania przy pierwszym renderze.

**URL jako Źródło Prawdy**
Filtry, sortowanie i paginacja muszą być przechowywane w URL jako Search Params i walidowane przez Zod. Zapewnia to łatwe udostępnianie linków i spójność po odświeżeniu.

---

## 2. Zarządzanie Stanem

**Rozdzielenie Stanu**
- Stan serwerowy (dane z API) → frameworkowe loadery i TanStack Query
- Stan kliencki (UI, modale, koszyk) → Zustand, React Context lub `useState`

**Optimistic UI**
Przy interakcjach użytkownika (np. dodanie do koszyka) natychmiast aktualizuj UI zakładając sukces — synchronizację z serwerem wykonuj w tle.

**Backend to ostateczna instancja**
Wrażliwe kalkulacje (np. ostateczna cena) muszą być zawsze przeliczane i walidowane po stronie serwera w Server Functions. Nie ufaj wartościom z frontendu.

---

## 3. Bezpieczeństwo i Autoryzacja

**Bezpieczeństwo Tokenów**
- Access Token → pamięć aplikacji
- Refresh Token → cookie `httpOnly` (zakaz `localStorage` dla wrażliwych danych)

**Niewidzialny Refresh Sesji**
Aplikacja musi posiadać globalny interceptor HTTP do wychwytywania błędów `401`. Odświeżanie tokenu i ponawianie zablokowanych requestów odbywa się w tle — użytkownik nie może odczuć przerwy.

**Fail-Fast w Guardach**
Weryfikacja ról i uprawnień blokuje dostęp już na etapie routingu (`beforeLoad`), z natychmiastowym przekierowaniem na stronę błędu lub logowania.

---

## 4. Konwencje i Struktura Kodu

**Język kodu**
Cały kod, nazwy plików, zmiennych i klas CSS muszą być pisane **po angielsku**.

```scss
// ✅ Dobrze
.category-container { }

// ❌ Źle
.kontener-kategorii { }
```

**Architektura komponentów**
- Bazowe, reużywalne elementy UI (przyciski, inputy, tabele) → `src/components/ui/`
- Komponenty specyficzne dla strony → jak najbliżej niej, np. `src/pages/HomePage/components/`

**Spójność stylowania**
Używaj zmiennych CSS zdefiniowanych globalnie (`var(--primary)`, `var(--background)`). Stylowanie wyłącznie przez **SCSS Modules** — bez Tailwinda w komponentach.

```scss
// ✅ Dobrze — zmienne CSS
.link {
  color: var(--primary);
}

// ❌ Źle — hardcoded wartości
.link {
  color: #0077bd;
}
```

---

## 5. Responsywność

**Podejście: Mobile-First**
Style bazowe piszemy dla najmniejszego ekranu. Większe ekrany rozszerzamy przez `@include` mixinów z `min-width`.

```scss
// ✅ Dobrze — mobile first
.header {
  padding: 0 16px;      // mobile (domyślnie)

  @include lg {
    padding: 0 40px;    // desktop
  }
}

// ❌ Źle — desktop first
.header {
  padding: 0 40px;

  @media (max-width: 1024px) {
    padding: 0 16px;
  }
}
```

**Breakpointy — jedyne dopuszczalne wartości**

| Nazwa | `min-width` | Przeznaczenie |
|-------|-------------|---------------|
| `sm`  | `480px`     | Duże telefony / landscape |
| `md`  | `768px`     | Tablety |
| `lg`  | `1024px`    | Laptopy / małe deskopy |
| `xl`  | `1280px`    | Duże deskopy |

**Użycie w SCSS Modules**

Zawsze importuj przez `@use` z katalogu `src/styles/`:

```scss
@use 'breakpoints' as *;

.nav {
  display: none;

  @include lg {
    display: flex;
  }
}
```

Plik z definicjami mixinów: `src/styles/_breakpoints.scss`.
Konfiguracja Vite (`loadPaths`) sprawia, że `@use 'breakpoints'` działa globalnie bez względnych ścieżek.

**Zakaz własnych wartości `@media`**
Nie wolno pisać `@media (min-width: 900px)` bezpośrednio w plikach komponentów. Tylko mixiny z `_breakpoints.scss` — gwarantuje to spójność w całej aplikacji.

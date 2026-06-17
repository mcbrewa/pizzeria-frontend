# AI Interaction Guidelines

## Zasady komunikacji

- Zwięzła i bezpośrednia komunikacja
- Nieoczywiste decyzje techniczne — krótkie wyjaśnienie dlaczego
- **Zawsze pytaj przed implementacją** — nie pisz kodu bez potwierdzenia
- Zawsze pytaj przed dużymi refaktorami
- Nie dodawaj funkcjonalności poza spec — minimalne zmiany do realizacji zadania
- Nigdy nie usuwaj plików bez potwierdzenia
- Nie ruszaj niezwiązanego kodu przy okazji

## Workflow — nowy feature

1. **Dokumentuj** — opisz feature w `context/current-feature.md` zanim zaczniesz
2. **Pytaj** — potwierdź podejście z developerem
3. **Implementuj** — zgodnie ze specem i wzorcami projektu
4. **Zweryfikuj** — `npm run build` (TypeScript check) + manualna weryfikacja logiki
5. **Podaj komendy git** — gotowe do wklejenia, bez auto-commita
6. **Przenieś** — po zakończeniu skopiuj spec do `context/features/[nazwa].md`
7. **Wyczyść** — reset `current-feature.md` do template

## Workflow — fix / hotfix

1. Zidentyfikuj root cause — nie obchodź problemu
2. Minimalna zmiana — tylko to co trzeba
3. `npm run build` → podaj komendy git

## Git — konwencje

```bash
# Staging — konkretne pliki (nigdy git add .)
git add src/plik1.ts src/plik2.ts

# Commit
git commit -m "feat: krótki opis CO i DLACZEGO"
```

| Prefiks | Kiedy |
|---|---|
| `feat:` | nowa funkcjonalność |
| `fix:` | naprawa błędu |
| `refactor:` | zmiana bez zmiany zachowania |
| `chore:` | konfiguracja, zależności |

Zasady:
- Wiadomość po angielsku
- Jeden commit = jedna logiczna zmiana
- Nigdy auto-commit bez pytania
- Push tylko na wyraźną prośbę

## Code review — na co zwracać uwagę

| Obszar | Pytania kontrolne |
|---|---|
| Bezpieczeństwo | Auth guard? Permission guard? Walidacja inputu? |
| Spójność wzorców | Named boolean variables? toDto mapper? handleControllerError? |
| Logika | Edge cases? Soft delete filtrowany? Ownership sprawdzony? |
| Wydajność | N+1 queries? Aggregation zamiast wielu zapytań? |
| Typy | Brak `any`? Brak `as`? Narrowing zamiast asercji? |

## Priorytety podczas implementacji

1. **Poprawność** — funkcja działa zgodnie ze specem
2. **Bezpieczeństwo** — auth, validation, type safety
3. **Spójność** — wzorce jak reszta projektu
4. **Wydajność** — optymalizuj tylko gdy konieczne

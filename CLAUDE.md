# Refaktor Backend — AI Context

REST API: Express 5 + Mongoose 9 + Zod 4 + TypeScript 5.9

## Context files

Załaduj na początku każdej rozmowy:

| Plik | Zawartość |
|---|---|
| [context/project-overview.md](context/project-overview.md) | Architektura, stos, modele danych, znany dług techniczny |
| [context/coding-standards.md](context/coding-standards.md) | Konwencje kodu, struktura plików, walidacja, błędy, nazewnictwo |
| [context/ai-interaction.md](context/ai-interaction.md) | Workflow współpracy, git, code review |
| [context/current-feature.md](context/current-feature.md) | Bieżący feature — status, cele, historia |

## Feature specs (na żądanie)

| Plik | Opis |
|---|---|
| [context/features/backend-active-sessions.md](context/features/backend-active-sessions.md) | GET /api/users/active-sessions — aktywne sesje użytkowników |

## Skill commands

Wzorce implementacji dostępne jako skill commands w Claude Code:

- `/create-handler` — nowy handler/metoda kontrolera
- `/create-service` — nowy serwis (interface + implementacja)
- `/create-router` — nowy router (class-based, DI)
- `/create-model` — nowy model Mongoose
- `/feature` — zarządzanie workflow bieżącego feature'a

## Zasady niezmienne

- Zawsze pytaj przed implementacją — nie pisz kodu bez potwierdzenia
- Nigdy `any`, nigdy non-null `!` na `req.userId` / `req.sessionId`
- Warunki `if` zawsze w named variables (`isXxx`, `hasXxx`, `canXxx`)
- Guard check z early return w każdym handlerze
- Nigdy auto-commit, nigdy `git add .`

# task.md — Plan implementacji: „Jutro jem"

> **Dla agenta implementującego.** Czytasz ten plik jako punkt wejścia.
> Wykonuj zadania **w podanej kolejności** — wynika ona z zależności między komponentami.
> Do każdego kroku masz osobny plik szczegółowy w tym samym katalogu `plan/`.

---

## Kontekst projektu

Planer posiłków „Jutro jem" — aplikacja SPA działająca w całości w przeglądarce.
Brak kont, logowania i serwera aplikacyjnego. Plan w localStorage. Przepisy z plików Markdown.
**Cel MVP**: sprawdzić, czy mechanika wybierania jedzenia kartami jest przyjemna i użyteczna.

**Stack:** Astro 4 (static output) + Tailwind CSS 3 + Vanilla TypeScript (Islands)
Przepisy: Astro Content Collections (`.md` z YAML frontmatter + Zod schema)
Routing: Astro file-based + URLSearchParams dla dynamicznych dat
Interaktywność: Vanilla TS Islands (swipe cards, filtry, sloty, odhaczanie)

**Katalog roboczy: `/home/pilot/Projects/mokoszo/workdir`**
Cały kod aplikacji (Astro, komponenty, przepisy, testy) trafia tam — nie do katalogu nadrzędnego.
Repo GitHub: `git@github.com:mllukasik/mokoszo-v2.git`
GitHub Pages URL: `https://mllukasik.github.io/mokoszo-v2/`
`base` w `astro.config.mjs`: `/mokoszo-v2`

---

## Kolejność kroków implementacyjnych

### ETAP 0 — Fundament

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 0.1 | `01-setup.md` | Inicjalizacja projektu Vite + TS, struktura katalogów, zależności |
| 0.2 | `02-design-system.md` | CSS custom properties, typografia, resetowanie, komponenty bazowe |
| 0.3 | `03-data-model.md` | Interfejsy TypeScript: Recipe, Slot, DayPlan; schemat localStorage |
| 0.4 | `04-routing.md` | Hash router, nawigacja, powiązanie z paskiem dolnym |
| 0.5 | `05-recipes-content.md` | 10 przepisów w Markdown + słownik składników JSON |
| 0.6 | `06b-tests-setup.md` | **Vitest + Playwright — konfiguracja i pełny suite testów** |

### ETAP 1 — Sedno produktu (E-04, najwyższe ryzyko — zacznij tutaj)

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 1.1 | `06-e04-cards.md` | Ekran E-04: karta przepisu, gest swipe, przyciski decyzji, filtr slotu |
| 1.2 | *`npm run test && npm run test:e2e`* | Uruchom testy — muszą być zielone przed PR |

### ETAP 2 — Plan i zakupy (E-03, E-06)

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 2.1 | `07-e03-plan.md` | Ekran E-03: sloty dnia, wiele dań w slocie, suma kalorii, Q-10 |
| 2.2 | `08-e06-shopping.md` | Ekran E-06: lista zakupów, sumowanie, odhaczanie |

### ETAP 3 — Strona główna i katalog (E-09)

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 3.1 | `09-e09-home.md` | Ekran E-09: kafelki, filtry wielokrotne, wejście do kart, wstążka planu |

### ETAP 4 — Pozostałe ekrany

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 4.1 | `10-e07-settings.md` | Ekran E-07: ustawienia slotów, czyszczenie planu, info o zapisie |
| 4.2 | `11-e05-recipe.md` | Ekran E-05: strona przepisu pod własnym adresem |
| 4.3 | `12-e08-edge.md` | Ekran E-08: stany brzegowe (pusta pula, brak danych, offline) |

### ETAP 5 — Autodeploy

| Krok | Plik szczegółowy | Co robisz |
|------|-----------------|-----------|
| 5.1 | `13-deploy.md` | GitHub Actions workflow, GitHub Pages, konfiguracja base URL |

---

## Reguła dotycząca PR

> **Każdy krok = jeden PR.** Squash merge.
>
> **Przed otwarciem PR** uruchom obowiązkowo:
> ```bash
> npm run build          # Astro build bez błędów TypeScript
> npm run test           # Vitest — wszystkie unit testy zielone
> npm run test:e2e       # Playwright — wszystkie e2e zielone (Mobile + Desktop Chrome)
> ```
> **Nie otwieraj PR jeśli jakikolwiek z powyższych poleceń kończy się błędem.**
> Dla e2e możesz uruchomić tylko dotyczące bieżącego ekranu: `npx playwright test e2e/cards.spec.ts`

---

## Zasady, których nie łam

1. **Każdy gest ma bliźniaczy przycisk** (NFR-07) — swipe lewo = „Nie dziś", swipe prawo = „Biorę".
2. **Tylko polski** — żadnych angielskich tekstów w UI, żadnego lorem ipsum.
3. **Bez kont, awatarów, chmury** — cokolwiek sugeruje konto to błąd projektowy.
4. **Kolory tylko z tokenów** — plik `02-design-system.md` definiuje wszystkie, nie dodawaj nowych.
5. **Projektuj od 360 px** — mobile first, desktop to poszerzenie.
6. **Kalorie to informacja, nie ocena** — brak pasków postępu i kolorów sygnalizacyjnych przy kaloriach.
7. **Tryb wybierania (E-04) jest ciemny** (`--emalia-900`), reszta jasna (`--porcelana`).

---

## Definicja „gotowego" kroku

Krok jest gotowy gdy:
- [ ] `npm run build` kończy się bez błędów (TypeScript + Astro)
- [ ] `npm run test` — 0 failów (Vitest unit tests)
- [ ] `npm run test:e2e` — 0 failów na Mobile Chrome i Desktop Chrome
- [ ] Wszystkie stany opisane w pliku ekranu są zaimplementowane
- [ ] Kontrast tekst/tło przechodzi AA (możesz sprawdzić w DevTools)
- [ ] Cele dotykowe ≥ 48 × 48 px
- [ ] Nie ma `console.error` w przeglądarce
- [ ] Kolejność Tab jest logiczna
- [ ] PR otwarty, squash merged do `main`
- [ ] GitHub Actions pokazuje zielony build+test po merge

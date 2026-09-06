# 12 — E-08: Stany brzegowe

> Stany brzegowe implementuj razem z ekranem, do którego należą.
> Ten plik zbiera tylko te stany, które wymagają osobnej strony lub globalnego komponentu.

---

## 404 — strona nieznaleziona

Plik: **`src/pages/404.astro`**

```astro
---
import App from '../layouts/App.astro';
const base = import.meta.env.BASE_URL;
---

<App title="Strona nie istnieje — Jutro jem" currentNav="przepisy">
  <div class="max-w-[480px] mx-auto px-4 py-16 text-center">
    <p class="text-[64px] mb-4">🍽️</p>
    <h1 class="text-[24px] font-extrabold mb-3">Tej strony nie ma</h1>
    <p class="text-ink-2 mb-8">
      Adres przepisu mógł się zmienić — wróć na stronę główną i znajdź przepis tam.
    </p>
    <a
      href={`${base}/`}
      class="inline-flex items-center px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch"
    >
      Wróć do przepisów
    </a>
  </div>
</App>
```

---

## Stan: zapis localStorage niedostępny

Dodaj w `src/layouts/Base.astro` lub `App.astro` — sprawdzany na każdej stronie:

```astro
<script>
  // Sprawdź dostępność localStorage (prywatne okno, blokada)
  function isLocalStorageAvailable() {
    try {
      localStorage.setItem('__test', '1');
      localStorage.removeItem('__test');
      return true;
    } catch {
      return false;
    }
  }

  if (!isLocalStorageAvailable()) {
    const banner = document.createElement('div');
    banner.className = 'bg-nie-tint border-b border-nie px-4 py-3 text-[13px] text-nie font-medium text-center';
    banner.setAttribute('role', 'alert');
    banner.textContent = 'Plan nie może być zapisany — przeglądarka blokuje przechowywanie danych. Przeglądanie działa normalnie.';
    document.body.prepend(banner);
  }
</script>
```

---

## Lista 13 stanów brzegowych (z dokumentacji E-08)

Każdy stan jest obsłużony w ekranie, do którego należy.
Poniżej mapowanie gdzie szukać implementacji:

| Stan | Gdzie obsłużony |
|------|----------------|
| Pula kart wyczerpana z filtrem | `06-e04-cards.md` — `renderEmptyState()` z filtrem |
| Pula kart wyczerpana bez filtra | `06-e04-cards.md` — `renderEmptyState()` bez filtra |
| Slot już zajęty (dodanie kolejnego dania) | `06-e04-cards.md` — `acceptRecipe()` — informacja w potwierdzeniu |
| Nowa sesja — pula rusza od zera (Q-05) | `06-e04-cards.md` — brak persystencji historii odrzuceń |
| Przepis bez zdjęcia w E-04 | `06-e04-cards.md` — filtr `e.data.image` przy ładowaniu |
| Przepis bez zdjęcia w E-09 | `09-e09-home.md` — emoji zastępnik na kafelku |
| Wolna sieć / ładowanie zdjęcia | `06-e04-cards.md` — `loading="eager"` na bieżącej, `loading="lazy"` na następnej |
| Wejście do E-04 bez kontekstu slotu | `06-e04-cards.md` — alert i fallback |
| Brak planu na dzień (zakupy) | `08-e06-shopping.md` — `renderNoPlan()` |
| Wszystko odhaczone (zakupy) | `08-e06-shopping.md` — komunikat w renderUI |
| Składnik w dwóch jednostkach | `08-e06-shopping.md` — `mergeError` item |
| Brak sieci (zakupy) | `08-e06-shopping.md` — info na dole + lista działa offline |
| localStorage niedostępny | `Base.astro` — globalny banner (powyżej) |

---

## Stan: niepełna suma kalorii (US-06, R-06)

Wzorzec UI używany w E-03 i E-09:

```html
<!-- W nagłówku slotu lub sumie dnia -->
<span class="font-semibold text-ink">900 kcal</span>
<span class="text-kurkuma font-semibold text-[13px]">· suma niepełna ⚠</span>

<!-- Wyjaśnienie po kliknięciu / hover -->
<button
  class="text-[12px] text-kurkuma-tekst underline"
  aria-expanded="false"
  aria-controls="incomplete-explanation"
>
  Dlaczego?
</button>
<p id="incomplete-explanation" hidden class="text-[13px] text-ink-2 mt-1">
  Jeden składnik tego przepisu nie ma jeszcze podanej kaloryczności, więc suma jest zaniżona.
</p>
```

---

## Lista kontrolna E-08

- [ ] 404.astro istnieje i prowadzi do strony głównej
- [ ] Baner błędu localStorage na każdej stronie (gdy `localStorage` niedostępny)
- [ ] Stany puli wyczerpane w E-04 — oba warianty (z/bez filtra)
- [ ] Niepełna suma kalorii — oznaczona tekstowo, nie tylko kolorem
- [ ] Brak sieci w E-06 — lista działa, widoczna informacja
- [ ] Przepis bez zdjęcia — nie blokuje E-09, jest obsłużony gracefully

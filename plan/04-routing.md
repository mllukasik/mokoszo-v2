# 04 — Routing i nawigacja

## Strategia

Astro generuje statyczny HTML. GitHub Pages serwuje pliki statyczne.
Problem: dynamiczne URL-e jak `/plan/2026-09-05` nie istnieją jako pliki.

**Rozwiązanie: dedykowane strony `.astro` + parametry w URLSearchParams lub hash**

| Ekran | URL w specyfikacji | Implementacja w Astro |
|-------|-------------------|-----------------------|
| E-09 | `/` | `src/pages/index.astro` |
| E-03 | `/plan/2026-09-05` | `src/pages/plan.astro` + JS czyta URLSearchParams (`?date=2026-09-05`) |
| E-04 | `/wybieram?dzien=&slot=` | `src/pages/wybieram.astro` + JS czyta URLSearchParams |
| E-05 | `/przepis/zapiekanka-z-soczewica` | `src/pages/przepis/[slug].astro` (statyczne, `getStaticPaths`) |
| E-06 | `/zakupy?dzien=` | `src/pages/zakupy.astro` + JS czyta URLSearchParams |
| E-07 | `/ustawienia` | `src/pages/ustawienia.astro` |
| E-08 | stany brzegowe | `src/pages/404.astro` + renderowane inline |

> **Uwaga do URL-i**: specyfikacja zakłada `/plan/2026-09-05` (data w ścieżce).
> Dla statycznego hostingu GitHub Pages używamy `?date=2026-09-05` (query param).
> Zachowanie jest identyczne z perspektywy użytkownika — data jest widoczna w pasku adresu.

---

## src/pages/plan.astro — wzorzec strony z JS islands

```astro
---
import App from '../layouts/App.astro';
import SlotList from '../components/SlotList'; // Island — Vanilla TS
---

<App title="Plan dnia — Jutro jem" currentNav="plan">
  <!-- Dane przekazane do Island przez data-* lub JSON w script -->
  <SlotList client:load />
</App>

<script>
  // Ten skrypt działa w przeglądarce.
  // Astro Islands ładują się z client:load automatycznie.
</script>
```

---

## Jak przekazać dane przepisów do Islands

> Problem: przepisy są w Content Collections (build-time), ale Islands (Vanilla TS)
> działają po stronie klienta. Trzeba "przenieść" dane przez granicę.

**Rozwiązanie: wbudowanie danych jako JSON w stronie Astro**

```astro
---
// W pliku .astro (server/build side):
import { getCollection } from 'astro:content';

const allRecipes = await getCollection('recipes');
const recipesData = allRecipes.map(entry => ({
  slug: entry.slug,
  title: entry.data.title,
  image: entry.data.image,
  timeMinutes: entry.data.time_minutes,
  calories: entry.data.calories,
  slots: entry.data.slots,
  ingredients: entry.data.ingredients,
}));
---

<!-- Przekazanie danych do client-side JS -->
<script id="recipes-data" type="application/json" set:html={JSON.stringify(recipesData)} />
```

```typescript
// W Island / client-side script:
function getRecipesData() {
  const el = document.getElementById('recipes-data');
  if (!el) return [];
  return JSON.parse(el.textContent ?? '[]');
}
```

---

## src/pages/przepis/[slug].astro — statyczne generowanie stron przepisów

```astro
---
import { getCollection } from 'astro:content';
import App from '../../layouts/App.astro';

export async function getStaticPaths() {
  const entries = await getCollection('recipes');
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const { title, image, time_minutes, calories, slots, ingredients } = entry.data;
---

<App title={`${title} — Jutro jem`} currentNav="przepisy">
  <!-- Treść E-05 — patrz plik 11-e05-recipe.md -->
  <article>
    <h1>{title}</h1>
    <Content />
  </article>
</App>
```

---

## Nawigacja między stronami

Linki generowane przez Astro używają `base` z `astro.config.mjs`.
Użyj `import.meta.env.BASE_URL` zamiast hardcoded `/mokoszo-v2/`.

```astro
---
const base = import.meta.env.BASE_URL; // → '/mokoszo-v2'
---

<!-- Link do strony głównej -->
<a href={`${base}/`}>Przepisy</a>

<!-- Link do trybu wybierania z parametrami -->
<a href={`${base}/wybieram?date=${date}&slot=${slotId}`}>Wybierz przepis</a>

<!-- Link do przepisu -->
<a href={`${base}/przepis/${slug}`}>{title}</a>
```

W Islands (client-side TS):
```typescript
const base = (document.querySelector('meta[name="base-url"]') as HTMLMetaElement)?.content ?? '';
// Alternatywnie: wbuduj base URL jako JSON w stronie
```

Dodaj do `Base.astro`:
```html
<meta name="base-url" content={import.meta.env.BASE_URL} />
```

---

## Przycisk Wstecz / powrót z E-04 do E-03

Po zaplanowaniu przepisu w E-04, powrót do E-03:
```typescript
// W Island E-04 po akceptacji przepisu:
function navigateBackToPlan(date: string, slotId: string) {
  const base = getBaseUrl();
  // Dodaj hash żeby E-03 wiedziało, który slot podświetlić
  window.location.href = `${base}/plan?date=${date}#slot-${slotId}`;
}
```

W E-03 Island:
```typescript
// Na mount, sprawdź czy jest hash z ID slotu
const targetSlot = window.location.hash.replace('#slot-', '');
if (targetSlot) {
  const el = document.getElementById(`slot-${targetSlot}`);
  el?.scrollIntoView({ behavior: 'instant' });
  el?.classList.add('slot--just-updated'); // krótkie podświetlenie CSS
}
```

# 11 — E-05: Strona pojedynczego przepisu

> Statycznie generowana przez Astro z Content Collections.
> Ten sam przepis w dwóch kontekstach: karta E-04 i ta strona — jedna treść, dwa układy.

---

## Plik: `src/pages/przepis/[slug].astro`

```astro
---
import { getCollection, getEntry } from 'astro:content';
import App from '../../layouts/App.astro';
import type { SlotTag } from '../../types';
import { SLOT_LABELS } from '../../types';

export async function getStaticPaths() {
  const entries = await getCollection('recipes');
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const {
  title, image, time_minutes, calories, servings,
  slots, ingredients,
} = entry.data;

const base = import.meta.env.BASE_URL;
const slotLabels = slots.map((s: SlotTag) => SLOT_LABELS[s] ?? s).join(', ');
const caloriesPerServing = Math.round(calories / servings);
---

<App
  title={`${title} — Jutro jem`}
  currentNav="przepisy"
>
  <article class="max-w-[680px] mx-auto pb-10">

    <!-- Zdjęcie -->
    {image && (
      <div class="relative" style="aspect-ratio: 4/5; max-height: 480px; overflow: hidden;">
        <img
          src={image}
          alt={title}
          class="w-full h-full object-cover"
          loading="eager"
        />
        <!-- Gradient jak na karcie E-04 -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h1 class="text-[26px] font-extrabold leading-tight tracking-tight">{title}</h1>
        </div>
      </div>
    )}

    <!-- Tytuł (gdy brak zdjęcia) -->
    {!image && (
      <header class="bg-emalia-900 text-na-emalii px-5 py-8">
        <h1 class="text-[26px] font-extrabold leading-tight tracking-tight">{title}</h1>
      </header>
    )}

    <!-- Meta -->
    <div class="flex items-center gap-4 px-5 py-4 border-b border-kreska bg-biel">
      <div class="text-center">
        <p class="text-[20px] font-extrabold">{time_minutes}</p>
        <p class="text-[11px] text-ink-2 font-semibold">minut</p>
      </div>
      <div class="w-px h-8 bg-kreska"></div>
      <div class="text-center">
        <p class="text-[20px] font-extrabold">{caloriesPerServing}</p>
        <p class="text-[11px] text-ink-2 font-semibold">kcal / porcja</p>
      </div>
      <div class="w-px h-8 bg-kreska"></div>
      <div class="text-center">
        <p class="text-[20px] font-extrabold">{servings}</p>
        <p class="text-[11px] text-ink-2 font-semibold">porcje</p>
      </div>
      <div class="ml-auto text-right">
        <p class="text-[12.5px] text-ink-2">{slotLabels}</p>
      </div>
    </div>

    <!-- Składniki -->
    <section class="px-5 py-5 border-b border-kreska">
      <h2 class="text-[14px] font-bold text-ink-2 uppercase tracking-wide mb-3">Składniki</h2>
      <ul class="space-y-2">
        {ingredients.map((ing: { name: string; amount: number; unit: string }) => (
          <li class="flex justify-between text-[15px]">
            <span class="font-medium">{ing.name}</span>
            <span class="text-ink-2">{ing.amount} {ing.unit}</span>
          </li>
        ))}
      </ul>
    </section>

    <!-- Treść przepisu (Markdown) — font-prose (Source Serif 4) -->
    <section class="px-5 py-5 prose-recipe">
      <Content />
    </section>

    <!-- CTA: dodaj do planu -->
    <div class="px-5 py-4 border-t border-kreska">
      <a
        href={`${base}/wybieram?date=${new Date().toISOString().slice(0, 10)}`}
        class="flex items-center justify-center gap-2 w-full py-3.5 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch"
      >
        Wybieraj kartami — ten przepis też się tam pojawi
      </a>
    </div>
  </article>
</App>

<style>
  /* Typografia treści przepisu */
  .prose-recipe {
    font-family: var(--font-prose);
    font-size: 17px;
    line-height: 1.65;
    color: var(--ink);
  }
  .prose-recipe h2 {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: 700;
    color: var(--ink-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 24px 0 12px;
  }
  .prose-recipe ol {
    padding-left: 20px;
    margin: 0;
  }
  .prose-recipe li {
    margin-bottom: 10px;
  }
  .prose-recipe p {
    margin: 0 0 14px;
  }
</style>
```

---

## Lista kontrolna E-05

- [ ] Statycznie generowany dla każdego przepisu z Content Collections
- [ ] Zdjęcie 4:5 z gradientem i tytułem (jak karta E-04, ale pełna strona)
- [ ] Meta: czas, kcal/porcję, liczba porcji, tag slotu
- [ ] Lista składników z ilościami
- [ ] Treść Markdown renderowana w `font-prose` (Source Serif 4)
- [ ] CTA → tryb wybierania (pośrednio polecamy kartę zamiast bezpośredniego dodania)
- [ ] Strona dostępna pod własnym URL (`/przepis/[slug]`) — NFR-10
- [ ] `<title>` zawiera nazwę przepisu (SEO / NFR-10)
- [ ] `<meta description>` z krótkim opisem

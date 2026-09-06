# 08 — E-06: Lista zakupów

---

## Plik: `src/pages/zakupy.astro`

```astro
---
import { getCollection } from 'astro:content';
import App from '../layouts/App.astro';

const allRecipes = await getCollection('recipes');
const recipesJson = JSON.stringify(
  allRecipes.map(e => ({
    slug: e.slug,
    title: e.data.title,
    ingredients: e.data.ingredients,
  }))
);

import ingredientsData from '../data/ingredients.json';
const ingredientsJson = JSON.stringify(ingredientsData);

const base = import.meta.env.BASE_URL;
---

<App title="Lista zakupów — Jutro jem" currentNav="zakupy">
  <script id="all-recipes" type="application/json" set:html={recipesJson} />
  <script id="ingredients-data" type="application/json" set:html={ingredientsJson} />
  <script id="base-url" type="application/json" set:html={JSON.stringify(base)} />
  <div id="shopping-mount"></div>
</App>

<script src="../components/ShoppingList.ts"></script>
```

---

## Plik: `src/scripts/shopping-calc.ts`

```typescript
import type { DayPlan, ShoppingItem } from '../types';
import { SHOPPING_CATEGORIES } from '../data/slots';

interface RecipeIngredient {
  slug: string; name: string; amount: number; unit: string;
}

interface RecipeStub {
  slug: string; title: string; ingredients: RecipeIngredient[];
}

interface IngredientEntry {
  name: string; unit_default: string;
  calories_per_100g?: number; conversion_to_grams?: number;
  category: string;
}

type IngredientsDict = Record<string, IngredientEntry>;

export function buildShoppingList(
  plan: DayPlan,
  recipes: RecipeStub[],
  ingredientsDict: IngredientsDict
): ShoppingItem[] {
  // Zbierz wszystkie składniki ze wszystkich dań
  const itemsMap = new Map<string, ShoppingItem>();

  for (const slot of plan.slots) {
    for (const dish of slot.dishes) {
      const recipe = recipes.find(r => r.slug === dish.recipeSlug);
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const dictEntry = ingredientsDict[ing.slug];
        const existing = itemsMap.get(ing.slug);

        if (existing) {
          // Sprawdź zgodność jednostek
          if (existing.unit === ing.unit) {
            existing.totalAmount += ing.amount;
            existing.sources.push({ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit });
          } else {
            // Spróbuj konwersji na gramy
            const convertedExisting = toGrams(existing.totalAmount, existing.unit, dictEntry);
            const convertedNew = toGrams(ing.amount, ing.unit, dictEntry);

            if (convertedExisting !== null && convertedNew !== null) {
              existing.totalAmount = convertedExisting + convertedNew;
              existing.unit = 'g';
              existing.sources.push({ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit });
            } else {
              // Nie dało się zsumować — dwie osobne pozycje z mergeError
              const errorKey = `${ing.slug}__${ing.unit}`;
              const errorItem: ShoppingItem = {
                ingredientSlug: errorKey,
                name: ing.name,
                totalAmount: ing.amount,
                unit: ing.unit,
                category: dictEntry?.category ?? 'inne',
                sources: [{ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit }],
                checked: false,
                mergeError: true,
              };
              itemsMap.set(errorKey, errorItem);
            }
          }
        } else {
          itemsMap.set(ing.slug, {
            ingredientSlug: ing.slug,
            name: ing.name,
            totalAmount: ing.amount,
            unit: ing.unit,
            category: dictEntry?.category ?? 'inne',
            sources: [{ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit }],
            checked: false,
          });
        }
      }
    }
  }

  // Sortuj według kolejności kategorii zakupowych
  const items = Array.from(itemsMap.values());
  items.sort((a, b) => {
    const ai = SHOPPING_CATEGORIES.indexOf(a.category as any);
    const bi = SHOPPING_CATEGORIES.indexOf(b.category as any);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return items;
}

function toGrams(
  amount: number,
  unit: string,
  entry: IngredientEntry | undefined
): number | null {
  if (!entry) return null;
  if (unit === 'g') return amount;
  if (unit === 'szt' && entry.conversion_to_grams) {
    return amount * entry.conversion_to_grams;
  }
  return null;
}
```

---

## Plik: `src/components/ShoppingList.ts`

```typescript
import type { ShoppingItem, DayPlan } from '../types';
import { loadPlan } from '../scripts/store';
import { loadChecked, saveChecked } from '../scripts/store';
import { buildShoppingList } from '../scripts/shopping-calc';
import { SHOPPING_CATEGORY_LABELS } from '../data/slots';

let currentDate = '';
let items: ShoppingItem[] = [];
let checked: Record<string, boolean> = {};
let allRecipes: Array<{ slug: string; title: string; ingredients: Array<{ slug: string; name: string; amount: number; unit: string }> }> = [];
let ingredientsDict: Record<string, any> = {};

function init() {
  allRecipes = JSON.parse(document.getElementById('all-recipes')?.textContent ?? '[]');
  ingredientsDict = JSON.parse(document.getElementById('ingredients-data')?.textContent ?? '{}');

  const params = new URLSearchParams(window.location.search);
  currentDate = params.get('date') ?? new Date().toISOString().slice(0, 10);

  const plan = loadPlan(currentDate);

  if (!plan || plan.slots.every(s => s.dishes.length === 0)) {
    renderNoPlan();
    return;
  }

  items = buildShoppingList(plan, allRecipes, ingredientsDict);
  checked = loadChecked(currentDate);

  // Przywróć stan odhaczenia
  items = items.map(item => ({
    ...item,
    checked: checked[item.ingredientSlug] ?? false,
  }));

  renderUI();
}

function getBaseUrl(): string {
  return JSON.parse(document.getElementById('base-url')?.textContent ?? '""');
}

function renderNoPlan() {
  const mount = document.getElementById('shopping-mount');
  if (!mount) return;

  const dateFormatted = new Date(currentDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  mount.innerHTML = `
    <div class="max-w-[480px] mx-auto px-4 py-12 text-center">
      <p class="text-[18px] font-bold mb-3">Nic nie zaplanowano na ${dateFormatted}.</p>
      <p class="text-ink-2 mb-6">Zaplanuj posiłki, a lista zrobi się sama.</p>
      <a href="${getBaseUrl()}/plan?date=${currentDate}"
        class="inline-flex items-center px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
        Idź do planu
      </a>
    </div>
  `;
}

function renderUI() {
  const mount = document.getElementById('shopping-mount');
  if (!mount) return;

  const checkedCount = items.filter(i => i.checked).length;
  const total = items.length;
  const allDone = checkedCount === total && total > 0;

  const dateFormatted = new Date(currentDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  // Grupuj po kategorii
  const byCategory = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const cat = item.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);
  }

  mount.innerHTML = `
    <div class="max-w-[680px] mx-auto">
      <!-- Nagłówek — przyklejony -->
      <header class="sticky top-0 z-10 bg-biel border-b border-kreska px-4 py-3">
        <h1 class="font-extrabold text-[18px] tracking-tight">Zakupy na ${dateFormatted}</h1>
        <p class="text-[13px] text-ink-2 mt-0.5" aria-live="polite">
          ${allDone
            ? 'Wszystko odhaczone. Można wracać.'
            : `${checkedCount} z ${total} odhaczone`}
        </p>
      </header>

      ${allDone ? `
        <div class="px-4 py-4 bg-tak-tint text-tak font-semibold text-[14px]">
          ✓ Wszystko odhaczone. Można wracać.
        </div>
      ` : ''}

      <!-- Kategorie -->
      ${Array.from(byCategory.entries()).map(([cat, catItems]) => renderCategory(cat, catItems)).join('')}

      <!-- Brak sieci — info -->
      <div class="px-4 py-6 text-[13px] text-ink-2 border-t border-kreska mt-4">
        Lista działa bez internetu — dane są zapisane w tej przeglądarce.
      </div>
    </div>
  `;

  attachEvents();
}

function renderCategory(cat: string, catItems: ShoppingItem[]): string {
  const label = SHOPPING_CATEGORY_LABELS[cat] ?? cat;

  return `
    <section class="border-b border-kreska last:border-b-0">
      <h2 class="px-4 pt-4 pb-2 text-[12.5px] font-bold text-ink-2 uppercase tracking-wide">${label}</h2>
      <ul>
        ${catItems.map(item => renderItem(item)).join('')}
      </ul>
    </section>
  `;
}

function renderItem(item: ShoppingItem): string {
  const isChecked = item.checked;
  const hasMultipleSources = item.sources.length > 1;
  const amount = formatAmount(item.totalAmount, item.unit);

  return `
    <li class="border-t border-kreska first:border-t-0">
      <!-- Cel dotykowy — cały wiersz -->
      <label
        class="flex items-center gap-3 px-4 py-3 min-h-touch cursor-pointer hover:bg-porcelana active:bg-kreska select-none"
        ${item.mergeError ? 'title="Nie dało się zsumować — dwie różne jednostki bez przelicznika"' : ''}
      >
        <input
          type="checkbox"
          data-slug="${item.ingredientSlug}"
          ${isChecked ? 'checked' : ''}
          class="shopping-check w-5 h-5 rounded-s accent-tak cursor-pointer flex-shrink-0"
        />
        <span class="flex-1 ${isChecked ? 'line-through text-ink-3' : 'text-ink'} font-semibold text-[15px]">
          ${item.name}
          ${item.mergeError ? '<span class="text-[12px] text-kurkuma ml-1" aria-label="Błąd sumowania">⚠</span>' : ''}
        </span>
        <span class="text-[14px] ${isChecked ? 'text-ink-3' : 'text-ink-2'} font-medium flex-shrink-0">${amount}</span>
      </label>
      <!-- Rozwinięcie: skąd pochodzi ilość (FR-13 ochrona przed Z-01) -->
      ${hasMultipleSources ? `
        <details class="px-4 pb-2">
          <summary class="text-[12.5px] text-ink-2 cursor-pointer list-none hover:text-ink">
            ▸ z ${item.sources.length} przepisów
          </summary>
          <ul class="pl-3 pt-1 space-y-0.5">
            ${item.sources.map(src => `
              <li class="text-[12.5px] text-ink-2">
                z ${src.recipeTitle}: ${formatAmount(src.amount, src.unit)}
              </li>
            `).join('')}
          </ul>
        </details>
      ` : `
        <p class="px-4 pb-2 text-[12px] text-ink-3">z ${item.sources[0].recipeTitle}</p>
      `}
      ${item.mergeError ? `
        <p class="px-4 pb-2 text-[12px] text-kurkuma-tekst">
          Tego składnika nie dało się zsumować — dwie różne jednostki bez przelicznika w słowniku.
        </p>
      ` : ''}
    </li>
  `;
}

function formatAmount(amount: number, unit: string): string {
  const rounded = Math.round(amount * 10) / 10;
  return `${rounded} ${unit}`;
}

function attachEvents() {
  document.querySelectorAll('.shopping-check').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const slug = (checkbox as HTMLInputElement).dataset.slug!;
      const isChecked = (checkbox as HTMLInputElement).checked;

      checked[slug] = isChecked;
      saveChecked(currentDate, checked);

      // Zaktualizuj item
      const item = items.find(i => i.ingredientSlug === slug);
      if (item) item.checked = isChecked;

      // Zero animacji (specyfikacja E-06: sklep = szybkość)
      renderUI();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
```

## Dopełnij `src/data/slots.ts`

```typescript
export const SHOPPING_CATEGORY_LABELS: Record<string, string> = {
  'warzywa-owoce': 'Warzywa i owoce',
  'nabial': 'Nabiał',
  'mieso-ryby': 'Mięso i ryby',
  'suche-produkty': 'Produkty suche',
  'pieczywo': 'Pieczywo',
  'przyprawy': 'Przyprawy',
  'inne': 'Pozostałe',
};
```

---

## Lista kontrolna E-06

- [ ] Nagłówek z datą przyklejony (`sticky`) przy przewijaniu
- [ ] Licznik „X z Y odhaczone" z `aria-live="polite"`
- [ ] Skupiska po kategorii zakupowej (kolejność jak w słowniku)
- [ ] Cały wiersz jest celem dotykowym min. 48px (label wraps input)
- [ ] Odhaczony element — przekreślony, szary — zostaje na miejscu
- [ ] Zero animacji przy odhaczaniu (sklep = szybkość)
- [ ] Rozwinięcie „z N przepisów" — widoczne skąd pochodzi ilość (Z-01)
- [ ] Stan: brak planu — informacja z CTA do planu
- [ ] Stan: wszystko odhaczone — krótki komunikat bez konfetti
- [ ] Stan: składnik w dwóch jednostkach — dwie pozycje z oznaczeniem ⚠
- [ ] Bez sieci: ekran działa (localStorage), info na dole strony
- [ ] Odhaczenie przeżywa odświeżenie strony
- [ ] Responsywne: ≥900px dwie kolumny kategorii
- [ ] Pełna szerokość i max kontrast: atrament na bieli (E-06 projektujemy pod sklepowe światło)

import type { ShoppingItem } from '../types';
import { loadPlan } from '../scripts/store';
import { loadChecked, saveChecked } from '../scripts/store';
import { buildShoppingList } from '../scripts/shopping-calc';
import { SHOPPING_CATEGORY_LABELS } from '../data/slots';

let currentDate = '';
let items: ShoppingItem[] = [];
let checked: Record<string, boolean> = {};
let allRecipes: Array<{ slug: string; title: string; ingredients: Array<{ slug: string; name: string; amount: number; unit: string }> }> = [];
let ingredientsDict: Record<string, {
  name: string; unit_default: string;
  calories_per_100g?: number; conversion_to_grams?: number;
  category: string;
}> = {};
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

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
  const raw = document.getElementById('base-url')?.textContent ?? '""';
  try {
    return (JSON.parse(raw) as string).replace(/\/$/, '');
  } catch {
    return '';
  }
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
    <div class="max-w-[680px] mx-auto min-[900px]:max-w-[960px]">
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

      <!-- Kategorie — od 900px dwie kolumny -->
      <div class="min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:gap-x-6">
        ${Array.from(byCategory.entries()).map(([cat, catItems]) => renderCategory(cat, catItems)).join('')}
      </div>

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
    checkbox.addEventListener('change', () => {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

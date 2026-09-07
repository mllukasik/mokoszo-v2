import type { SlotTag, DayPlan } from '../types';
import { SLOT_LABELS } from '../types';
import {
  loadPlan,
  addDishToSlot,
  createEmptyPlan,
  loadSettings,
  savePlan,
  saveSettings,
} from '../scripts/store';

interface RecipeStub {
  slug: string;
  title: string;
  image?: string | null;
  timeMinutes: number;
  calories: number;
  slots: SlotTag[];
}

// ——— Stan ———
let allRecipes: RecipeStub[] = [];
let activeSlotFilters: Set<SlotTag> = new Set();
let activeTimeFilter: number | null = null; // null = brak, 20 / 45
let plan: DayPlan | null = null;
let todayDate = '';
let seenLocalStorageNotice = false;

const SLOT_ORDER: SlotTag[] = [
  'sniadanie',
  'drugie-sniadanie',
  'obiad',
  'kolacja',
  'deser',
];

/** Odmiana do komunikatów: „dodany do obiadu”, „masz to w obiedzie”. */
const SLOT_DOPELNIACZ: Record<SlotTag, string> = {
  'sniadanie': 'śniadania',
  'drugie-sniadanie': 'drugiego śniadania',
  'obiad': 'obiadu',
  'kolacja': 'kolacji',
  'deser': 'deseru',
};

const SLOT_MIEJSCOWNIK: Record<SlotTag, string> = {
  'sniadanie': 'śniadaniu',
  'drugie-sniadanie': 'drugim śniadaniu',
  'obiad': 'obiedzie',
  'kolacja': 'kolacji',
  'deser': 'deserze',
};

function isSlotTag(value: string): value is SlotTag {
  return (SLOT_ORDER as string[]).includes(value);
}

// ——— Init ———

function init() {
  try {
    allRecipes = JSON.parse(
      document.getElementById('all-recipes')?.textContent ?? '[]',
    );
  } catch {
    allRecipes = [];
  }
  const now = new Date();
  todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Odczytaj filtry z URLSearchParams (Q-09: filtry w adresie)
  readFiltersFromUrl();

  // Plan (na dziś)
  plan = loadPlan(todayDate);

  // Czy już widziano komunikat o localStorage
  seenLocalStorageNotice = loadSettings().seenLocalStorageNotice;

  renderUI();
}

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  activeSlotFilters = new Set();
  // Wspieramy ?slot=obiad,deser oraz powtórzone ?slot=obiad&slot=deser
  params
    .getAll('slot')
    .flatMap((v) => v.split(','))
    .map((s) => s.trim())
    .filter(isSlotTag)
    .forEach((s) => activeSlotFilters.add(s));
  const timeParam = params.get('czas');
  activeTimeFilter =
    timeParam !== null && /^\d+$/.test(timeParam) ? Number(timeParam) : null;
}

function getBaseUrl(): string {
  try {
    const raw = document.getElementById('base-url')?.textContent;
    if (raw && raw.trim()) return (JSON.parse(raw) as string).replace(/\/$/, '');
  } catch {
    /* spadek do meta */
  }
  const meta = document.querySelector('meta[name="base-url"]') as HTMLMetaElement | null;
  if (meta?.content) return meta.content.replace(/\/$/, '');
  return '';
}

// ——— Filtrowanie (Q-09) ———

function getFilteredRecipes(): RecipeStub[] {
  let result = [...allRecipes];

  // W obrębie grupy posiłków — suma (OR)
  if (activeSlotFilters.size > 0) {
    result = result.filter((r) => r.slots.some((s) => activeSlotFilters.has(s)));
  }

  // Między grupami — zawężenie (AND)
  if (activeTimeFilter !== null) {
    result = result.filter((r) => r.timeMinutes <= (activeTimeFilter as number));
  }

  return result;
}

function toggleSlotFilter(slot: SlotTag) {
  if (activeSlotFilters.has(slot)) {
    activeSlotFilters.delete(slot);
  } else {
    activeSlotFilters.add(slot);
  }
  updateUrlParams();
  renderUI();
}

function setTimeFilter(minutes: number | null) {
  activeTimeFilter = minutes;
  updateUrlParams();
  renderUI();
}

function clearAllFilters() {
  activeSlotFilters.clear();
  activeTimeFilter = null;
  updateUrlParams();
  renderUI();
}

function updateUrlParams() {
  const url = new URL(window.location.href);
  if (activeSlotFilters.size > 0) {
    url.searchParams.set('slot', Array.from(activeSlotFilters).join(','));
  } else {
    url.searchParams.delete('slot');
  }
  if (activeTimeFilter !== null) {
    url.searchParams.set('czas', String(activeTimeFilter));
  } else {
    url.searchParams.delete('czas');
  }
  // Bez przeładowania — history.pushState (wstecz cofa filtr, nie wyrzuca ze strony)
  window.history.pushState({}, '', url.toString());
}

// ——— Renderowanie ———

function renderUI() {
  const mount = document.getElementById('home-mount');
  if (!mount) return;

  const filtered = getFilteredRecipes();
  const total = allRecipes.length;
  const hasActiveFilters = activeSlotFilters.size > 0 || activeTimeFilter !== null;

  mount.innerHTML = `
    <div class="max-w-[900px] mx-auto">

      <!-- Nagłówek -->
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <p class="text-kurkuma text-[12.5px] font-bold mb-1">Jutro jem</p>
        <h1 class="text-[28px] font-extrabold tracking-tight">Przepisy</h1>
      </header>

      <!-- Komunikat o localStorage (pierwsze wejście) -->
      ${
        !seenLocalStorageNotice
          ? `
        <div id="localstorage-notice"
          class="mx-4 mt-4 bg-kurkuma-tint border-l-4 border-kurkuma rounded-r-m p-4 flex items-start justify-between gap-3">
          <p class="text-[14px] text-ink">
            <strong>Plan zostaje w tej przeglądarce.</strong> Nie ma konta, więc nie zobaczysz go
            na innym urządzeniu — a wyczyszczenie danych przeglądarki usuwa go bez śladu.
          </p>
          <button id="btn-close-notice" type="button" aria-label="Zamknij komunikat"
            class="text-ink-2 min-h-touch min-w-touch w-12 flex-shrink-0 flex items-center justify-center text-lg">✕</button>
        </div>
      `
          : ''
      }

      <!-- Wstążka planu (gdy coś zaplanowane) -->
      ${renderPlanBanner()}

      <!-- Filtry (sticky) -->
      <div class="sticky top-0 z-10 bg-porcelana border-b border-kreska">
        ${renderFilters()}
        ${hasActiveFilters ? renderActiveFilters(filtered.length, total) : ''}
      </div>

      <!-- Lista przepisów -->
      ${filtered.length > 0 ? renderRecipeGrid(filtered) : renderEmptyFilters()}

      <!-- Wejście do kart — równorzędne (Q-08) -->
      ${renderCardsEntry()}

      <!-- Koniec listy -->
      ${
        filtered.length === total && total > 0
          ? `
        <p class="text-center text-[13px] text-ink-2 py-6 px-4">
          To wszystkie ${total} przepisów. Nowe pojawiają się po publikacji przez redakcję.
        </p>
      `
          : ''
      }
    </div>
  `;

  attachEvents();
}

function renderPlanBanner(): string {
  if (!plan) return '';
  const filledSlots = plan.slots.filter((s) => s.dishes.length > 0).length;
  const totalSlots = plan.slots.length;
  if (filledSlots === 0) return '';

  const dateLabel = new Date(`${plan.date}T12:00:00`).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const emptySlots = plan.slots
    .filter((s) => s.dishes.length === 0)
    .map((s) => SLOT_LABELS[s.name])
    .join(', ');

  return `
    <a href="${getBaseUrl()}/plan?date=${plan.date}"
      class="flex items-center justify-between gap-3 px-4 py-3 bg-biel border-b border-kreska text-[14px] text-ink hover:bg-porcelana min-h-touch">
      <div>
        <strong>Plan na ${dateLabel}:</strong> ${filledSlots} z ${totalSlots} posiłków
        ${emptySlots ? `<span class="text-ink-2"> · ${emptySlots} puste</span>` : ''}
      </div>
      <span class="text-emalia-500 text-[12px] font-semibold" aria-hidden="true">→</span>
    </a>
  `;
}

function renderFilters(): string {
  const timeOptions = [
    { label: 'do 20 min', value: 20 },
    { label: 'do 45 min', value: 45 },
  ];

  return `
    <div class="px-4 py-3 space-y-2">
      <!-- Filtry posiłku (wielokrotny wybór - OR) -->
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtruj po posiłku">
        ${SLOT_ORDER.map(
          (slot) => `
          <button
            type="button"
            data-slot-filter="${slot}"
            class="slot-filter-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border min-h-[36px] transition-colors
              ${
                activeSlotFilters.has(slot)
                  ? 'bg-emalia-900 text-na-emalii border-emalia-900'
                  : 'bg-biel text-ink border-kreska hover:border-ink'
              }"
            aria-pressed="${activeSlotFilters.has(slot)}"
          >
            ${SLOT_LABELS[slot]}
          </button>
        `,
        ).join('')}
      </div>

      <!-- Filtr czasu (pojedynczy wybór - AND z posiłkami) -->
      <!-- Ukryty gdy baza < 20 przepisów (Q-01) -->
      ${
        allRecipes.length >= 20
          ? `
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filtruj po czasie">
          ${timeOptions
            .map(
              (opt) => `
            <button
              type="button"
              data-time-filter="${opt.value}"
              class="time-filter-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border min-h-[36px] transition-colors
                ${
                  activeTimeFilter === opt.value
                    ? 'bg-emalia-900 text-na-emalii border-emalia-900'
                    : 'bg-biel text-ink border-kreska hover:border-ink'
                }"
              aria-pressed="${activeTimeFilter === opt.value}"
            >
              ${opt.label}
            </button>
          `,
            )
            .join('')}
          ${
            activeTimeFilter !== null
              ? `
            <button type="button" data-time-filter="null"
              class="time-filter-btn text-[13px] text-ink-2 px-2 min-h-[36px]">
              ✕ czas
            </button>
          `
              : ''
          }
        </div>
      `
          : ''
      }
    </div>
  `;
}

function renderActiveFilters(resultCount: number, total: number): string {
  const filterChips = [
    ...Array.from(activeSlotFilters).map((s) => ({
      label: SLOT_LABELS[s],
      removeAction: `slot:${s}`,
    })),
    ...(activeTimeFilter !== null
      ? [{ label: `do ${activeTimeFilter} min`, removeAction: 'time' }]
      : []),
  ];

  return `
    <div class="px-4 pb-3 flex flex-wrap items-center gap-2">
      ${filterChips
        .map(
          (chip) => `
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-emalia-900 text-na-emalii">
          ${chip.label}
          <button type="button" data-remove-filter="${chip.removeAction}"
            class="remove-filter-btn text-na-emalii-2 hover:text-na-emalii min-w-touch min-h-touch inline-flex items-center justify-center"
            aria-label="Zdejmij filtr ${chip.label}">✕</button>
        </span>
      `,
        )
        .join('')}
      <button id="btn-clear-all" type="button" class="text-[13px] text-emalia-500 font-semibold min-h-touch px-2">
        wyczyść filtry
      </button>
      <span class="text-[13px] text-ink-2 ml-auto font-semibold" aria-live="polite">
        ${resultCount} z ${total}
      </span>
    </div>
  `;
}

function renderRecipeGrid(recipes: RecipeStub[]): string {
  return `
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-kreska border-t border-kreska">
      ${recipes.map((recipe) => renderTile(recipe)).join('')}
    </ul>
  `;
}

function renderTile(recipe: RecipeStub): string {
  const base = getBaseUrl();
  // W planie?
  const planSlot = plan?.slots.find((s) =>
    s.dishes.some((d) => d.recipeSlug === recipe.slug),
  );
  const inPlan = Boolean(planSlot);

  return `
    <li class="bg-biel">
      <!-- Kafelek — CELOWO inaczej niż karta E-04: brak cienia, mały promień, zdjęcie mniejsze -->
      <div class="flex gap-3 p-3 hover:bg-porcelana transition-colors">
        <!-- Zdjęcie — pomocnicze, nie dominujące -->
        <a href="${base}/przepis/${recipe.slug}" class="flex-shrink-0 min-w-touch min-h-touch" tabindex="-1" aria-hidden="true">
          ${
            recipe.image
              ? `<img src="${recipe.image}" alt=""
                class="w-16 h-16 rounded-s object-cover"
                loading="lazy" width="64" height="64" />`
              : `<div class="w-16 h-16 rounded-s bg-kreska flex items-center justify-center text-xl" aria-hidden="true">🍽️</div>`
          }
        </a>
        <!-- Treść -->
        <div class="flex-1 min-w-0">
          <a href="${base}/przepis/${recipe.slug}"
            class="font-bold text-[15px] text-ink hover:text-emalia-500 leading-snug block">
            ${recipe.title}
          </a>
          <p class="text-[12.5px] text-ink-2 mt-0.5">
            ${recipe.timeMinutes} min · ${recipe.calories} kcal
          </p>
          <!-- Akcja: dodaj do planu -->
          ${
            inPlan
              ? `
            <span class="text-[12.5px] text-tak font-semibold mt-1 block">
              ✓ Masz to w ${SLOT_MIEJSCOWNIK[planSlot!.name] ?? 'planie'}
            </span>
          `
              : `
            <button
              type="button"
              data-recipe-slug="${recipe.slug}"
              class="btn-add-to-plan text-[12.5px] text-kurkuma font-semibold mt-1 min-h-touch inline-flex items-center gap-1"
            >
              + Dodaj do planu
            </button>
          `
          }
        </div>
      </div>
    </li>
  `;
}

function renderEmptyFilters(): string {
  const filterNames = [
    ...Array.from(activeSlotFilters).map((s) => SLOT_LABELS[s]),
    ...(activeTimeFilter !== null ? [`do ${activeTimeFilter} min`] : []),
  ].join(', ');

  return `
    <div class="px-4 py-10 text-center">
      <p class="font-bold text-[16px] text-ink mb-3">
        Żaden przepis nie pasuje do filtrów: ${filterNames}.
      </p>
      <button id="btn-clear-empty" type="button" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
        Wyczyść filtry
      </button>
    </div>
  `;
}

function renderCardsEntry(): string {
  const base = getBaseUrl();
  return `
    <div class="mx-4 my-6 p-4 bg-emalia-900 rounded-m flex items-center justify-between gap-4">
      <div class="text-na-emalii">
        <p class="font-bold text-[16px] leading-snug">
          <a href="${base}/wybieram?date=${todayDate}" class="hover:underline">Wybieraj kartami</a>
        </p>
        <p class="text-na-emalii-2 text-[13px]">szybciej, jedna decyzja naraz</p>
      </div>
      <a
        href="${base}/wybieram?date=${todayDate}"
        data-testid="start-picker"
        class="flex-shrink-0 px-4 py-2.5 rounded-l bg-kurkuma text-kurkuma-tekst font-bold text-[14px] min-h-touch inline-flex items-center"
      >
        Zacznij
      </a>
    </div>
  `;
}

// ——— Eventy ———

function attachEvents() {
  // Zamknij komunikat localStorage
  document.getElementById('btn-close-notice')?.addEventListener('click', () => {
    document.getElementById('localstorage-notice')?.remove();
    seenLocalStorageNotice = true;
    const settings = loadSettings();
    settings.seenLocalStorageNotice = true;
    saveSettings(settings);
  });

  // Filtry slotów
  document.querySelectorAll('.slot-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = (btn as HTMLElement).dataset.slotFilter as SlotTag;
      toggleSlotFilter(slot);
    });
  });

  // Filtr czasu
  document.querySelectorAll('.time-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = (btn as HTMLElement).dataset.timeFilter;
      setTimeFilter(val === 'null' ? null : Number(val));
    });
  });

  // Usuń pojedynczy filtr
  document.querySelectorAll('.remove-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.removeFilter!;
      if (action === 'time') {
        setTimeFilter(null);
      } else if (action.startsWith('slot:')) {
        toggleSlotFilter(action.slice(5) as SlotTag);
      }
    });
  });

  // Wyczyść wszystkie
  document.getElementById('btn-clear-all')?.addEventListener('click', clearAllFilters);
  document.getElementById('btn-clear-empty')?.addEventListener('click', clearAllFilters);

  // Dodaj do planu
  document.querySelectorAll('.btn-add-to-plan').forEach((btn) => {
    btn.addEventListener('click', () => {
      const recipeSlug = (btn as HTMLElement).dataset.recipeSlug!;
      showAddToPlanDialog(recipeSlug);
    });
  });
}

function showAddToPlanDialog(recipeSlug: string) {
  const recipe = allRecipes.find((r) => r.slug === recipeSlug);
  if (!recipe) return;

  const settings = loadSettings();
  if (!plan) {
    plan = createEmptyPlan(todayDate, settings.defaultSlots);
    savePlan(plan);
  }
  const currentPlan = plan;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-end justify-center';
  overlay.innerHTML = `
    <div class="w-full bg-biel rounded-t-l p-5 max-w-[480px] mx-auto" role="dialog" aria-label="Dodaj do planu: ${recipe.title}">
      <p class="font-bold text-[15px] text-ink mb-1">${recipe.title}</p>
      <p class="text-ink-2 text-[13px] mb-4">Do którego posiłku?</p>
      <div class="space-y-1">
        ${currentPlan.slots
          .map(
            (slot) => `
          <button
            type="button"
            data-slot-id="${slot.id}"
            class="btn-choose-slot flex items-center justify-between py-3 px-3 rounded-m text-[15px] font-semibold text-ink hover:bg-porcelana w-full min-h-touch"
          >
            <span>${SLOT_LABELS[slot.name]}</span>
            ${
              slot.dishes.length > 0
                ? `<span class="text-[12px] text-ink-2">${slot.dishes.length} ${slot.dishes.length === 1 ? 'danie' : 'dania'}</span>`
                : '<span class="text-[12px] text-ink-3">puste</span>'
            }
          </button>
        `,
          )
          .join('')}
        <button id="overlay-close-add" type="button" class="py-3 px-3 text-[14px] text-ink-2 hover:bg-porcelana w-full rounded-m min-h-touch">Anuluj</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById('overlay-close-add')?.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove();
  });
  overlay.querySelector<HTMLButtonElement>('.btn-choose-slot')?.focus();

  overlay.querySelectorAll('.btn-choose-slot').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slotId = (btn as HTMLElement).dataset.slotId!;
      overlay.remove();

      if (!plan) return;
      plan = addDishToSlot(plan, slotId, recipeSlug);
      savePlan(plan);

      const slot = plan.slots.find((s) => s.id === slotId);
      const doSlotu = slot ? SLOT_DOPELNIACZ[slot.name] : 'planu';
      const dishCount = slot?.dishes.length ?? 1;
      const msg =
        dishCount === 1
          ? `${recipe.title} — dodany do ${doSlotu} na dziś`
          : `${recipe.title} — dodany jako danie ${dishCount} do ${doSlotu}`;

      // Toast potwierdzenia
      showToast(msg);
      renderUI();
    });
  });
}

function showToast(message: string) {
  document.querySelector('[data-home-toast]')?.remove();
  const toast = document.createElement('div');
  toast.setAttribute('data-home-toast', 'true');
  toast.className =
    'fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 text-[14px] font-medium shadow-lg z-40';
  toast.textContent = message;
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Wstecz w przeglądarce cofa filtr, nie wyrzuca ze strony
window.addEventListener('popstate', () => {
  readFiltersFromUrl();
  plan = loadPlan(todayDate || new Date().toISOString().slice(0, 10));
  renderUI();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

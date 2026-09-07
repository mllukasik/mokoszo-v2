import type { DayPlan, PlanSlot, SlotTag } from '../types';
import {
  loadPlan, savePlan, createEmptyPlan, addDishToSlot,
  removeDishFromSlot, addSlotToPlan, removeSlotFromPlan,
  hasPlanForOtherDate, loadSettings,
} from '../scripts/store';
import { SLOT_LABELS } from '../types';

// ——— Stan ———
let plan: DayPlan | null = null;
let currentDate = '';
let allRecipes: RecipeStub[] = [];
let undoTimeout: ReturnType<typeof setTimeout> | null = null;
let undoDish: { slotId: string; recipeSlug: string } | null = null;
let initialized = false;

interface RecipeStub {
  slug: string; title: string; image?: string; calories: number; slots: SlotTag[];
}

// ——— Init ———

function init() {
  if (initialized) return;
  initialized = true;

  allRecipes = JSON.parse(
    document.getElementById('all-recipes')?.textContent ?? '[]'
  );

  const params = new URLSearchParams(window.location.search);
  currentDate = params.get('date')?.trim() || getTodayDate();

  // Q-10: jeden dzień — sprawdź konflikt daty
  const conflictPlan = hasPlanForOtherDate(currentDate);
  if (conflictPlan) {
    showDateConflictDialog(conflictPlan);
    return;
  }

  const settings = loadSettings();
  plan = loadPlan(currentDate) ?? createEmptyPlan(currentDate, settings.defaultSlots);
  savePlan(plan); // zapisz jeśli nowy

  renderUI();

  // Podświetl slot po powrocie z E-04
  const hash = window.location.hash.replace('#slot-', '');
  if (hash && hash !== window.location.hash) {
    setTimeout(() => {
      const el = document.getElementById(`slot-${hash}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('ring-2', 'ring-kurkuma', 'ring-offset-2');
      setTimeout(() => el?.classList.remove('ring-2', 'ring-kurkuma', 'ring-offset-2'), 2000);
    }, 100);
  }
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getBaseUrl(): string {
  // Główne źródło: JSON wbudowany w stronę; awaryjnie meta[name=base-url].
  const raw = document.getElementById('base-url')?.textContent;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string;
      if (typeof parsed === 'string') return parsed.replace(/\/$/, '');
    } catch { /* spadnij do meta */ }
  }
  const meta = document.querySelector('meta[name="base-url"]') as HTMLMetaElement | null;
  return (meta?.content ?? '').replace(/\/$/, '');
}

// ——— Konflikt daty (Q-10) ———

function showDateConflictDialog(existingPlan: DayPlan) {
  const mount = document.getElementById('plan-mount');
  if (!mount) return;

  const totalDishes = existingPlan.slots.reduce((n, s) => n + s.dishes.length, 0);
  const existingDate = new Date(existingPlan.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
  const requestedDate = new Date(currentDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  mount.innerHTML = `
    <div class="page-content max-w-[480px] mx-auto py-8 px-4">
      <div class="bg-biel border-l-4 border-nie rounded-r-m p-5">
        <p class="font-bold mb-2">Masz zaplanowane ${totalDishes} posiłków na ${existingDate}.</p>
        <p class="text-ink-2 text-[14px] mb-4">
          Przejście na ${requestedDate} zacznie plan od nowa — poprzedni dzień zostanie usunięty.
        </p>
        <div class="flex gap-3 flex-wrap">
          <button id="btn-confirm-change"
            class="px-4 py-2.5 rounded-l bg-nie text-white font-bold min-h-touch">
            Zacznij nowy dzień
          </button>
          <button id="btn-cancel-change"
            class="px-4 py-2.5 rounded-l border border-kreska bg-biel text-ink font-semibold min-h-touch">
            Zostań na ${existingDate}
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-confirm-change')?.addEventListener('click', () => {
    const settings = loadSettings();
    plan = createEmptyPlan(currentDate, settings.defaultSlots);
    savePlan(plan);
    renderUI();
  });

  document.getElementById('btn-cancel-change')?.addEventListener('click', () => {
    // Wróć do planu istniejącego dnia
    window.location.href = `${getBaseUrl()}/plan?date=${existingPlan.date}`;
  });
}

// ——— Obliczenia kalorii ———

function getRecipeCalories(slug: string): number {
  const recipe = allRecipes.find(r => r.slug === slug);
  return recipe?.calories ?? 0;
}

function calcSlotCalories(slot: PlanSlot): { total: number; incomplete: boolean } {
  let total = 0;
  let incomplete = false;
  for (const dish of slot.dishes) {
    const cal = getRecipeCalories(dish.recipeSlug);
    if (cal === 0) incomplete = true;
    total += cal;
  }
  return { total, incomplete };
}

function calcDayCalories(dayPlan: DayPlan): { total: number; incomplete: boolean } {
  let total = 0;
  let incomplete = false;
  for (const slot of dayPlan.slots) {
    const slotCal = calcSlotCalories(slot);
    total += slotCal.total;
    if (slotCal.incomplete) incomplete = true;
  }
  return { total, incomplete };
}

// ——— Renderowanie ———

function renderUI() {
  const mount = document.getElementById('plan-mount');
  if (!mount || !plan) return;

  const dateFormatted = new Date(currentDate).toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const dayCal = calcDayCalories(plan);

  mount.innerHTML = `
    <div class="max-w-[680px] mx-auto">
      <!-- Nagłówek -->
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <p class="text-[13px] text-na-emalii-2 mb-1">Plan na</p>
        <div class="flex items-baseline justify-between gap-4">
          <h1 class="text-2xl font-extrabold tracking-tight capitalize">${dateFormatted}</h1>
          <button id="btn-change-date" class="text-[13px] text-kurkuma font-semibold min-h-touch px-2">
            Zmień dzień
          </button>
        </div>
      </header>

      <!-- Suma dnia -->
      ${dayCal.total > 0 ? `
        <div class="bg-biel border-b border-kreska px-4 py-3 flex items-center justify-between text-[14px]">
          <span class="font-semibold">Łącznie w tym dniu</span>
          <span class="${dayCal.incomplete ? 'text-kurkuma-tekst' : 'text-ink-2'}">
            ${dayCal.total} kcal${dayCal.incomplete ? ' · suma niepełna ⚠' : ''}
          </span>
        </div>
      ` : ''}

      <!-- Sloty: mobile jedna kolumna, ≥600px dwie kolumny -->
      <ul class="divide-y divide-kreska sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-x-4" id="slots-list">
        ${plan.slots.map(slot => renderSlot(slot)).join('')}
      </ul>

      <!-- Dodaj posiłek -->
      <div class="px-4 py-3">
        <button id="btn-add-slot" class="text-[14px] font-semibold text-emalia-500 flex items-center gap-1 min-h-touch">
          + Dodaj posiłek do tego dnia
        </button>
      </div>

      <!-- Przejście do zakupów -->
      ${plan.slots.some(s => s.dishes.length > 0) ? `
        <div class="px-4 pb-6">
          <a
            href="${getBaseUrl()}/zakupy?date=${currentDate}"
            class="flex items-center justify-center gap-2 w-full py-3.5 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch"
          >
            Zrób listę zakupów na ten dzień
          </a>
        </div>
      ` : ''}
    </div>
  `;

  attachEvents();
}

function renderSlot(slot: PlanSlot): string {
  const slotCal = calcSlotCalories(slot);
  const label = SLOT_LABELS[slot.name] ?? slot.name;
  const base = getBaseUrl();

  return `
    <li id="slot-${slot.id}" class="px-4 py-4 transition-all sm:border-b sm:border-kreska">
      <!-- Nagłówek slotu -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="font-bold text-[16px]">${label}</h2>
          ${slotCal.total > 0 ? `
            <span class="text-[12.5px] ${slotCal.incomplete ? 'text-kurkuma-tekst' : 'text-ink-2'}">
              ${slotCal.total} kcal${slotCal.incomplete ? ' ⚠' : ''}
            </span>
          ` : ''}
        </div>
        <button
          data-slot-id="${slot.id}"
          class="btn-remove-slot text-[12.5px] text-ink-2 min-h-touch px-2"
          aria-label="Usuń posiłek ${label}"
        >
          Usuń posiłek
        </button>
      </div>

      <!-- Lista dań -->
      ${slot.dishes.length > 0 ? `
        <ul class="space-y-2 mb-2">
          ${slot.dishes.map(dish => renderDish(dish.recipeSlug, slot.id)).join('')}
        </ul>
        <!-- Dodaj kolejne danie -->
        <a
          href="${base}/wybieram?date=${currentDate}&slot=${slot.id}"
          class="text-[13px] text-emalia-500 font-semibold flex items-center gap-1 min-h-touch py-1"
        >
          + Dodaj kolejne danie
        </a>
      ` : `
        <!-- Pusty slot — wyróżniony -->
        <a
          href="${base}/wybieram?date=${currentDate}&slot=${slot.id}"
          class="flex items-center justify-center border-2 border-dashed border-kurkuma rounded-m py-4 text-kurkuma font-semibold text-[14px] min-h-touch"
        >
          Wybierz przepis
        </a>
      `}
    </li>
  `;
}

function renderDish(recipeSlug: string, slotId: string): string {
  const recipe = allRecipes.find(r => r.slug === recipeSlug);
  if (!recipe) return '';
  const base = getBaseUrl();

  return `
    <li class="flex items-center gap-3 py-1">
      ${recipe.image
        ? `<img src="${recipe.image}" alt="" class="w-10 h-10 rounded-s object-cover flex-shrink-0" />`
        : `<div class="w-10 h-10 rounded-s bg-kreska flex-shrink-0"></div>`
      }
      <a href="${base}/przepis/${recipeSlug}" class="flex-1 text-[14px] font-semibold text-ink hover:text-emalia-500">
        ${recipe.title}
      </a>
      <span class="text-[12.5px] text-ink-2">${recipe.calories} kcal</span>
      <!-- Menu dania -->
      <div class="relative">
        <button
          data-slot-id="${slotId}"
          data-recipe-slug="${recipeSlug}"
          class="btn-dish-menu w-10 h-10 flex items-center justify-center rounded-s text-ink-2 hover:bg-kreska"
          aria-label="Opcje dania ${recipe.title}"
        >
          ⋯
        </button>
      </div>
    </li>
  `;
}

// ——— Eventy ———

function attachEvents() {
  // Menu dania (podmień / usuń)
  document.querySelectorAll('.btn-dish-menu').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotId = (btn as HTMLElement).dataset.slotId!;
      const recipeSlug = (btn as HTMLElement).dataset.recipeSlug!;
      showDishMenu(slotId, recipeSlug);
    });
  });

  // Usuń slot
  document.querySelectorAll('.btn-remove-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotId = (btn as HTMLElement).dataset.slotId!;
      confirmRemoveSlot(slotId);
    });
  });

  // Dodaj slot
  document.getElementById('btn-add-slot')?.addEventListener('click', showAddSlotDialog);

  // Zmień dzień
  document.getElementById('btn-change-date')?.addEventListener('click', showChangeDateDialog);
}

function showDishMenu(slotId: string, recipeSlug: string) {
  const recipe = allRecipes.find(r => r.slug === recipeSlug);
  const base = getBaseUrl();

  // Prosta implementacja arkusza od dołu (bottom sheet)
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-end';
  overlay.innerHTML = `
    <div class="w-full bg-biel rounded-t-l p-4 max-w-[480px] mx-auto" role="dialog" aria-label="Opcje dania">
      <p class="font-bold text-[16px] mb-4">${recipe?.title}</p>
      <div class="space-y-1">
        <a
          href="${base}/wybieram?date=${currentDate}&slot=${slotId}&replace=${recipeSlug}"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] font-semibold hover:bg-porcelana w-full"
        >
          Podmień przepis
        </a>
        <button
          id="overlay-remove"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] font-semibold text-nie hover:bg-nie-tint w-full"
        >
          Usuń z planu
        </button>
        <button
          id="overlay-close"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] text-ink-2 hover:bg-porcelana w-full"
        >
          Anuluj
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById('overlay-close')?.addEventListener('click', () => overlay.remove());
  document.getElementById('overlay-remove')?.addEventListener('click', () => {
    overlay.remove();
    removeDish(slotId, recipeSlug);
  });
}

function removeDish(slotId: string, recipeSlug: string) {
  if (!plan) return;
  undoDish = { slotId, recipeSlug };
  plan = removeDishFromSlot(plan, slotId, recipeSlug);
  renderUI();

  // Toast z opcją cofnięcia (5 sekund)
  showUndoToast(`Usunięto z planu. `, () => {
    if (!plan || !undoDish) return;
    plan = addDishToSlot(plan, undoDish.slotId, undoDish.recipeSlug);
    renderUI();
  });
}

function showUndoToast(message: string, onUndo: () => void) {
  const existing = document.getElementById('undo-toast');
  existing?.remove();
  if (undoTimeout) clearTimeout(undoTimeout);

  const toast = document.createElement('div');
  toast.id = 'undo-toast';
  toast.className = 'fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 flex items-center justify-between gap-3 shadow-lg z-40';
  toast.innerHTML = `
    <span class="text-[14px]">${message}</span>
    <button id="toast-undo" class="text-kurkuma font-bold text-[14px] min-h-touch px-2">Cofnij</button>
  `;
  document.body.appendChild(toast);

  document.getElementById('toast-undo')?.addEventListener('click', () => {
    toast.remove();
    if (undoTimeout) clearTimeout(undoTimeout);
    onUndo();
  });

  undoTimeout = setTimeout(() => toast.remove(), 5000);
}

function confirmRemoveSlot(slotId: string) {
  if (!plan) return;
  const slot = plan.slots.find(s => s.id === slotId);
  if (!slot) return;

  const dishCount = slot.dishes.length;
  if (dishCount > 0) {
    const confirmed = confirm(
      `Usunąć posiłek "${SLOT_LABELS[slot.name]}"? Razem z nim znikną ${dishCount} ${dishCount === 1 ? 'danie' : 'dania'}.`
    );
    if (!confirmed) return;
  }

  plan = removeSlotFromPlan(plan, slotId);
  renderUI();
}

function showAddSlotDialog() {
  const slotOptions: SlotTag[] = ['sniadanie', 'drugie-sniadanie', 'obiad', 'kolacja', 'deser'];
  const existingNames = plan?.slots.map(s => s.name) ?? [];
  const available = slotOptions.filter(s => !existingNames.includes(s));

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-end';
  overlay.innerHTML = `
    <div class="w-full bg-biel rounded-t-l p-4 max-w-[480px] mx-auto" role="dialog">
      <p class="font-bold text-[16px] mb-4">Dodaj posiłek do tego dnia</p>
      <div class="space-y-1">
        ${available.map(s => `
          <button data-slot="${s}" class="btn-add-slot-option flex items-center py-3 px-2 rounded-m text-[15px] font-semibold hover:bg-porcelana w-full">
            ${SLOT_LABELS[s]}
          </button>
        `).join('')}
        ${available.length === 0 ? '<p class="text-ink-2 py-3">Wszystkie posiłki już dodane.</p>' : ''}
        <button id="overlay-close2" class="py-3 px-2 text-[14px] text-ink-2 hover:bg-porcelana w-full rounded-m">Anuluj</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById('overlay-close2')?.addEventListener('click', () => overlay.remove());

  document.querySelectorAll('.btn-add-slot-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotName = (btn as HTMLElement).dataset.slot as SlotTag;
      overlay.remove();
      if (!plan) return;
      plan = addSlotToPlan(plan, slotName);
      renderUI();
    });
  });
}

function showChangeDateDialog() {
  // Prosta implementacja: input[type=date]
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
  overlay.innerHTML = `
    <div class="bg-biel rounded-l p-5 w-full max-w-[320px]" role="dialog">
      <p class="font-bold mb-4">Wybierz dzień</p>
      <input type="date" id="date-input" value="${currentDate}"
        class="w-full border border-kreska rounded-m px-3 py-2 text-[15px] mb-4 min-h-touch" />
      <div class="flex gap-3">
        <button id="btn-date-ok" class="flex-1 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">OK</button>
        <button id="btn-date-cancel" class="flex-1 py-3 rounded-l border border-kreska text-ink font-semibold min-h-touch">Anuluj</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('btn-date-cancel')?.addEventListener('click', () => overlay.remove());
  document.getElementById('btn-date-ok')?.addEventListener('click', () => {
    const newDate = (document.getElementById('date-input') as HTMLInputElement).value;
    overlay.remove();
    if (newDate && newDate !== currentDate) {
      window.location.href = `${getBaseUrl()}/plan?date=${newDate}`;
    }
  });
}

// ——— Start ———
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

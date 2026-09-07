import type { SlotTag } from '../types';
import { loadPlan, addDishToSlot, createEmptyPlan, loadSettings, savePlan } from '../scripts/store';
import { SLOT_LABELS } from '../types';

interface RecipeCardData {
  slug: string;
  title: string;
  image?: string | null;
  timeMinutes: number;
  calories: number;
  slots: SlotTag[];
  ingredients: Array<{ name: string; amount: number; unit: string }>;
}

const VALID_SLOT_TAGS: SlotTag[] = ['sniadanie', 'drugie-sniadanie', 'obiad', 'kolacja', 'deser'];

function isSlotTag(value: string | null | undefined): value is SlotTag {
  return value !== null && value !== undefined && (VALID_SLOT_TAGS as string[]).includes(value);
}

// ——— Stan ———
let allRecipes: RecipeCardData[] = [];
let filteredRecipes: RecipeCardData[] = [];
let currentIndex = 0;
let activeSlotFilter: SlotTag | null = null;
let currentDate = '';
let currentSlotId = '';
let history: string[] = []; // do cofania decyzji (FR-05)
let confirmationVisible = false;
let keyboardAttached = false;
let keyboardHintDismissed = false;

// ——— Init ———

function init() {
  // Odczytaj dane przepisów wbudowane w stronę
  const dataEl = document.getElementById('all-recipes');
  if (!dataEl) return;
  allRecipes = JSON.parse(dataEl.textContent ?? '[]');

  // Odczytaj parametry URL: ?date=2026-09-05&slot=<slotId>
  const params = new URLSearchParams(window.location.search);
  currentDate = params.get('date') ?? getTodayDate();
  currentSlotId = params.get('slot') ?? '';

  // Określ aktywny filtr slotu na podstawie planu.
  // Parametr slot to zwykle id slotu (docelowo UUID z E-03),
  // ale strona planu (E-03 zalążek) przekazuje nazwę slotu (SlotTag) —
  // obsługujemy oba warianty.
  const plan = loadPlan(currentDate);
  if (plan && currentSlotId) {
    const slot = plan.slots.find((s) => s.id === currentSlotId);
    if (slot && isSlotTag(slot.name)) activeSlotFilter = slot.name;
  }
  if (!activeSlotFilter && isSlotTag(currentSlotId)) {
    activeSlotFilter = currentSlotId;
  }

  // Filtruj przepisy
  applyFilter();

  // Renderuj
  renderUI();
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ——— Filtrowanie ———

function applyFilter() {
  if (activeSlotFilter) {
    filteredRecipes = allRecipes.filter((r) => r.slots.includes(activeSlotFilter!));
  } else {
    filteredRecipes = [...allRecipes];
  }
  currentIndex = 0;
  history = [];
}

function removeFilter() {
  activeSlotFilter = null;
  currentSlotId = '';
  applyFilter();
  renderUI();
}

// ——— Oblicz liczbę dań w bieżącym slocie ———

function getDishCountInCurrentSlot(): number {
  const plan = loadPlan(currentDate);
  if (!plan || !currentSlotId) return 0;
  const slot = plan.slots.find((s) => s.id === currentSlotId);
  return slot?.dishes.length ?? 0;
}

// ——— Renderowanie ———

function renderUI() {
  const mount = document.getElementById('cards-mount');
  if (!mount) return;
  confirmationVisible = false;

  mount.innerHTML = `
    <div class="relative flex flex-col min-h-dvh text-na-emalii" role="main">
      ${renderTopBar()}
      ${renderFilterBar()}
      ${renderSlotInfo()}
      ${renderCardStack()}
      ${renderButtons()}
      ${renderKeyboardHint()}
    </div>
  `;

  attachEvents();
}

function renderTopBar(): string {
  const slotLabel = activeSlotFilter ? SLOT_LABELS[activeSlotFilter] : 'Wszystkie';
  const total = filteredRecipes.length;
  const remaining = Math.max(0, total - currentIndex);

  return `
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <a
        href="${getBaseUrl()}/plan?date=${currentDate}"
        class="flex items-center gap-1 text-na-emalii-2 text-[14px] font-semibold min-h-touch px-2 -ml-2 rounded-m hover:text-na-emalii"
        aria-label="Zamknij tryb wybierania"
      >
        ✕ Zamknij
      </a>
      <div class="text-[13px] text-na-emalii-2 text-right" aria-live="polite">
        <strong class="text-na-emalii">${slotLabel}</strong>
        &nbsp;·&nbsp;${remaining} z ${total} przepisów
      </div>
    </div>
  `;
}

function renderFilterBar(): string {
  // Pasek filtra: chip z nazwą + przycisk wyłączenia, gdy filtr aktywny.
  // Gdy adres zawiera parametr slot, którego nie dało się rozpoznać
  // (np. przestarzałe id), też pokazujemy przycisk powrotu do pełnej puli.
  if (!activeSlotFilter && !currentSlotId) return '';
  const chip = activeSlotFilter
    ? `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-emalia-800 text-na-emalii border border-white/20">
        Filtr: ${SLOT_LABELS[activeSlotFilter]}
      </span>`
    : '';
  return `
    <div class="flex items-center gap-2 px-4 pb-2">
      ${chip}
      <button
        id="btn-remove-filter"
        class="text-[13px] text-kurkuma font-semibold underline min-h-touch px-2"
      >
        Pokaż wszystkie przepisy
      </button>
    </div>
  `;
}

function renderSlotInfo(): string {
  const count = getDishCountInCurrentSlot();
  if (!currentSlotId || count === 0) return '';
  const label = activeSlotFilter ? SLOT_LABELS[activeSlotFilter] : 'slocie';
  return `
    <div class="px-4 pb-2 text-[13px] text-na-emalii-2">
      W ${label.toLowerCase()} masz już ${count} ${count === 1 ? 'danie' : 'dania'}
    </div>
  `;
}

function renderCardStack(): string {
  const current = filteredRecipes[currentIndex];
  const next = filteredRecipes[currentIndex + 1];

  if (!current) {
    return renderEmptyState();
  }

  return `
    <div id="card-stack" class="flex-1 px-4 relative" style="min-height: 360px;">
      ${next ? renderCardElement(next, 'next') : ''}
      ${renderCardElement(current, 'current')}
    </div>
  `;
}

function renderCardElement(recipe: RecipeCardData, role: 'current' | 'next'): string {
  const isNext = role === 'next';
  const baseClasses = `
    absolute inset-0 rounded-karta overflow-hidden bg-emalia-800
    ${isNext ? 'scale-[0.95] opacity-60 pointer-events-none' : 'cursor-grab active:cursor-grabbing shadow-cien-noc'}
  `;

  const image = recipe.image
    ? `<img src="${recipe.image}" alt="" class="w-full h-full object-cover" loading="${isNext ? 'lazy' : 'eager'}" onerror="this.style.display='none'" />`
    : `<div class="w-full h-full flex items-center justify-center text-na-emalii-2">🍽️</div>`;

  return `
    <article
      id="${role === 'current' ? 'card-current' : 'card-next'}"
      class="${baseClasses}"
      ${role === 'current' ? 'role="article"' : ''}
      aria-label="${recipe.title}"
    >
      <!-- Zdjęcie 4:5 -->
      <div class="relative" style="aspect-ratio: 4/5; min-height: 240px;">
        ${image}
        <!-- Gradient czytelności -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
        <!-- Metadane nad gradientem -->
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <h2 class="text-xl font-extrabold text-white leading-tight mb-1">
            ${recipe.title}
          </h2>
          <p class="text-[13px] text-white/80">
            ${recipe.timeMinutes} min · ${recipe.calories} kcal
            · ${recipe.slots.map((s) => SLOT_LABELS[s as SlotTag]).join(', ')}
          </p>
        </div>
        <!-- Wstęga "biorę" -->
        <div id="ribbon-tak" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity bg-tak/20">
          <span class="text-4xl font-black text-tak-tint rotate-[-20deg]">Biorę</span>
        </div>
        <!-- Wstęga "nie dziś" -->
        <div id="ribbon-nie" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity bg-nie/20">
          <span class="text-4xl font-black text-nie-tint rotate-[20deg]">Nie dziś</span>
        </div>
      </div>
      <!-- Treść przewijana (FR-02) -->
      <div class="overflow-y-auto max-h-[200px] p-4 font-prose text-[15px] text-na-emalii leading-relaxed">
        <h3 class="font-ui font-bold text-[13px] uppercase tracking-wide text-na-emalii-2 mb-2">Składniki</h3>
        <ul class="space-y-1 mb-4">
          ${recipe.ingredients.map((i) => `<li>${i.name} — ${i.amount} ${i.unit}</li>`).join('')}
        </ul>
      </div>
    </article>
  `;
}

function renderEmptyState(): string {
  const hasFilter = activeSlotFilter !== null;
  const slotLabel = activeSlotFilter ? SLOT_LABELS[activeSlotFilter] : '';
  const total = allRecipes.length;

  if (hasFilter) {
    const filterCount = filteredRecipes.length;
    const remainingAll = total - filterCount;
    return `
      <div class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <p class="text-na-emalii text-lg font-bold">
          Obejrzałeś wszystkie ${filterCount} przepisów na ${slotLabel.toLowerCase()}.
        </p>
        <p class="text-na-emalii-2 text-[14px]">
          Wyłącz filtr, żeby zobaczyć pozostałe ${remainingAll}.
        </p>
        <button id="btn-remove-filter-empty" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Pokaż wszystkie przepisy
        </button>
      </div>
    `;
  }

  return `
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <p class="text-na-emalii text-lg font-bold">
        To wszystkie ${total} przepisów, jakie na razie mamy.
      </p>
      <p class="text-na-emalii-2 text-[14px]">
        Możesz je przejrzeć na liście albo zacząć wybieranie od nowa.
      </p>
      <div class="flex gap-3 flex-wrap justify-center">
        <a href="${getBaseUrl()}/" class="px-5 py-3 rounded-l border border-white/30 text-na-emalii font-semibold min-h-touch">
          Przeglądaj listę
        </a>
        <button id="btn-restart" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zacznij od nowa
        </button>
      </div>
    </div>
  `;
}

function renderButtons(): string {
  if (!filteredRecipes[currentIndex]) return '';

  return `
    <div class="flex items-center justify-center gap-3 px-6 py-4">
      <button
        id="btn-nie"
        aria-label="Nie dziś"
        class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-l bg-nie-tint text-nie border border-[var(--nie-jasny)] font-bold min-h-touch active:scale-[0.97] transition-transform"
      >
        ✕ Nie dziś
      </button>

      <button
        id="btn-cofnij"
        aria-label="Cofnij ostatnią decyzję"
        title="Cofnij"
        class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-na-emalii border border-white/20 active:scale-[0.97] transition-transform disabled:opacity-30"
        ${history.length === 0 ? 'disabled' : ''}
      >
        ↺
      </button>

      <button
        id="btn-tak"
        aria-label="Biorę"
        class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-l bg-tak-tint text-tak border border-[var(--tak-jasny)] font-bold min-h-touch active:scale-[0.97] transition-transform"
      >
        ✓ Biorę
      </button>
    </div>
  `;
}

function renderKeyboardHint(): string {
  if (keyboardHintDismissed) return '';
  return `
    <p class="text-center text-[12px] text-na-emalii-2 pb-4 px-4" id="keyboard-hint" aria-hidden="true">
      ← → strzałkami też · Backspace cofa
    </p>
  `;
}

// ——— Akcje ———

function decide(accepted: boolean) {
  if (confirmationVisible) return;
  const recipe = filteredRecipes[currentIndex];
  if (!recipe) return;

  if (accepted) {
    acceptRecipe(recipe);
  } else {
    history.push(recipe.slug);
    currentIndex++;
    renderUI();
  }
}

function acceptRecipe(recipe: RecipeCardData) {
  if (!currentSlotId || !currentDate) {
    // Bez kontekstu — pytaj o slot
    alert(`Przepis "${recipe.title}" gotowy do dodania. Wróć do planu i wybierz slot.`);
    return;
  }

  let plan = loadPlan(currentDate);
  const settings = loadSettings();

  if (!plan) {
    plan = createEmptyPlan(currentDate, settings.defaultSlots);
  }

  const updatedPlan = addDishToSlot(plan, currentSlotId, recipe.slug);
  savePlan(updatedPlan);

  const slot = updatedPlan.slots.find((s) => s.id === currentSlotId);
  const dishCount = slot?.dishes.length ?? 1;
  const slotLabel = slot ? SLOT_LABELS[slot.name] : 'posiłku';

  const confirmation =
    dishCount === 1
      ? `${recipe.title} — ${slotLabel.toLowerCase()} zaplanowany`
      : `${recipe.title} — dodany jako danie ${dishCount}. ${slotLabel.toLowerCase()}u`;

  showConfirmation(confirmation);
}

function showConfirmation(message: string) {
  const mount = document.getElementById('cards-mount');
  if (!mount) return;
  confirmationVisible = true;

  mount.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-6">
      <div class="text-4xl">✓</div>
      <p class="text-na-emalii text-lg font-bold" aria-live="assertive">${message}</p>
      <div class="flex flex-col gap-3 w-full max-w-[280px]">
        <button id="btn-next-slot" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zaplanuj kolejny posiłek
        </button>
        <a
          href="${getBaseUrl()}/plan?date=${currentDate}#slot-${currentSlotId}"
          class="px-5 py-3 rounded-l border border-white/30 text-na-emalii font-semibold min-h-touch flex items-center justify-center"
        >
          Wróć do planu
        </a>
      </div>
    </div>
  `;

  document.getElementById('btn-next-slot')?.addEventListener('click', () => {
    currentIndex++;
    renderUI();
  });
}

function undoLastDecision() {
  if (confirmationVisible) return;
  if (history.length === 0) return;
  history.pop();
  currentIndex = Math.max(0, currentIndex - 1);
  renderUI();
}

function restart() {
  currentIndex = 0;
  history = [];
  renderUI();
}

// ——— Gesty (swipe) — FR-03 ———
// touch-action: pan-y na karcie = przewijanie pionowe natywne.
// Decyzja tylko gdy ruch poziomy > 1.3x pionowy i > 7px.
// Implementacja na Pointer Events: obejmuje dotyk i mysz,
// a pionowe przewijanie pozostaje natywne (pointercancel = reset).

function attachSwipeEvents() {
  const card = document.getElementById('card-current');
  if (!card) return;

  card.style.touchAction = 'pan-y'; // natywne przewijanie pionowe

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let axisLocked: 'x' | 'y' | null = null;
  let isDragging = false;
  let activePointerId: number | null = null;

  card.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!e.isPrimary) return;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    currentX = 0;
    axisLocked = null;
    isDragging = true;
  });

  card.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!axisLocked && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      // Blokuj oś po przekroczeniu 7px
      axisLocked = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y';
    }

    if (axisLocked === 'x') {
      currentX = dx;
      updateCardTransform(dx);
    }
  });

  const finishDrag = (e: PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerId) return;
    isDragging = false;
    activePointerId = null;

    if (axisLocked === 'x') {
      const cardWidth = card.offsetWidth;
      const threshold = cardWidth * 0.28; // 28% szerokości (z dokumentacji)

      if (Math.abs(currentX) >= threshold) {
        const accepted = currentX > 0;
        animateDecision(card, accepted);
      } else {
        resetCardTransform(card);
      }
    }

    currentX = 0;
    axisLocked = null;
  };

  card.addEventListener('pointerup', finishDrag);
  // Przeglądarka przejęła gest (np. pionowy scroll) — porzuć przeciąganie.
  card.addEventListener('pointercancel', () => {
    isDragging = false;
    activePointerId = null;
    currentX = 0;
    axisLocked = null;
    resetCardTransform(card);
  });
}

function updateCardTransform(dx: number) {
  const card = document.getElementById('card-current');
  if (!card) return;

  const rotate = dx * 0.08;
  card.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
  card.style.transition = 'none';

  // Wstęga narasta proporcjonalnie (pełna przy 110px)
  const ribbonOpacity = Math.min(1, Math.abs(dx) / 110);
  const ribbonTak = document.getElementById('ribbon-tak');
  const ribbonNie = document.getElementById('ribbon-nie');

  if (dx > 0 && ribbonTak) ribbonTak.style.opacity = String(ribbonOpacity);
  if (dx < 0 && ribbonNie) ribbonNie.style.opacity = String(ribbonOpacity);
}

function animateDecision(card: HTMLElement, accepted: boolean) {
  const targetX = accepted ? window.innerWidth : -window.innerWidth;
  card.style.transition = 'transform 250ms ease-out';
  card.style.transform = `translateX(${targetX}px) rotate(${accepted ? 15 : -15}deg)`;

  setTimeout(() => {
    decide(accepted);
  }, 250);
}

function resetCardTransform(card: HTMLElement) {
  card.style.transition = 'transform 250ms ease-out';
  card.style.transform = 'translateX(0) rotate(0deg)';
  const ribbonTak = document.getElementById('ribbon-tak');
  const ribbonNie = document.getElementById('ribbon-nie');
  if (ribbonTak) ribbonTak.style.opacity = '0';
  if (ribbonNie) ribbonNie.style.opacity = '0';
}

// ——— Klawiatura — FR-04 ———

function attachKeyboardEvents() {
  // Jeden globalny listener na cały czas życia strony —
  // renderUI() podmienia DOM, więc nie wolno dopinać nowego przy każdym renderze.
  if (keyboardAttached) return;
  keyboardAttached = true;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (['ArrowRight'].includes(e.key)) {
      e.preventDefault();
      decide(true);
    }
    if (['ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      decide(false);
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      undoLastDecision();
    }
  });

  // Ukryj hint klawiatury po pierwszej decyzji
  document.addEventListener(
    'keydown',
    () => {
      keyboardHintDismissed = true;
      document.getElementById('keyboard-hint')?.remove();
    },
    { once: true },
  );
}

// ——— Przyciski ———

function attachEvents() {
  // Przyciski decyzji
  document.getElementById('btn-tak')?.addEventListener('click', () => decide(true));
  document.getElementById('btn-nie')?.addEventListener('click', () => decide(false));
  document.getElementById('btn-cofnij')?.addEventListener('click', undoLastDecision);

  // Filtr
  document.getElementById('btn-remove-filter')?.addEventListener('click', removeFilter);
  document.getElementById('btn-remove-filter-empty')?.addEventListener('click', removeFilter);
  document.getElementById('btn-restart')?.addEventListener('click', restart);

  // Gesty
  attachSwipeEvents();

  // Klawiatura
  attachKeyboardEvents();
}

// ——— Helpers ———

function getBaseUrl(): string {
  const content = (document.querySelector('meta[name="base-url"]') as HTMLMetaElement | null)?.content ?? '';
  return content.replace(/\/$/, '');
}

// ——— Start ———
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

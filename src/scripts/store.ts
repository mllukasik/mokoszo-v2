import type { DayPlan, AppSettings, SlotTag } from '../types';

// Nowy klucz: wiele planów jako słownik date→DayPlan
const KEY_PLANS = 'jutrojem:plans';
// Legacy (Q-10 — jeden plan): migrujemy automatycznie
const KEY_PLAN_LEGACY = 'jutrojem:plan';
const KEY_SETTINGS = 'jutrojem:settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultSlots: ['sniadanie', 'obiad', 'kolacja'],
  seenLocalStorageNotice: false,
};

// ——— Migracja z legacy (jeden plan) → multi-plan ———

function migrateLegacy(): Record<string, DayPlan> {
  try {
    const raw = localStorage.getItem(KEY_PLAN_LEGACY);
    if (!raw) return {};
    const plan: DayPlan = JSON.parse(raw);
    localStorage.removeItem(KEY_PLAN_LEGACY);
    const map: Record<string, DayPlan> = { [plan.date]: plan };
    localStorage.setItem(KEY_PLANS, JSON.stringify(map));
    return map;
  } catch { return {}; }
}

function loadAllPlansMap(): Record<string, DayPlan> {
  try {
    const raw = localStorage.getItem(KEY_PLANS);
    if (raw) return JSON.parse(raw) as Record<string, DayPlan>;
    // Sprawdź legacy
    return migrateLegacy();
  } catch { return {}; }
}

// ——— Plan ———

export function loadAllPlans(): DayPlan[] {
  const map = loadAllPlansMap();
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
}

export function loadPlan(date: string): DayPlan | null {
  return loadAllPlansMap()[date] ?? null;
}

export function savePlan(plan: DayPlan): void {
  try {
    const map = loadAllPlansMap();
    map[plan.date] = plan;
    localStorage.setItem(KEY_PLANS, JSON.stringify(map));
  } catch { /* localStorage może być niedostępny */ }
}

export function deletePlan(date: string): void {
  try {
    const map = loadAllPlansMap();
    delete map[date];
    localStorage.setItem(KEY_PLANS, JSON.stringify(map));
  } catch { }
}

export function clearPlan(): void {
  localStorage.removeItem(KEY_PLANS);
  localStorage.removeItem(KEY_PLAN_LEGACY);
}

export function createEmptyPlan(date: string, slotNames: SlotTag[]): DayPlan {
  return {
    date,
    slots: slotNames.map(name => ({
      id: crypto.randomUUID(),
      name,
      label: name, // SLOT_LABELS[name] w komponencie
      dishes: [],
    })),
  };
}

export function addDishToSlot(plan: DayPlan, slotId: string, recipeSlug: string): DayPlan {
  const updated = {
    ...plan,
    slots: plan.slots.map(s =>
      s.id === slotId
        ? { ...s, dishes: [...s.dishes, { recipeSlug, addedAt: Date.now() }] }
        : s
    ),
  };
  savePlan(updated);
  return updated;
}

/** Zastępuje wszystkie dania w slocie jednym nowym (domyślny tryb: jedno danie = jeden slot). */
export function setDishInSlot(plan: DayPlan, slotId: string, recipeSlug: string): DayPlan {
  const updated = {
    ...plan,
    slots: plan.slots.map(s =>
      s.id === slotId
        ? { ...s, dishes: [{ recipeSlug, addedAt: Date.now() }] }
        : s
    ),
  };
  savePlan(updated);
  return updated;
}

export function removeDishFromSlot(plan: DayPlan, slotId: string, recipeSlug: string): DayPlan {
  const updated = {
    ...plan,
    slots: plan.slots.map(s =>
      s.id === slotId
        ? { ...s, dishes: s.dishes.filter(d => d.recipeSlug !== recipeSlug) }
        : s
    ),
  };
  savePlan(updated);
  return updated;
}

export function addSlotToPlan(plan: DayPlan, name: SlotTag): DayPlan {
  const updated = {
    ...plan,
    slots: [...plan.slots, { id: crypto.randomUUID(), name, label: name, dishes: [] }],
  };
  savePlan(updated);
  return updated;
}

export function removeSlotFromPlan(plan: DayPlan, slotId: string): DayPlan {
  const updated = { ...plan, slots: plan.slots.filter(s => s.id !== slotId) };
  savePlan(updated);
  return updated;
}

// ——— Ustawienia ———

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
}

// ——— Stan odhaczenia zakupów (powiązany z datą) ———

export function loadChecked(date: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`jutrojem:checked:${date}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveChecked(date: string, checked: Record<string, boolean>): void {
  localStorage.setItem(`jutrojem:checked:${date}`, JSON.stringify(checked));
}

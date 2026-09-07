import type { DayPlan, AppSettings, SlotTag } from '../types';

const KEY_PLAN = 'jutrojem:plan';
const KEY_SETTINGS = 'jutrojem:settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultSlots: ['sniadanie', 'obiad', 'kolacja'],
  seenLocalStorageNotice: false,
};

// ——— Plan ———

export function loadPlan(date: string): DayPlan | null {
  try {
    const raw = localStorage.getItem(KEY_PLAN);
    if (!raw) return null;
    const plan: DayPlan = JSON.parse(raw);
    // Q-10: przechowujemy jeden dzień; jeśli daty różne → brak planu
    return plan.date === date ? plan : null;
  } catch { return null; }
}

export function hasPlanForOtherDate(date: string): DayPlan | null {
  try {
    const raw = localStorage.getItem(KEY_PLAN);
    if (!raw) return null;
    const plan: DayPlan = JSON.parse(raw);
    if (plan.date === date) return null;
    const hasContent = plan.slots.some(s => s.dishes.length > 0);
    return hasContent ? plan : null;
  } catch { return null; }
}

export function savePlan(plan: DayPlan): void {
  localStorage.setItem(KEY_PLAN, JSON.stringify(plan));
}

export function clearPlan(): void {
  localStorage.removeItem(KEY_PLAN);
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

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEmptyPlan,
  addDishToSlot,
  removeDishFromSlot,
  addSlotToPlan,
  removeSlotFromPlan,
  loadPlan,
  loadAllPlans,
  savePlan,
  deletePlan,
} from '../store';
import type { DayPlan } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => `uuid-${++uuidCounter}` },
});

describe('createEmptyPlan', () => {
  it('tworzy plan z podaną datą i slotami', () => {
    const plan = createEmptyPlan('2026-09-05', ['sniadanie', 'obiad']);
    expect(plan.date).toBe('2026-09-05');
    expect(plan.slots).toHaveLength(2);
    expect(plan.slots[0].name).toBe('sniadanie');
    expect(plan.slots[1].name).toBe('obiad');
    expect(plan.slots[0].dishes).toHaveLength(0);
  });

  it('każdy slot ma unikalne id', () => {
    const plan = createEmptyPlan('2026-09-05', ['sniadanie', 'obiad', 'kolacja']);
    const ids = plan.slots.map(s => s.id);
    expect(new Set(ids).size).toBe(3);
  });
});

describe('addDishToSlot', () => {
  let plan: DayPlan;

  beforeEach(() => {
    uuidCounter = 0;
    localStorageMock.clear();
    plan = createEmptyPlan('2026-09-05', ['sniadanie', 'obiad']);
  });

  it('dodaje danie do pustego slotu', () => {
    const slotId = plan.slots[1].id;
    const updated = addDishToSlot(plan, slotId, 'zapiekanka-z-soczewica');
    expect(updated.slots[1].dishes).toHaveLength(1);
    expect(updated.slots[1].dishes[0].recipeSlug).toBe('zapiekanka-z-soczewica');
  });

  it('dodaje drugie danie do zajętego slotu (Q-04)', () => {
    const slotId = plan.slots[1].id;
    const after1 = addDishToSlot(plan, slotId, 'zapiekanka-z-soczewica');
    const after2 = addDishToSlot(after1, slotId, 'makaron-z-papryka');
    expect(after2.slots[1].dishes).toHaveLength(2);
  });

  it('nie modyfikuje innych slotów', () => {
    const slotId = plan.slots[1].id;
    const updated = addDishToSlot(plan, slotId, 'zapiekanka-z-soczewica');
    expect(updated.slots[0].dishes).toHaveLength(0);
  });

  it('nie mutuje oryginalnego planu', () => {
    const slotId = plan.slots[1].id;
    addDishToSlot(plan, slotId, 'zapiekanka-z-soczewica');
    expect(plan.slots[1].dishes).toHaveLength(0);
  });
});

describe('removeDishFromSlot', () => {
  it('usuwa danie ze slotu', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    let plan = createEmptyPlan('2026-09-05', ['obiad']);
    plan = addDishToSlot(plan, plan.slots[0].id, 'zapiekanka');
    plan = addDishToSlot(plan, plan.slots[0].id, 'surówka');
    const updated = removeDishFromSlot(plan, plan.slots[0].id, 'zapiekanka');
    expect(updated.slots[0].dishes).toHaveLength(1);
    expect(updated.slots[0].dishes[0].recipeSlug).toBe('surówka');
  });

  it('usunięcie ostatniego dania zostawia pusty slot (nie usuwa slotu)', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    let plan = createEmptyPlan('2026-09-05', ['obiad']);
    plan = addDishToSlot(plan, plan.slots[0].id, 'zapiekanka');
    const updated = removeDishFromSlot(plan, plan.slots[0].id, 'zapiekanka');
    expect(updated.slots).toHaveLength(1);       // slot istnieje
    expect(updated.slots[0].dishes).toHaveLength(0); // ale jest pusty
  });
});

describe('addSlotToPlan / removeSlotFromPlan', () => {
  it('dodaje slot do planu', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    const plan = createEmptyPlan('2026-09-05', ['obiad']);
    const updated = addSlotToPlan(plan, 'kolacja');
    expect(updated.slots).toHaveLength(2);
    expect(updated.slots[1].name).toBe('kolacja');
  });

  it('usuwa slot z planu', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    const plan = createEmptyPlan('2026-09-05', ['obiad', 'kolacja']);
    const updated = removeSlotFromPlan(plan, plan.slots[0].id);
    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0].name).toBe('kolacja');
  });
});

describe('multi-plan storage', () => {
  beforeEach(() => {
    uuidCounter = 0;
    localStorageMock.clear();
  });

  it('loadAllPlans zwraca pustą listę gdy brak danych', () => {
    expect(loadAllPlans()).toEqual([]);
  });

  it('savePlan / loadPlan zapisuje i odczytuje plan po dacie', () => {
    const plan = createEmptyPlan('2026-09-05', ['obiad']);
    savePlan(plan);
    const loaded = loadPlan('2026-09-05');
    expect(loaded?.date).toBe('2026-09-05');
  });

  it('loadPlan zwraca null dla nieistniejącej daty', () => {
    const plan = createEmptyPlan('2026-09-05', ['obiad']);
    savePlan(plan);
    expect(loadPlan('2026-09-07')).toBeNull();
  });

  it('można zapisać plany na wiele dat', () => {
    savePlan(createEmptyPlan('2026-09-05', ['obiad']));
    savePlan(createEmptyPlan('2026-09-06', ['sniadanie']));
    savePlan(createEmptyPlan('2026-09-07', ['kolacja']));
    const all = loadAllPlans();
    expect(all).toHaveLength(3);
  });

  it('loadAllPlans zwraca plany posortowane od najnowszego', () => {
    savePlan(createEmptyPlan('2026-09-05', ['obiad']));
    savePlan(createEmptyPlan('2026-09-07', ['kolacja']));
    savePlan(createEmptyPlan('2026-09-06', ['sniadanie']));
    const all = loadAllPlans();
    expect(all[0].date).toBe('2026-09-07');
    expect(all[1].date).toBe('2026-09-06');
    expect(all[2].date).toBe('2026-09-05');
  });

  it('deletePlan usuwa plan po dacie', () => {
    savePlan(createEmptyPlan('2026-09-05', ['obiad']));
    savePlan(createEmptyPlan('2026-09-06', ['kolacja']));
    deletePlan('2026-09-05');
    expect(loadPlan('2026-09-05')).toBeNull();
    expect(loadPlan('2026-09-06')).not.toBeNull();
  });

  it('migruje stary format jutrojem:plan do multi-plan', () => {
    // Symuluj stary zapis
    const legacyPlan = createEmptyPlan('2026-09-04', ['obiad']);
    localStorage.setItem('jutrojem:plan', JSON.stringify(legacyPlan));
    // loadAllPlans powinien migrować
    const all = loadAllPlans();
    expect(all).toHaveLength(1);
    expect(all[0].date).toBe('2026-09-04');
    // Stary klucz powinien zostać usunięty
    expect(localStorage.getItem('jutrojem:plan')).toBeNull();
  });
});

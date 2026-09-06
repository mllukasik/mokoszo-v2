# 03 — Model danych: Content Collections + TypeScript

## Astro Content Collections — konfiguracja

Plik: **`src/content/config.ts`**

```typescript
import { defineCollection, z } from 'astro:content';

const slotTagEnum = z.enum([
  'sniadanie',
  'drugie-sniadanie',
  'obiad',
  'kolacja',
  'deser',
]);

const ingredientSchema = z.object({
  slug: z.string(),               // klucz do ingredients.json
  name: z.string(),               // nazwa wyświetlana
  amount: z.number(),
  unit: z.string(),               // "g", "szt", "ml", "łyżka", "szklanka"
});

const recipes = defineCollection({
  type: 'content',               // parsuje body Markdown jako HTML
  schema: z.object({
    title: z.string().max(60),   // max 60 znaków — musi mieścić się na karcie
    image: z.string().optional(),// np. "/images/zapiekanka-z-soczewica.jpg"
    time_minutes: z.number().int().positive(),
    calories: z.number().int().positive(),
    servings: z.number().int().positive().default(2),
    slots: z.array(slotTagEnum).min(1),
    tags: z.array(z.string()).default([]),
    ingredients: z.array(ingredientSchema),
    // steps NIE są w frontmatter — są w body Markdown jako lista
  }),
});

export const collections = { recipes };
```

> **Dlaczego body Markdown, nie frontmatter dla steps?**
> Kroki i pełny opis przepisu idą jako treść pliku `.md`.
> Astro renderuje je do HTML (`entry.render()`) — to jedyna rzecz, którą wyświetlamy
> jako `font-prose` (Source Serif 4) w E-04 i E-05.

---

## Format pliku Markdown przepisu

Plik: **`src/content/recipes/[slug].md`**

```markdown
---
title: Zapiekanka z soczewicą i pieczarkami
image: /images/zapiekanka-z-soczewica.jpg
time_minutes: 45
calories: 520
servings: 2
slots:
  - obiad
  - kolacja
tags: []
ingredients:
  - slug: soczewica-czerwona
    name: Soczewica czerwona
    amount: 200
    unit: g
  - slug: pieczarki
    name: Pieczarki
    amount: 300
    unit: g
  - slug: cebula
    name: Cebula
    amount: 1
    unit: szt
  - slug: czosnek
    name: Czosnek
    amount: 2
    unit: ząbek
  - slug: passata
    name: Passata pomidorowa
    amount: 400
    unit: g
  - slug: papryka-czerwona
    name: Papryka czerwona
    amount: 1
    unit: szt
  - slug: ser-zolty
    name: Ser żółty (tarty)
    amount: 80
    unit: g
  - slug: oliwa
    name: Oliwa z oliwek
    amount: 2
    unit: łyżka
  - slug: sol
    name: Sól
    amount: 1
    unit: szczypta
  - slug: pieprz
    name: Pieprz czarny
    amount: 1
    unit: szczypta
---

Sycąca zapiekanka, w której soczewica zastępuje mięso mielone — bogata w białko,
gotowa w 45 minut i doskonała następnego dnia na zimno.

## Przygotowanie

1. Ugotuj soczewicę w osolonej wodzie przez 15 minut, aż będzie miękka. Odcedź.
2. Podsmaż posiekaną cebulę na oliwie przez 5 minut na złoto. Dodaj czosnek i smaż minutę.
3. Dodaj pokrojoną w kostkę paprykę, smaż 3 minuty.
4. Wrzuć pieczarki, smaż aż odparuje woda (ok. 5 minut).
5. Dodaj passatę i soczewicę, dopraw solą i pieprzem, gotuj razem 5 minut.
6. Przełóż do naczynia żaroodpornego, posyp tartym serem.
7. Zapiekaj w 180°C przez 20 minut, aż ser się zrumieni.
```

---

## Słownik składników — `src/data/ingredients.json`

```json
{
  "soczewica-czerwona": {
    "name": "Soczewica czerwona",
    "unit_default": "g",
    "calories_per_100g": 358,
    "category": "suche-produkty"
  },
  "pieczarki": {
    "name": "Pieczarki",
    "unit_default": "g",
    "calories_per_100g": 22,
    "category": "warzywa-owoce"
  },
  "cebula": {
    "name": "Cebula",
    "unit_default": "szt",
    "calories_per_100g": 40,
    "conversion_to_grams": 150,
    "category": "warzywa-owoce"
  },
  "czosnek": {
    "name": "Czosnek",
    "unit_default": "ząbek",
    "calories_per_100g": 149,
    "conversion_to_grams": 5,
    "category": "warzywa-owoce"
  },
  "passata": {
    "name": "Passata pomidorowa",
    "unit_default": "g",
    "calories_per_100g": 35,
    "category": "suche-produkty"
  },
  "papryka-czerwona": {
    "name": "Papryka czerwona",
    "unit_default": "szt",
    "calories_per_100g": 31,
    "conversion_to_grams": 160,
    "category": "warzywa-owoce"
  },
  "ser-zolty": {
    "name": "Ser żółty",
    "unit_default": "g",
    "calories_per_100g": 380,
    "category": "nabial"
  },
  "oliwa": {
    "name": "Oliwa z oliwek",
    "unit_default": "łyżka",
    "calories_per_100g": 884,
    "conversion_to_grams": 14,
    "category": "inne"
  },
  "jajka": {
    "name": "Jajka",
    "unit_default": "szt",
    "calories_per_100g": 155,
    "conversion_to_grams": 60,
    "category": "nabial"
  },
  "platki-owsiane": {
    "name": "Płatki owsiane",
    "unit_default": "g",
    "calories_per_100g": 370,
    "category": "suche-produkty"
  },
  "mleko": {
    "name": "Mleko",
    "unit_default": "ml",
    "calories_per_100g": 60,
    "category": "nabial"
  },
  "jablko": {
    "name": "Jabłko",
    "unit_default": "szt",
    "calories_per_100g": 52,
    "conversion_to_grams": 180,
    "category": "warzywa-owoce"
  },
  "makaron-penne": {
    "name": "Makaron penne",
    "unit_default": "g",
    "calories_per_100g": 357,
    "category": "suche-produkty"
  },
  "smietana-18": {
    "name": "Śmietana 18%",
    "unit_default": "ml",
    "calories_per_100g": 190,
    "category": "nabial"
  },
  "sol": { "name": "Sól", "unit_default": "szczypta", "category": "przyprawy" },
  "pieprz": { "name": "Pieprz czarny", "unit_default": "szczypta", "category": "przyprawy" },
  "cukier": { "name": "Cukier", "unit_default": "g", "calories_per_100g": 387, "category": "inne" }
}
```

Kategorie zakupowe (kolejność = kolejność w sklepie):
```typescript
// src/data/slots.ts
export const SHOPPING_CATEGORIES = [
  'warzywa-owoce',
  'nabial',
  'mieso-ryby',
  'suche-produkty',
  'pieczywo',
  'przyprawy',
  'inne',
] as const;

export type ShoppingCategory = typeof SHOPPING_CATEGORIES[number];
```

---

## Interfejsy TypeScript — `src/types.ts`

```typescript
import type { CollectionEntry } from 'astro:content';

// Typ przepisu z Astro Content Collections
export type Recipe = CollectionEntry<'recipes'>;
export type RecipeData = Recipe['data'];       // frontmatter
// Recipe['body'] → surowy Markdown
// (await entry.render()).Content → Astro komponent do renderowania

export type SlotTag = 'sniadanie' | 'drugie-sniadanie' | 'obiad' | 'kolacja' | 'deser';

export const SLOT_LABELS: Record<SlotTag, string> = {
  'sniadanie': 'Śniadanie',
  'drugie-sniadanie': 'Drugie śniadanie',
  'obiad': 'Obiad',
  'kolacja': 'Kolacja',
  'deser': 'Deser',
};

// ——— Plan dnia (localStorage) ———
export interface DishEntry {
  recipeSlug: string;
  addedAt: number; // timestamp
}

export interface PlanSlot {
  id: string;        // crypto.randomUUID()
  name: SlotTag;
  label: string;     // edytowalna nazwa slotu (domyślnie z SLOT_LABELS)
  dishes: DishEntry[];
}

export interface DayPlan {
  date: string;      // "YYYY-MM-DD"
  slots: PlanSlot[];
}

// ——— Lista zakupów ———
export interface ShoppingItem {
  ingredientSlug: string;
  name: string;
  totalAmount: number;
  unit: string;
  category: string;
  sources: Array<{ recipeTitle: string; amount: number; unit: string }>;
  checked: boolean;
  mergeError?: boolean; // różne jednostki, nie dało się zsumować
}

// ——— Ustawienia ———
export interface AppSettings {
  defaultSlots: SlotTag[];
  seenLocalStorageNotice: boolean;
}
```

---

## src/scripts/store.ts — localStorage

```typescript
import type { DayPlan, AppSettings, PlanSlot, SlotTag } from '../types';

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
```

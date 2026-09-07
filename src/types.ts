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

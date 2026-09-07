// Sumowanie składników dla E-06 (FR-13).
// Grupuje składniki ze wszystkich dań w planie, sumuje te same jednostki,
// oznacza konfliktem (mergeError) składniki w różnych jednostkach
// bez wspólnego przelicznika. Sortuje według kolejności kategorii.

import type { DayPlan, ShoppingItem } from '../types';
import { SHOPPING_CATEGORIES } from '../data/slots';

export interface RecipeInput {
  slug: string;
  title: string;
  ingredients: Array<{ slug: string; name: string; amount: number; unit: string }>;
}

export interface IngredientMeta {
  name: string;
  unit_default?: string;
  category?: string;
  conversion_to_grams?: number;
  calories_per_100g?: number;
}

const CATEGORY_ORDER = new Map<string, number>(
  SHOPPING_CATEGORIES.map((c, i) => [c, i]),
);

function categoryRank(category: string | undefined): number {
  if (!category) return SHOPPING_CATEGORIES.length;
  return CATEGORY_ORDER.get(category) ?? SHOPPING_CATEGORIES.length;
}

export function buildShoppingList(
  plan: DayPlan,
  recipes: RecipeInput[],
  ingredients: Record<string, IngredientMeta>,
): ShoppingItem[] {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));

  interface Acc {
    ingredientSlug: string;
    name: string;
    unit: string;
    category: string;
    totalAmount: number;
    sources: Array<{ recipeTitle: string; amount: number; unit: string }>;
    mergeError: boolean;
  }

  // Klucz grupowania: slug + jednostka. Ten sam slug w różnych jednostkach
  // daje osobne pozycje (nie sumujemy bez przelicznika).
  const acc = new Map<string, Acc>();
  // Śledzi, w ilu różnych jednostkach wystąpił dany składnik.
  const unitsPerSlug = new Map<string, Set<string>>();

  for (const slot of plan.slots) {
    for (const dish of slot.dishes) {
      const recipe = bySlug.get(dish.recipeSlug);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const meta = ingredients[ing.slug];
        const key = `${ing.slug}|||${ing.unit}`;
        let entry = acc.get(key);
        if (!entry) {
          entry = {
            ingredientSlug: ing.slug,
            name: meta?.name ?? ing.name,
            unit: ing.unit,
            category: meta?.category ?? 'inne',
            totalAmount: 0,
            sources: [],
            mergeError: false,
          };
          acc.set(key, entry);
        }
        entry.totalAmount += ing.amount;
        entry.sources.push({ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit });

        let units = unitsPerSlug.get(ing.slug);
        if (!units) {
          units = new Set();
          unitsPerSlug.set(ing.slug, units);
        }
        units.add(ing.unit);
      }
    }
  }

  // Oznacz konflikty jednostek.
  for (const [slug, units] of unitsPerSlug) {
    if (units.size > 1) {
      for (const entry of acc.values()) {
        if (entry.ingredientSlug === slug) entry.mergeError = true;
      }
    }
  }

  const items: ShoppingItem[] = [...acc.values()].map((e) => ({
    ingredientSlug: e.ingredientSlug,
    name: e.name,
    totalAmount: e.totalAmount,
    unit: e.unit,
    category: e.category,
    sources: e.sources,
    checked: false,
    ...(e.mergeError ? { mergeError: true as const } : {}),
  }));

  items.sort((a, b) => {
    const rank = categoryRank(a.category) - categoryRank(b.category);
    if (rank !== 0) return rank;
    return a.name.localeCompare(b.name, 'pl');
  });

  return items;
}

import type { DayPlan, ShoppingItem } from '../types';
import { SHOPPING_CATEGORIES } from '../data/slots';

interface RecipeIngredient {
  slug: string; name: string; amount: number; unit: string;
}

interface RecipeStub {
  slug: string; title: string; ingredients: RecipeIngredient[];
}

interface IngredientEntry {
  name: string; unit_default: string;
  calories_per_100g?: number; conversion_to_grams?: number;
  category: string;
}

type IngredientsDict = Record<string, IngredientEntry>;

export function buildShoppingList(
  plan: DayPlan,
  recipes: RecipeStub[],
  ingredientsDict: IngredientsDict
): ShoppingItem[] {
  // Zbierz wszystkie składniki ze wszystkich dań
  const itemsMap = new Map<string, ShoppingItem>();

  for (const slot of plan.slots) {
    for (const dish of slot.dishes) {
      const recipe = recipes.find(r => r.slug === dish.recipeSlug);
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const dictEntry = ingredientsDict[ing.slug];
        const existing = itemsMap.get(ing.slug);

        if (existing) {
          // Sprawdź zgodność jednostek
          if (existing.unit === ing.unit) {
            existing.totalAmount += ing.amount;
            existing.sources.push({ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit });
          } else {
            // Spróbuj konwersji na gramy
            const convertedExisting = toGrams(existing.totalAmount, existing.unit, dictEntry);
            const convertedNew = toGrams(ing.amount, ing.unit, dictEntry);

            if (convertedExisting !== null && convertedNew !== null) {
              existing.totalAmount = convertedExisting + convertedNew;
              existing.unit = 'g';
              existing.sources.push({ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit });
            } else {
              // Nie dało się zsumować — dwie osobne pozycje z mergeError
              const errorKey = `${ing.slug}__${ing.unit}`;
              const errorItem: ShoppingItem = {
                ingredientSlug: errorKey,
                name: ing.name,
                totalAmount: ing.amount,
                unit: ing.unit,
                category: dictEntry?.category ?? 'inne',
                sources: [{ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit }],
                checked: false,
                mergeError: true,
              };
              itemsMap.set(errorKey, errorItem);
            }
          }
        } else {
          itemsMap.set(ing.slug, {
            ingredientSlug: ing.slug,
            name: ing.name,
            totalAmount: ing.amount,
            unit: ing.unit,
            category: dictEntry?.category ?? 'inne',
            sources: [{ recipeTitle: recipe.title, amount: ing.amount, unit: ing.unit }],
            checked: false,
          });
        }
      }
    }
  }

  // Sortuj według kolejności kategorii zakupowych
  const items = Array.from(itemsMap.values());
  items.sort((a, b) => {
    const ai = SHOPPING_CATEGORIES.indexOf(a.category as never);
    const bi = SHOPPING_CATEGORIES.indexOf(b.category as never);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return items;
}

function toGrams(
  amount: number,
  unit: string,
  entry: IngredientEntry | undefined
): number | null {
  if (!entry) return null;
  if (unit === 'g') return amount;
  if (unit === 'szt' && entry.conversion_to_grams) {
    return amount * entry.conversion_to_grams;
  }
  return null;
}

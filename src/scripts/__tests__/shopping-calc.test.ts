import { describe, it, expect } from 'vitest';
import { buildShoppingList } from '../shopping-calc';
import type { DayPlan } from '../../types';

const mockIngredients = {
  'cebula': {
    name: 'Cebula', unit_default: 'szt',
    calories_per_100g: 40, conversion_to_grams: 150, category: 'warzywa-owoce',
  },
  'soczewica-czerwona': {
    name: 'Soczewica czerwona', unit_default: 'g',
    calories_per_100g: 358, category: 'suche-produkty',
  },
  'ser-zolty': {
    name: 'Ser żółty', unit_default: 'g',
    calories_per_100g: 380, category: 'nabial',
  },
};

const mockRecipes = [
  {
    slug: 'zapiekanka',
    title: 'Zapiekanka z soczewicą',
    ingredients: [
      { slug: 'soczewica-czerwona', name: 'Soczewica czerwona', amount: 200, unit: 'g' },
      { slug: 'cebula', name: 'Cebula', amount: 1, unit: 'szt' },
      { slug: 'ser-zolty', name: 'Ser żółty', amount: 80, unit: 'g' },
    ],
  },
  {
    slug: 'makaron',
    title: 'Makaron',
    ingredients: [
      { slug: 'cebula', name: 'Cebula', amount: 2, unit: 'szt' },
    ],
  },
];

function makePlan(dishes: Array<{ recipeSlug: string }>): DayPlan {
  return {
    date: '2026-09-05',
    slots: [{
      id: 'slot-1', name: 'obiad', label: 'Obiad',
      dishes: dishes.map(d => ({ recipeSlug: d.recipeSlug, addedAt: Date.now() })),
    }],
  };
}

describe('buildShoppingList — sumowanie (FR-13)', () => {
  it('generuje listę z jednego przepisu', () => {
    const plan = makePlan([{ recipeSlug: 'zapiekanka' }]);
    const list = buildShoppingList(plan, mockRecipes, mockIngredients);
    expect(list.length).toBe(3);
    expect(list.find(i => i.ingredientSlug === 'soczewica-czerwona')?.totalAmount).toBe(200);
  });

  it('sumuje ten sam składnik z dwóch przepisów (ta sama jednostka)', () => {
    const plan = makePlan([
      { recipeSlug: 'zapiekanka' },
      { recipeSlug: 'makaron' },
    ]);
    const list = buildShoppingList(plan, mockRecipes, mockIngredients);
    const cebula = list.find(i => i.ingredientSlug === 'cebula');
    expect(cebula?.totalAmount).toBe(3); // 1 + 2
    expect(cebula?.sources).toHaveLength(2);
  });

  it('sources zawiera informację z jakich przepisów pochodzi (Z-01 ochrona)', () => {
    const plan = makePlan([{ recipeSlug: 'zapiekanka' }, { recipeSlug: 'makaron' }]);
    const list = buildShoppingList(plan, mockRecipes, mockIngredients);
    const cebula = list.find(i => i.ingredientSlug === 'cebula');
    expect(cebula?.sources[0].recipeTitle).toBe('Zapiekanka z soczewicą');
    expect(cebula?.sources[1].recipeTitle).toBe('Makaron');
  });

  it('sortuje pozycje według kolejności kategorii', () => {
    const plan = makePlan([{ recipeSlug: 'zapiekanka' }]);
    const list = buildShoppingList(plan, mockRecipes, mockIngredients);
    const categories = list.map(i => i.category);
    // warzywa-owoce → nabial → suche-produkty
    expect(categories[0]).toBe('warzywa-owoce');
    expect(categories[categories.length - 1]).toBe('suche-produkty');
  });

  it('pusta lista gdy plan bez dań', () => {
    const emptyPlan: DayPlan = {
      date: '2026-09-05',
      slots: [{ id: 'slot-1', name: 'obiad', label: 'Obiad', dishes: [] }],
    };
    const list = buildShoppingList(emptyPlan, mockRecipes, mockIngredients);
    expect(list).toHaveLength(0);
  });
});

describe('buildShoppingList — merge error (różne jednostki)', () => {
  it('tworzy dwie osobne pozycje gdy jednostki nie dają się zsumować', () => {
    const recipesWithMixedUnits = [
      {
        slug: 'r1', title: 'R1',
        ingredients: [{ slug: 'cebula', name: 'Cebula', amount: 200, unit: 'g' }],
      },
      {
        slug: 'r2', title: 'R2',
        ingredients: [{ slug: 'cebula', name: 'Cebula', amount: 1, unit: 'szt' }],
      },
    ];

    // Składnik bez przelicznika jednostek
    const ingredientsNoConversion = {
      'cebula': { name: 'Cebula', unit_default: 'g', category: 'warzywa-owoce' },
    };

    const plan = makePlan([{ recipeSlug: 'r1' }, { recipeSlug: 'r2' }]);
    const list = buildShoppingList(plan, recipesWithMixedUnits, ingredientsNoConversion as any);

    const cebulaItems = list.filter(i => i.name === 'Cebula');
    expect(cebulaItems.length).toBeGreaterThanOrEqual(2);
    expect(cebulaItems.some(i => i.mergeError)).toBe(true);
  });
});

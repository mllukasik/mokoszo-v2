# 06b — Testy: Vitest (unit) + Playwright (e2e)

> **Dlaczego przed implementacją ekranów.**
> Agent musi mieć pętlę zwrotną. Bez testów nie wie, czy kod działa —
> `npm run build` sprawdza tylko TypeScript, nie zachowanie aplikacji.
> Ten krok wykonaj **po 0.5 (przepisy)**, zanim zaczniesz E-04.

---

## Instalacja

```bash
# Vitest — testy jednostkowe
npm install -D vitest @vitest/ui jsdom

# Playwright — testy e2e
npm install -D @playwright/test
npx playwright install chromium  # tylko chromium wystarczy na CI
```

---

## Konfiguracja Vitest

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',   // symuluje DOM (potrzebny dla store.ts)
    globals: true,          // describe/it/expect bez importu
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/scripts/**', 'src/content/**'],
    },
  },
});
```

### Skrypty w `package.json`

```json
{
  "scripts": {
    "dev":        "astro dev",
    "build":      "astro build",
    "preview":    "astro preview",
    "check":      "astro check",
    "test":       "vitest run",
    "test:watch": "vitest",
    "test:ui":    "vitest --ui",
    "test:e2e":   "playwright test",
    "test:all":   "vitest run && playwright test"
  }
}
```

---

## Testy jednostkowe (Vitest)

### `src/scripts/__tests__/store.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEmptyPlan,
  addDishToSlot,
  removeDishFromSlot,
  addSlotToPlan,
  removeSlotFromPlan,
  hasPlanForOtherDate,
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

describe('hasPlanForOtherDate (Q-10)', () => {
  beforeEach(() => localStorageMock.clear());

  it('zwraca null gdy localStorage pusty', () => {
    expect(hasPlanForOtherDate('2026-09-05')).toBeNull();
  });

  it('zwraca null gdy plan na tę samą datę', () => {
    let plan = createEmptyPlan('2026-09-05', ['obiad']);
    plan = addDishToSlot(plan, plan.slots[0].id, 'zapiekanka');
    // addDishToSlot zapisuje do localStorage
    expect(hasPlanForOtherDate('2026-09-05')).toBeNull();
  });

  it('zwraca plan gdy jest na inną datę i ma dania', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    let plan = createEmptyPlan('2026-09-04', ['obiad']);
    plan = addDishToSlot(plan, plan.slots[0].id, 'zapiekanka');
    const conflict = hasPlanForOtherDate('2026-09-05');
    expect(conflict).not.toBeNull();
    expect(conflict?.date).toBe('2026-09-04');
  });

  it('zwraca null gdy plan na inną datę ale pusty', () => {
    uuidCounter = 0;
    localStorageMock.clear();
    // Zapisz pusty plan ręcznie
    const plan = createEmptyPlan('2026-09-04', ['obiad']);
    localStorage.setItem('jutrojem:plan', JSON.stringify(plan));
    expect(hasPlanForOtherDate('2026-09-05')).toBeNull();
  });
});
```

### `src/scripts/__tests__/shopping-calc.test.ts`

```typescript
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
```

### `src/content/__tests__/recipes.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';

// Walidacja frontmatter przepisów bez uruchamiania Astro
// (szybki smoke test przed buildem)

const VALID_SLOTS = ['sniadanie', 'drugie-sniadanie', 'obiad', 'kolacja', 'deser'];

function parseFrontmatter(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`Brak frontmatter: ${filePath}`);
  return parseYaml(match[1]);
}

describe('Przepisy — walidacja frontmatter', async () => {
  const files = await glob('src/content/recipes/*.md');

  it('istnieje co najmniej 10 przepisów', () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  files.forEach(file => {
    const name = file.split('/').pop();

    it(`${name} — ma wymagane pola`, () => {
      const meta = parseFrontmatter(file);
      expect(meta.title, 'brak title').toBeTruthy();
      expect(meta.time_minutes, 'brak time_minutes').toBeGreaterThan(0);
      expect(meta.calories, 'brak calories').toBeGreaterThan(0);
      expect(meta.slots, 'brak slots').toBeInstanceOf(Array);
      expect(meta.ingredients, 'brak ingredients').toBeInstanceOf(Array);
    });

    it(`${name} — title mieści się w 60 znakach`, () => {
      const meta = parseFrontmatter(file);
      expect(meta.title.length).toBeLessThanOrEqual(60);
    });

    it(`${name} — slots są poprawne`, () => {
      const meta = parseFrontmatter(file);
      (meta.slots as string[]).forEach((slot: string) => {
        expect(VALID_SLOTS).toContain(slot);
      });
    });

    it(`${name} — każdy składnik ma slug, name, amount, unit`, () => {
      const meta = parseFrontmatter(file);
      (meta.ingredients as any[]).forEach((ing: any, i: number) => {
        expect(ing.slug, `składnik ${i}: brak slug`).toBeTruthy();
        expect(ing.name, `składnik ${i}: brak name`).toBeTruthy();
        expect(ing.amount, `składnik ${i}: brak amount`).toBeGreaterThan(0);
        expect(ing.unit, `składnik ${i}: brak unit`).toBeTruthy();
      });
    });
  });
});
```

Potrzebujesz `yaml` do parsowania:
```bash
npm install -D yaml glob
```

---

## Testy E2E (Playwright)

### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:4321/mokoszo-v2',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Uruchamiaj serwer przed testami
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321/mokoszo-v2/',
    reuseExistingServer: !process.env.CI,
    // Zbuduj przed startem serwera
    // Dodaj: npm run build && do command jeśli potrzebne na CI
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],  // 360px — podstawowy viewport projektu
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
```

---

### `e2e/home.spec.ts` — strona główna E-09

```typescript
import { test, expect } from '@playwright/test';

test.describe('E-09: Strona główna', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('wyświetla listę przepisów', async ({ page }) => {
    // Co najmniej jeden kafelek przepisu
    await expect(page.locator('ul li').first()).toBeVisible();
  });

  test('wyświetla komunikat o localStorage przy pierwszym wejściu', async ({ page }) => {
    // Czyste localStorage = pierwsze wejście
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByText('Plan zostaje w tej przeglądarce')).toBeVisible();
  });

  test('zamknięcie komunikatu localStorage działa', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Zamknij komunikat').click();
    await expect(page.getByText('Plan zostaje w tej przeglądarce')).not.toBeVisible();
  });

  test('filtrowanie po slocie — obiad', async ({ page }) => {
    const totalBefore = await page.locator('ul li').count();
    await page.getByRole('button', { name: 'Obiad' }).click();
    const totalAfter = await page.locator('ul li').count();
    // Po filtrze jest mniej lub tyle samo przepisów
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    // Licznik w URL
    await expect(page).toHaveURL(/slot=obiad/);
  });

  test('filtry wielokrotne — obiad + deser (OR)', async ({ page }) => {
    await page.getByRole('button', { name: 'Obiad' }).click();
    const countObiad = await page.locator('ul li').count();
    await page.getByRole('button', { name: 'Deser' }).click();
    const countObiadDeser = await page.locator('ul li').count();
    // Więcej lub równo niż sam obiad
    expect(countObiadDeser).toBeGreaterThanOrEqual(countObiad);
  });

  test('wyczyszczenie filtrów przywraca pełną listę', async ({ page }) => {
    const totalAll = await page.locator('ul li').count();
    await page.getByRole('button', { name: 'Obiad' }).click();
    await page.getByText('wyczyść filtry').click();
    const totalAfterClear = await page.locator('ul li').count();
    expect(totalAfterClear).toBe(totalAll);
  });

  test('zero wyników — komunikat z nazwą filtra (nie "brak wyników")', async ({ page }) => {
    // Kliknij filtr czasu (jeśli widoczny — baza >= 20 przepisów), lub symuluj przez URL
    await page.goto('/?slot=sniadanie&czas=20');
    // Jeśli zero wyników — komunikat nie może być generyczny
    const empty = page.getByText('brak wyników');
    await expect(empty).not.toBeVisible();
  });

  test('przycisk "Wybieraj kartami" widoczny i prowadzi do E-04', async ({ page }) => {
    const btn = page.getByText('Wybieraj kartami');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/wybieram/);
  });
});
```

---

### `e2e/cards.spec.ts` — tryb wybierania E-04

```typescript
import { test, expect } from '@playwright/test';

test.describe('E-04: Tryb wybierania', () => {
  test.beforeEach(async ({ page }) => {
    // Zawsze zaczynamy ze świeżym localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/wybieram?date=2026-09-05&slot=slot-test');
  });

  test('wyświetla kartę przepisu', async ({ page }) => {
    await expect(page.locator('article[aria-label]').first()).toBeVisible();
  });

  test('przycisk "Nie dziś" odrzuca kartę i pokazuje następną', async ({ page }) => {
    const firstTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    await page.getByRole('button', { name: 'Nie dziś' }).click();
    // Po odrzuceniu — albo jest nowa karta albo stan pusty
    const newTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    // Albo karta się zmieniła, albo skończyły się karty
    const hasEmpty = await page.getByText(/wszystkie.*przepisów/).isVisible().catch(() => false);
    if (!hasEmpty) {
      expect(newTitle).not.toBe(firstTitle);
    }
  });

  test('klawiatura: strzałka prawo = "Biorę"', async ({ page }) => {
    await page.focus('body');
    await page.keyboard.press('ArrowRight');
    // Po akceptacji — komunikat potwierdzenia
    await expect(page.getByText(/zaplanowany|dodany/i)).toBeVisible({ timeout: 3000 });
  });

  test('klawiatura: strzałka lewo = "Nie dziś"', async ({ page }) => {
    const firstTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    await page.focus('body');
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300); // animacja
    const newTitle = await page.locator('article').first().getAttribute('aria-label');
    const hasEmpty = await page.getByText(/wszystkie.*przepisów/).isVisible().catch(() => false);
    if (!hasEmpty) {
      expect(newTitle).not.toBe(firstTitle);
    }
  });

  test('przycisk "Cofnij" jest nieaktywny na początku', async ({ page }) => {
    const cofnij = page.getByRole('button', { name: 'Cofnij ostatnią decyzję' });
    await expect(cofnij).toBeDisabled();
  });

  test('cofnij przywraca poprzednią kartę', async ({ page }) => {
    const firstTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    await page.getByRole('button', { name: 'Nie dziś' }).click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);
    const restoredTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    expect(restoredTitle).toBe(firstTitle);
  });

  test('filtr slotu jest widoczny gdy podano slot', async ({ page }) => {
    // URL ma slot, więc filtr powinien być widoczny
    await expect(page.getByText('Pokaż wszystkie przepisy')).toBeVisible();
  });

  test('przycisk Zamknij prowadzi z powrotem do planu', async ({ page }) => {
    await page.getByRole('link', { name: 'Zamknij tryb wybierania' }).click();
    await expect(page).toHaveURL(/plan/);
  });

  test('swipe w prawo na mobile = akceptacja', async ({ page }) => {
    // Symulacja swipe przez touch events
    const card = page.locator('#card-current');
    await card.waitFor();

    const box = await card.boundingBox();
    if (!box) return;

    // Swipe prawo > 28% szerokości karty
    const startX = box.x + 30;
    const endX = box.x + box.width * 0.5;
    const midY = box.y + box.height / 3;

    await page.touchscreen.tap(startX, midY);
    await page.mouse.move(startX, midY);
    await page.mouse.down();
    await page.mouse.move(endX, midY, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(400);
    // Po swipe prawo — potwierdzenie lub nowa karta
    const confirmed = await page.getByText(/zaplanowany|dodany/i).isVisible().catch(() => false);
    const newCard = await page.locator('#card-current').isVisible().catch(() => false);
    expect(confirmed || newCard).toBe(true);
  });
});
```

---

### `e2e/plan.spec.ts` — plan dnia E-03

```typescript
import { test, expect } from '@playwright/test';

test.describe('E-03: Plan dnia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('wyświetla puste sloty dla nowego dnia', async ({ page }) => {
    await page.goto('/plan?date=2026-09-05');
    await expect(page.getByText('Wybierz przepis').first()).toBeVisible();
  });

  test('pusty slot ma link do trybu wybierania', async ({ page }) => {
    await page.goto('/plan?date=2026-09-05');
    const link = page.getByRole('link', { name: 'Wybierz przepis' }).first();
    await expect(link).toHaveAttribute('href', /wybieram/);
  });

  test('suma kalorii dnia widoczna gdy coś zaplanowane', async ({ page }) => {
    // Wstrzyknij plan do localStorage
    await page.evaluate(() => {
      const plan = {
        date: '2026-09-05',
        slots: [{
          id: 'slot-1', name: 'obiad', label: 'Obiad',
          dishes: [{ recipeSlug: 'zapiekanka-z-soczewica', addedAt: Date.now() }],
        }],
      };
      localStorage.setItem('jutrojem:plan', JSON.stringify(plan));
    });
    await page.goto('/plan?date=2026-09-05');
    await expect(page.getByText(/kcal/)).toBeVisible();
  });

  test('przycisk "Zrób listę zakupów" widoczny gdy plan niepusty', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('jutrojem:plan', JSON.stringify({
        date: '2026-09-05',
        slots: [{
          id: 's1', name: 'obiad', label: 'Obiad',
          dishes: [{ recipeSlug: 'zapiekanka-z-soczewica', addedAt: Date.now() }],
        }],
      }));
    });
    await page.goto('/plan?date=2026-09-05');
    await expect(page.getByText('Zrób listę zakupów')).toBeVisible();
  });

  test('Q-10: zmiana daty przy niepustym planie pokazuje ostrzeżenie', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('jutrojem:plan', JSON.stringify({
        date: '2026-09-04',
        slots: [{
          id: 's1', name: 'obiad', label: 'Obiad',
          dishes: [{ recipeSlug: 'zapiekanka-z-soczewica', addedAt: Date.now() }],
        }],
      }));
    });
    await page.goto('/plan?date=2026-09-05');
    await expect(page.getByText(/zaplanowane.*posiłków/i)).toBeVisible();
  });
});
```

---

### `e2e/shopping.spec.ts` — lista zakupów E-06

```typescript
import { test, expect } from '@playwright/test';

function injectPlan(page: any, recipeSlug: string) {
  return page.evaluate((slug: string) => {
    localStorage.setItem('jutrojem:plan', JSON.stringify({
      date: '2026-09-05',
      slots: [{
        id: 's1', name: 'obiad', label: 'Obiad',
        dishes: [{ recipeSlug: slug, addedAt: Date.now() }],
      }],
    }));
  }, recipeSlug);
}

test.describe('E-06: Lista zakupów', () => {
  test('brak planu — komunikat z CTA do planu', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/zakupy?date=2026-09-05');
    await expect(page.getByText('Nic nie zaplanowano')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Idź do planu' })).toBeVisible();
  });

  test('lista zawiera składniki z przepisu', async ({ page }) => {
    await injectPlan(page, 'zapiekanka-z-soczewica');
    await page.goto('/zakupy?date=2026-09-05');
    // Przynajmniej jeden składnik widoczny
    await expect(page.locator('ul li label').first()).toBeVisible();
  });

  test('odhaczenie składnika zaznacza checkbox', async ({ page }) => {
    await injectPlan(page, 'zapiekanka-z-soczewica');
    await page.goto('/zakupy?date=2026-09-05');
    const firstCheckbox = page.locator('input[type=checkbox]').first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();
  });

  test('odhaczenie przeżywa odświeżenie strony (localStorage)', async ({ page }) => {
    await injectPlan(page, 'zapiekanka-z-soczewica');
    await page.goto('/zakupy?date=2026-09-05');
    const firstLabel = page.locator('label').first();
    await firstLabel.click();
    await page.reload();
    const checkbox = page.locator('input[type=checkbox]').first();
    await expect(checkbox).toBeChecked();
  });

  test('postęp "X z Y odhaczone" aktualizuje się', async ({ page }) => {
    await injectPlan(page, 'zapiekanka-z-soczewica');
    await page.goto('/zakupy?date=2026-09-05');
    const total = await page.locator('input[type=checkbox]').count();
    await page.locator('input[type=checkbox]').first().check();
    await expect(page.getByText(`1 z ${total} odhaczone`)).toBeVisible();
  });

  test('nagłówek z datą jest przyklejony (sticky)', async ({ page }) => {
    await injectPlan(page, 'zapiekanka-z-soczewica');
    await page.goto('/zakupy?date=2026-09-05');
    const header = page.locator('header.sticky');
    await expect(header).toBeVisible();
  });
});
```

---

## CI — aktualizacja `deploy.yml`

Dodaj job `test` przed `build`:

```yaml
jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm install -D yaml glob   # potrzebne do recipe.test.ts
      - name: Unit tests (Vitest)
        run: npm run test
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Build (wymagany przez preview w e2e)
        run: npm run build
      - name: E2E tests (Playwright)
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build:
    name: Build
    needs: test    # ← deploy tylko gdy testy przeszły
    runs-on: ubuntu-latest
    # ... reszta bez zmian
```

---

## Lista kontrolna — testy gotowe gdy

- [ ] `npm test` przechodzi: 0 failów (store + shopping-calc + recipe validation)
- [ ] `npm run test:e2e` przechodzi na Mobile Chrome i Desktop Chrome
- [ ] Testy przepisów walidują frontmatter wszystkich 10 plików `.md`
- [ ] W CI: job `test` blokuje `build` gdy testy failują
- [ ] Playwright zostawia screenshot przy failurze (`screenshot: 'only-on-failure'`)
- [ ] `playwright-report/` jako artifact w CI (do debugowania)

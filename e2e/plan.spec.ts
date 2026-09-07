import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

// Wstrzyknięcie planu wymaga załadowanej strony z tego samego origin.
async function injectPlan(page: Page, baseURL: string | undefined, plan: unknown) {
  await goto(page, baseURL, '/');
  await page.evaluate((p) => {
    localStorage.setItem('jutrojem:plan', JSON.stringify(p));
  }, plan);
}

function planWithDish(date: string, recipeSlug: string) {
  return {
    date,
    slots: [{
      id: 'slot-1', name: 'obiad', label: 'Obiad',
      dishes: [{ recipeSlug, addedAt: Date.now() }],
    }],
  };
}

test.describe('E-03: Plan dnia', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
    await page.evaluate(() => localStorage.clear());
  });

  test('wyświetla puste sloty dla nowego dnia', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByText('Wybierz przepis').first()).toBeVisible();
  });

  test('pusty slot ma link do trybu wybierania', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/plan?date=2026-09-05');
    const link = page.getByRole('link', { name: 'Wybierz przepis' }).first();
    await expect(link).toHaveAttribute('href', /wybieram/);
  });

  test('suma kalorii dnia widoczna gdy coś zaplanowane', async ({ page, baseURL }) => {
    // Wstrzyknij plan do localStorage
    await injectPlan(page, baseURL, planWithDish('2026-09-05', 'zapiekanka-z-soczewica'));
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByText(/kcal/)).toBeVisible();
  });

  test('przycisk "Zrób listę zakupów" widoczny gdy plan niepusty', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, planWithDish('2026-09-05', 'zapiekanka-z-soczewica'));
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByText('Zrób listę zakupów')).toBeVisible();
  });

  test('Q-10: zmiana daty przy niepustym planie pokazuje ostrzeżenie', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, planWithDish('2026-09-04', 'zapiekanka-z-soczewica'));
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByText(/zaplanowane.*posiłków/i)).toBeVisible();
  });
});

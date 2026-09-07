import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

async function injectPlan(page: Page, baseURL: string | undefined, plan: unknown) {
  await goto(page, baseURL, '/');
  await page.evaluate((p) => {
    localStorage.setItem('jutrojem:plan', JSON.stringify(p));
  }, plan);
}

test.describe('E-08: Stany brzegowe', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
    await page.evaluate(() => localStorage.clear());
  });

  test('404 prowadzi do strony głównej', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/nie-ma-takiej-strony-xyz');
    await expect(page.getByRole('heading', { name: 'Tej strony nie ma' })).toBeVisible();
    const back = page.getByRole('link', { name: 'Wróć do przepisów' });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/?(\?.*)?$/);
  });

  test('pula wyczerpana z filtrem — powrót do pełnej puli', async ({ page, baseURL }) => {
    // Jedyny przepis ze zdjęciem to obiad/kolacja — filtr "deser" daje pustą pulę.
    await goto(page, baseURL, '/wybieram?date=2026-09-05&slot=deser');
    await expect(page.getByText(/Obejrzałeś wszystkie/)).toBeVisible();
    await page.locator('#btn-remove-filter-empty').click();
    // Po zdjęciu filtra widać kartę przepisu
    await expect(page.locator('#card-current')).toBeVisible();
  });

  test('pula wyczerpana bez filtra — od nowa lub lista', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/wybieram?date=2026-09-05');
    await expect(page.locator('#card-current')).toBeVisible();
    await page.getByRole('button', { name: 'Nie dziś' }).click();
    await expect(page.getByText(/To wszystkie/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zacznij od nowa' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Przeglądaj listę' })).toBeVisible();
    // "Zacznij od nowa" przywraca kartę
    await page.getByRole('button', { name: 'Zacznij od nowa' }).click();
    await expect(page.locator('#card-current')).toBeVisible();
  });

  test('niepełna suma kalorii — oznaczenie tekstowe i wyjaśnienie', async ({ page, baseURL }) => {
    // Znane danie (520 kcal) + nieznany slug (0 kcal) = suma niepełna (R-06)
    await injectPlan(page, baseURL, {
      date: '2026-09-05',
      slots: [{
        id: 'slot-1', name: 'obiad', label: 'Obiad',
        dishes: [
          { recipeSlug: 'zapiekanka-z-soczewica', addedAt: Date.now() },
          { recipeSlug: 'nieistniejacy-przepis', addedAt: Date.now() },
        ],
      }],
    });
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByText(/suma niepełna/).first()).toBeVisible();
    const why = page.getByRole('button', { name: 'Dlaczego?' }).first();
    await expect(why).toHaveAttribute('aria-expanded', 'false');
    await why.click();
    await expect(why).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#incomplete-explanation-day')).toBeVisible();
    await expect(page.locator('#incomplete-explanation-day')).toContainText(/nie ma jeszcze podanej kaloryczności/);
  });

  test('zakupy działają offline — widoczna informacja', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, {
      date: '2026-09-05',
      slots: [{
        id: 's1', name: 'obiad', label: 'Obiad',
        dishes: [{ recipeSlug: 'zapiekanka-z-soczewica', addedAt: Date.now() }],
      }],
    });
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    await expect(page.getByText(/działa bez internetu/)).toBeVisible();
  });

  test('przepis bez zdjęcia nie blokuje strony głównej', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
    // Większość przepisów nie ma zdjęcia — kafelki pokazują zastępnik
    await expect(page.getByText('🍽️').first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Owsianka z jabłkiem i cynamonem' }),
    ).toBeVisible();
  });
});

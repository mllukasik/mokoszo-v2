import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

// Wstrzyknięcie planu wymaga załadowanej strony z tego samego origin.
function injectPlan(page: Page, baseURL: string | undefined, recipeSlug: string) {
  return (async () => {
    await goto(page, baseURL, '/');
    await page.evaluate((slug: string) => {
      localStorage.setItem('jutrojem:plan', JSON.stringify({
        date: '2026-09-05',
        slots: [{
          id: 's1', name: 'obiad', label: 'Obiad',
          dishes: [{ recipeSlug: slug, addedAt: Date.now() }],
        }],
      }));
    }, recipeSlug);
  })();
}

test.describe('E-06: Lista zakupów', () => {
  test('brak planu — komunikat z CTA do planu', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
    await page.evaluate(() => localStorage.clear());
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    await expect(page.getByText('Nic nie zaplanowano')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Idź do planu' })).toBeVisible();
  });

  test('lista zawiera składniki z przepisu', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, 'zapiekanka-z-soczewica');
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    // Przynajmniej jeden składnik widoczny
    await expect(page.locator('ul li label').first()).toBeVisible();
  });

  test('odhaczenie składnika zaznacza checkbox', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, 'zapiekanka-z-soczewica');
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    const firstCheckbox = page.locator('input[type=checkbox]').first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();
  });

  test('odhaczenie przeżywa odświeżenie strony (localStorage)', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, 'zapiekanka-z-soczewica');
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    const firstLabel = page.locator('label').first();
    await firstLabel.click();
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    const checkbox = page.locator('input[type=checkbox]').first();
    await expect(checkbox).toBeChecked();
  });

  test('postęp "X z Y odhaczone" aktualizuje się', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, 'zapiekanka-z-soczewica');
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    const total = await page.locator('input[type=checkbox]').count();
    await page.locator('input[type=checkbox]').first().check();
    await expect(page.getByText(`1 z ${total} odhaczone`)).toBeVisible();
  });

  test('nagłówek z datą jest przyklejony (sticky)', async ({ page, baseURL }) => {
    await injectPlan(page, baseURL, 'zapiekanka-z-soczewica');
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    const header = page.locator('header.sticky');
    await expect(header).toBeVisible();
  });
});

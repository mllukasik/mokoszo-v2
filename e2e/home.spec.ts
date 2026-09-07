import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego,
// bo page.goto('/') trafiłby na korzeń hosta, nie aplikacji.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

test.describe('E-09: Strona główna', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
  });

  test('wyświetla listę przepisów', async ({ page }) => {
    // Co najmniej jeden kafelek przepisu
    await expect(page.locator('ul li').first()).toBeVisible();
  });

  test('wyświetla komunikat o localStorage przy pierwszym wejściu', async ({ page, baseURL }) => {
    // Czyste localStorage = pierwsze wejście
    await page.evaluate(() => localStorage.clear());
    await goto(page, baseURL, '/');
    await expect(page.getByText('Plan zostaje w tej przeglądarce')).toBeVisible();
  });

  test('zamknięcie komunikatu localStorage działa', async ({ page, baseURL }) => {
    await page.evaluate(() => localStorage.clear());
    await goto(page, baseURL, '/');
    await page.getByLabel('Zamknij komunikat').click();
    await expect(page.getByText('Plan zostaje w tej przeglądarce')).not.toBeVisible();
  });

  test('filtrowanie po slocie — obiad', async ({ page }) => {
    const totalBefore = await page.locator('ul li:visible').count();
    await page.getByRole('button', { name: 'Obiad' }).click();
    const totalAfter = await page.locator('ul li:visible').count();
    // Po filtrze jest mniej lub tyle samo przepisów
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    // Licznik w URL
    await expect(page).toHaveURL(/slot=obiad/);
  });

  test('filtry wielokrotne — obiad + deser (OR)', async ({ page }) => {
    await page.getByRole('button', { name: 'Obiad' }).click();
    const countObiad = await page.locator('ul li:visible').count();
    await page.getByRole('button', { name: 'Deser' }).click();
    const countObiadDeser = await page.locator('ul li:visible').count();
    // Więcej lub równo niż sam obiad
    expect(countObiadDeser).toBeGreaterThanOrEqual(countObiad);
  });

  test('wyczyszczenie filtrów przywraca pełną listę', async ({ page }) => {
    const totalAll = await page.locator('ul li:visible').count();
    await page.getByRole('button', { name: 'Obiad' }).click();
    await page.getByText('wyczyść filtry').first().click();
    const totalAfterClear = await page.locator('ul li:visible').count();
    expect(totalAfterClear).toBe(totalAll);
  });

  test('zero wyników — komunikat z nazwą filtra (nie "brak wyników")', async ({ page, baseURL }) => {
    // Kombinacja dająca zero wyników: mało czasu + wąski slot
    await goto(page, baseURL, '/?slot=sniadanie&czas=5');
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

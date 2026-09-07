import { test, expect } from '@playwright/test';

// baseURL jest ustawione w playwright.config.ts (z BASE_PATH env lub domyślnie /mokoszo-v2)
// Używamy baseURL z fixture zamiast '/' — nawigacja do korzenia projektu

test.describe('Smoke test — podstawowa nawigacja', () => {
  test('strona główna ładuje się', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await expect(page).toHaveTitle(/Jutro jem/);
  });
});

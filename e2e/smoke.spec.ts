import { test, expect } from '@playwright/test';

// baseURL jest ustawione w playwright.config.ts (z BASE_PATH env lub domyślnie /mokoszo-v2)
// page.goto('/') wystarczy — nie hardcodujemy ścieżki tutaj

test.describe('Smoke test — podstawowa nawigacja', () => {
  test('strona główna ładuje się', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Jutro jem/);
  });
});

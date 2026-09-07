import { test, expect } from '@playwright/test';

const BASE = '/mokoszo-v2';

test.describe('Smoke test — podstawowa nawigacja', () => {
  test('strona główna ładuje się', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveTitle(/Jutro jem/);
  });
});

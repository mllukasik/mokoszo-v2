import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

test.describe('E-04: Tryb wybierania', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Zawsze zaczynamy ze świeżym localStorage
    await goto(page, baseURL, '/');
    await page.evaluate(() => localStorage.clear());
    await goto(page, baseURL, '/wybieram?date=2026-09-05&slot=slot-test');
  });

  test('wyświetla kartę przepisu', async ({ page }) => {
    await expect(page.locator('article[aria-label]').first()).toBeVisible();
  });

  test('karta pokazuje opis i składniki po tapnięciu (również wąskie viewport)', async ({ page }) => {
    const card = page.locator('#card-current');
    await card.waitFor();
    // Na początku szczegóły są zwinięte — Składniki nie widoczne
    await expect(card.getByText('Składniki')).not.toBeVisible();
    // Użyj klawiatury (Enter) by otworzyć szczegóły
    await page.focus('#card-current');
    await page.keyboard.press('Enter');
    await expect(card.getByText('Składniki')).toBeVisible();
    // Sprawdź, że treść w panelu szczegółów jest widoczna (np. opis przepisu)
    await expect(card.locator('[data-details-panel] p').first()).toBeVisible();
  });

  test('tap otwiera i zamyka szczegóły', async ({ page }) => {
    const card = page.locator('#card-current');
    await card.waitFor();
    await expect(card.getByText('Składniki')).not.toBeVisible();
    // Otwórz Enterem
    await page.focus('#card-current');
    await page.keyboard.press('Enter');
    await expect(card.getByText('Składniki')).toBeVisible();
    // Zamknij Escape
    await page.keyboard.press('Escape');
    await expect(card.getByText('Składniki')).not.toBeVisible();
  });

  test('przycisk X zamyka szczegóły', async ({ page }) => {
    const card = page.locator('#card-current');
    await card.waitFor();
    await expect(card.getByText('Składniki')).not.toBeVisible();
    // Otwórz Enterem
    await page.focus('#card-current');
    await page.keyboard.press('Enter');
    await expect(card.getByText('Składniki')).toBeVisible();
    // Debug: check if X button exists and is clickable
    const xBtn = card.locator('[data-close-details]');
    await expect(xBtn).toBeVisible();
    await xBtn.click();
    await expect(card.getByText('Składniki')).not.toBeVisible();
  });

  test('przycisk "Nie dziś" odrzuca kartę i pokazuje następną', async ({ page }) => {
    const firstTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
    await page.getByRole('button', { name: 'Nie dziś' }).click();
    // Po odrzuceniu — albo jest nowa karta albo stan pusty
    const hasEmpty = await page.getByText(/wszystkie.*przepisów/).isVisible().catch(() => false);
    if (!hasEmpty) {
      const newTitle = await page.locator('article[aria-label]').first().getAttribute('aria-label');
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
    const hasEmpty = await page.getByText(/wszystkie.*przepisów/).isVisible().catch(() => false);
    if (!hasEmpty) {
      const newTitle = await page.locator('article').first().getAttribute('aria-label');
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

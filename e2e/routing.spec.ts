import { test, expect, type Page } from '@playwright/test';

// baseURL zawiera już base path (/mokoszo-v2) — buduj URL-e względem niego,
// bo page.goto('/plan') trafiłby na korzeń hosta, nie aplikacji.
async function goto(page: Page, baseURL: string | undefined, path: string) {
  const base = (baseURL ?? '').replace(/\/$/, '');
  await page.goto(`${base}${path}`);
}

test.describe('Routing i nawigacja (krok 0.4)', () => {
  test('pasek dolny widoczny na każdej stronie z poprawnym aria-current', async ({
    page,
    baseURL,
  }) => {
    await goto(page, baseURL, '/');
    const nav = page.getByRole('navigation', { name: 'Nawigacja główna' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Przepisy' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(
      page.getByRole('navigation', { name: 'Nawigacja główna' }).getByRole('link', { name: 'Plan' }),
    ).toHaveAttribute('aria-current', 'page');

    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    await expect(
      page
        .getByRole('navigation', { name: 'Nawigacja główna' })
        .getByRole('link', { name: 'Zakupy' }),
    ).toHaveAttribute('aria-current', 'page');

    await goto(page, baseURL, '/ustawienia');
    await expect(
      page.getByRole('navigation', { name: 'Nawigacja główna' }).getByRole('link', { name: 'Więcej' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('meta base-url obecna na każdej stronie', async ({ page, baseURL }) => {
    for (const url of ['/', '/plan?date=2026-09-05', '/zakupy?date=2026-09-05', '/ustawienia']) {
      await goto(page, baseURL, url);
      const content = await page.getAttribute('meta[name="base-url"]', 'content');
      expect(content).toBeTruthy();
    }
  });

  test('plan czyta ?date= i linkuje do wybierania oraz zakupów', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/plan?date=2026-09-05');
    await expect(page.getByTestId('plan-date')).toHaveText('2026-09-05');
    await expect(page.getByTestId('pick-obiad')).toHaveAttribute(
      'href',
      /wybieram\?date=2026-09-05&slot=obiad/,
    );
    await expect(page.getByTestId('goto-shopping')).toHaveAttribute(
      'href',
      /zakupy\?date=2026-09-05/,
    );
  });

  test('powrót z hash-em podświetla slot', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/plan?date=2026-09-05#slot-obiad');
    const slot = page.locator('#slot-obiad');
    await expect(slot).toBeVisible();
    await expect(slot).toHaveClass(/slot--just-updated/);
  });

  test('wybieram czyta ?date= i ?slot=, zamknięcie wraca do planu', async ({
    page,
    baseURL,
  }) => {
    await goto(page, baseURL, '/wybieram?date=2026-09-05&slot=obiad');
    // Filtr slotu odczytany z parametru ?slot=obiad (E-04, krok 1.1)
    await expect(page.getByText('Filtr: Obiad')).toBeVisible();
    await expect(page.getByText('Pokaż wszystkie przepisy').first()).toBeVisible();
    // Licznik puli widoczny od początku
    await expect(page.getByText(/z \d+ przepisów/)).toBeVisible();

    const close = page.getByRole('link', { name: 'Zamknij tryb wybierania' });
    await expect(close).toHaveAttribute('href', /plan\?date=2026-09-05/);
    await close.click();
    await expect(page).toHaveURL(/plan\?date=2026-09-05/);
  });

  test('zakupy czytają ?date= i linkują do planu', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/zakupy?date=2026-09-05');
    await expect(page.getByTestId('shopping-date')).toHaveText('2026-09-05');
    await expect(page.getByTestId('back-to-plan')).toHaveAttribute(
      'href',
      /plan\?date=2026-09-05/,
    );
  });

  test('strona główna linkuje do trybu wybierania i do przepisu', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/');
    await expect(page.getByTestId('start-picker')).toHaveAttribute('href', /wybieram\?date=/);
    const recipeLink = page.getByRole('link', { name: 'Zapiekanka z soczewicą i pieczarkami' });
    await expect(recipeLink).toBeVisible();
    await expect(recipeLink).toHaveAttribute('href', /przepis\/zapiekanka-z-soczewica/);
  });

  test('przepis pod własnym adresem renderuje treść', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/przepis/zapiekanka-z-soczewica');
    await expect(
      page.getByRole('heading', { name: 'Zapiekanka z soczewicą i pieczarkami' }),
    ).toBeVisible();
  });

  test('dane przepisów wbudowane jako JSON', async ({ page, baseURL }) => {
    await goto(page, baseURL, '/plan?date=2026-09-05');
    const raw = await page.textContent('#recipes-data');
    const data = JSON.parse(raw ?? '[]');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data[0].slug).toBeTruthy();
  });
});

# 13 — GitHub Pages: autodeploy

---

## GitHub Actions workflow

Plik: **`.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:  # pozwala uruchomić ręcznie z GitHub UI

# Uprawnienia do publikowania na GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Jeden deploy na raz
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Unit tests (Vitest)
        run: npm run test

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build (potrzebny do e2e preview)
        run: npm run build

      - name: E2E tests (Playwright)
        run: npm run test:e2e

      - name: Upload Playwright report on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build:
    name: Build
    needs: test        # ← deploy tylko gdy testy przeszły
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build with Astro
        run: npm run build
        # Astro wczyta astro.config.mjs automatycznie

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Konfiguracja GitHub Pages w repozytorium

1. Wejdź na GitHub → repo `mokoszo-v2` → **Settings** → **Pages**
2. W sekcji **Source** wybierz **GitHub Actions** (nie branch!)
3. Zapisz

Po pierwszym pushu na `main` workflow uruchomi się automatycznie.
URL aplikacji: `https://mllukasik.github.io/mokoszo-v2/`

---

## `astro.config.mjs` — przypomnienie

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mllukasik.github.io',
  base: '/mokoszo-v2',   // ← kluczowe dla poprawnych linków
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false })],
});
```

> `base: '/mokoszo-v2'` powoduje, że Astro generuje wszystkie linki i assety
> z prefiksem `/mokoszo-v2/`. **Nie zmieniaj tego** bez zmiany nazwy repo lub custom domeny.

---

## Weryfikacja lokalnego buildu przed pushem

```bash
# Zbuduj lokalnie
npm run build

# Sprawdź podgląd
npm run preview
# → otwiera http://localhost:4321/mokoszo-v2/
# → sprawdź: strona główna, filtrowanie, przejście do E-04, E-03, E-05

# Sprawdź TypeScript
npx astro check
```

---

## `package.json` — skrypty

```json
{
  "scripts": {
    "dev":        "astro dev",
    "build":      "astro build",
    "preview":    "astro preview",
    "check":      "astro check",
    "test":       "vitest run",
    "test:watch": "vitest",
    "test:e2e":   "playwright test",
    "test:all":   "vitest run && playwright test"
  }
}
```

---

## Lista kontrolna deploy

- [ ] `astro.config.mjs` ma `base: '/mokoszo-v2'` i `site: 'https://mllukasik.github.io'`
- [ ] `import.meta.env.BASE_URL` użyte wszędzie zamiast hardcoded `/mokoszo-v2/`
- [ ] `.github/workflows/deploy.yml` istnieje w repo
- [ ] GitHub Pages → Source → **GitHub Actions** (nie branch)
- [ ] `npm run test` — 0 failów lokalnie
- [ ] `npm run test:e2e` — 0 failów lokalnie
- [ ] `npm run build` kończy się bez błędów
- [ ] `npx astro check` kończy się bez błędów TypeScript
- [ ] Po pushu na `main`: Actions tab — job **test** zielony, potem **build**, potem **deploy**
- [ ] `https://mllukasik.github.io/mokoszo-v2/` otwiera stronę główną
- [ ] Linki między ekranami działają na GitHub Pages (nie tylko lokalnie)
- [ ] Zdjęcia przepisów ładują się poprawnie (`public/images/`)

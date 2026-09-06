# 01 — Inicjalizacja projektu

## Tech stack

| Element | Wybór | Uzasadnienie |
|---------|-------|--------------|
| Framework | **Astro 4** | Static output, wbudowane Content Collections dla MD, file-based routing |
| Style | **Tailwind CSS 3** + CSS Variables | Tailwind do układu/spacing, zmienne CSS dla tokenów koloru i typografii |
| Przepisy | **Astro Content Collections** | Natywny parser MD z walidacją Zod, `getCollection()` w buildzie |
| Interaktywność | **Vanilla TS** jako Astro Islands | Tylko tam gdzie trzeba (swipe cards E-04, filtry E-09, odhaczanie E-06) |
| Stan | **localStorage** | Brak serwera, zgodnie z wymaganiami |
| Routing | **Astro file-based** + URL params JS | Statyczne strony `.astro`; daty/sloty czytane client-side z URLSearchParams |
| Build output | **static** (`output: 'static'`) | GitHub Pages |
| Fonty | **Google Fonts** | Archivo + Source Serif 4 (z dokumentacji) |

---

## Inicjalizacja

```bash
cd /home/pilot/Projects/mokoszo/workdir

# Astro z pustym templatem
npm create astro@latest . -- --template minimal --typescript strict --no-install
npm install

# Tailwind (oficjalny integration)
npx astro add tailwind --yes

# Nie dodajemy żadnych UI frameworków (React/Vue/Svelte) — Vanilla TS
```

---

## Struktura katalogów (docelowa)

```
workdir/
  public/
    images/                    ← zdjęcia przepisów (dodaje redakcja)
      zapiekanka-z-soczewica.jpg
      …
  src/
    content/
      config.ts                ← Astro Content Collections schema (Zod)
      recipes/                 ← PLIKI MD PRZEPISÓW
        zapiekanka-z-soczewica.md
        owsianka-z-jablkiem.md
        … (10 plików)
    data/
      ingredients.json         ← słownik składników (nazwa, kcal, jednostka, kategoria)
      slots.ts                 ← stałe definicje SlotTag
    layouts/
      Base.astro               ← <html>, fonty, tokeny CSS, Tailwind
      App.astro                ← Base + nav bar dolny
    pages/
      index.astro              ← E-09: strona główna / katalog
      plan.astro               ← E-03: dzień (date z URLSearchParams client-side)
      wybieram.astro           ← E-04: tryb wybierania (params client-side)
      zakupy.astro             ← E-06: lista zakupów
      ustawienia.astro         ← E-07: ustawienia
      przepis/
        [slug].astro           ← E-05: strona przepisu (statycznie generowana)
      404.astro                ← strona błędu / stany brzegowe E-08
    components/
      NavBar.astro             ← pasek dolny (Przepisy / Plan / Zakupy / Więcej)
      RecipeTile.astro         ← kafelek katalogu (E-09) — inny niż karta!
      RecipeCard.ts            ← ISLAND: karta swipe (E-04) — client:load
      Filters.ts               ← ISLAND: filtry wielokrotne (E-09) — client:load
      SlotList.ts              ← ISLAND: sloty dnia (E-03) — client:load
      ShoppingList.ts          ← ISLAND: odhaczanie (E-06) — client:load
    scripts/
      store.ts                 ← localStorage (plan, ustawienia, odhaczenie)
      shopping-calc.ts         ← sumowanie składników dla E-06
      calories.ts              ← obliczenia kalorii
    styles/
      tokens.css               ← CSS Custom Properties (design tokens)
      global.css               ← import Tailwind + tokeny + reset
  astro.config.mjs
  tailwind.config.mjs
  tsconfig.json
  package.json
  .github/
    workflows/
      deploy.yml               ← GitHub Actions → GitHub Pages
```

---

## astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mllukasik.github.io',
  base: '/mokoszo-v2',      // ← musi być zgodne z nazwą repo
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,  // używamy własnego global.css
    }),
  ],
});
```

---

## tailwind.config.mjs

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      // Mapujemy tokeny CSS na klasy Tailwind
      colors: {
        porcelana:    'var(--porcelana)',
        biel:         'var(--biel)',
        kreska:       'var(--kreska)',
        ink:          'var(--ink)',
        'ink-2':      'var(--ink-2)',
        'emalia-900': 'var(--emalia-900)',
        'emalia-800': 'var(--emalia-800)',
        'emalia-500': 'var(--emalia-500)',
        'na-emalii':  'var(--na-emalii)',
        'na-emalii-2':'var(--na-emalii-2)',
        kurkuma:      'var(--kurkuma)',
        'kurkuma-tekst':  'var(--kurkuma-tekst)',
        'kurkuma-tint':   'var(--kurkuma-tint)',
        tak:          'var(--tak)',
        'tak-tint':   'var(--tak-tint)',
        nie:          'var(--nie)',
        'nie-tint':   'var(--nie-tint)',
      },
      fontFamily: {
        ui:    ['Archivo', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        prose: ['Source Serif 4', 'Georgia', 'serif'],
      },
      borderRadius: {
        s:     '6px',
        m:     '12px',
        l:     '22px',
        karta: '26px',
      },
      minHeight: {
        touch: '48px',   // cel dotykowy minimum
      },
    },
  },
  plugins: [],
};
```

---

## src/styles/tokens.css

```css
:root {
  /* ——— baza ——— */
  --porcelana: #EEF1EA;
  --biel: #FFFFFF;
  --kreska: #D6DCD4;
  --kreska-mocna: #C2CCC0;

  /* ——— atrament ——— */
  --ink: #0E2430;
  --ink-2: #4A6270;
  --ink-3: #5E7480;

  /* ——— emalia ——— */
  --emalia-900: #0E2430;
  --emalia-800: #11303F;
  --emalia-700: #14384A;
  --emalia-500: #1F5C74;
  --na-emalii: #EEF1EA;
  --na-emalii-2: #A8BBC4;

  /* ——— kurkuma ——— */
  --kurkuma: #E5A11F;
  --kurkuma-tekst: #7A5000;
  --kurkuma-tint: #FBEBC8;

  /* ——— decyzje ——— */
  --tak: #2A6E45;
  --tak-jasny: #6FCB95;
  --tak-tint: #DDEEE2;
  --nie: #9C3453;
  --nie-jasny: #E2809B;
  --nie-tint: #F6DEE5;

  /* ——— cienie ——— */
  --cien-1: 0 1px 2px rgba(14,36,48,.10);
  --cien-2: 0 6px 20px -8px rgba(14,36,48,.28);
  --cien-noc: 0 18px 44px -14px rgba(0,0,0,.6);

  /* ——— layout ——— */
  --nav-height: 56px;
}
```

## src/styles/global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens.css';

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    @apply bg-porcelana text-ink font-ui;
    font-size: 16px;
    line-height: 1.55;
  }
  img { @apply block max-w-full; }
  button { @apply cursor-pointer font-ui; }
  :focus-visible {
    outline: 3px solid var(--kurkuma);
    outline-offset: 2px;
    border-radius: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

## src/layouts/Base.astro

```astro
---
export interface Props {
  title?: string;
  description?: string;
}
const {
  title = 'Jutro jem — planer posiłków',
  description = 'Planuj posiłki, wybierając przepisy kartami.',
} = Astro.props;

const base = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
    rel="stylesheet"
  />
  <link rel="stylesheet" href={`${base}/src/styles/global.css`} />
</head>
<body class="min-h-dvh">
  <slot />
</body>
</html>
```

## src/layouts/App.astro

```astro
---
import Base from './Base.astro';
import NavBar from '../components/NavBar.astro';
export interface Props { title?: string; currentNav?: 'przepisy' | 'plan' | 'zakupy' | 'wiecej'; }
const { title, currentNav = 'przepisy' } = Astro.props;
---
<Base title={title}>
  <div class="flex flex-col min-h-dvh">
    <main id="screen" class="flex-1 overflow-y-auto pb-[var(--nav-height)]">
      <slot />
    </main>
    <NavBar current={currentNav} />
  </div>
</Base>
```

---

## Weryfikacja po tym kroku

```bash
npm run dev
# → http://localhost:4321/mokoszo-v2/
# → działa bez błędów w konsoli

npm run build
# → dist/ generuje się poprawnie

npx astro check
# → brak błędów TypeScript
```

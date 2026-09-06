# 02 — System projektowy

> Tailwind + CSS Variables. Tailwind obsługuje spacing / layout / responsywność.
> Kolory i typografia są tokenami CSS (zdefiniowanymi w `tokens.css` i zmapowanymi w `tailwind.config.mjs`).
> **Nie używaj arbitralnych wartości `[#hex]` w klasach Tailwind** — tylko nazwy z palety poniżej.

---

## Paleta kolorów — gotowe klasy Tailwind

| Token CSS | Klasa Tailwind | Gdzie używać |
|-----------|---------------|--------------|
| `--porcelana` | `bg-porcelana` / `text-porcelana` | Tło aplikacji (jasna) |
| `--biel` | `bg-biel` | Karty, panele na jasnym tle |
| `--kreska` | `border-kreska` | Linie podziału |
| `--ink` | `text-ink` | Główny tekst |
| `--ink-2` | `text-ink-2` | Tekst pomocniczy, etykiety |
| `--emalia-900` | `bg-emalia-900` | Tło trybu nocnego (E-04), pasek nav, nagłówki |
| `--emalia-500` | `text-emalia-500` | Linki |
| `--na-emalii` | `text-na-emalii` | Tekst na ciemnym tle |
| `--na-emalii-2` | `text-na-emalii-2` | Tekst pomocniczy na ciemnym tle |
| `--kurkuma` | `bg-kurkuma` / `text-kurkuma` | **Jedyny** kolor interakcji (CTA, focus) |
| `--kurkuma-tint` | `bg-kurkuma-tint` | Tło akcentowane (np. komunikat o zapisie) |
| `--tak-tint` | `bg-tak-tint` | Akcent pozytywny (decyzja „biorę") |
| `--tak` | `text-tak` | Tekst pozytywny |
| `--nie-tint` | `bg-nie-tint` | Akcent negatywny (decyzja „nie dziś") |
| `--nie` | `text-nie` | Tekst negatywny |

---

## Typografia — klasy

```
font-ui     → Archivo (interfejs)
font-prose  → Source Serif 4 (treść przepisu w E-04, E-05)
```

Skala nagłówków (Tailwind):
- `text-3xl font-extrabold tracking-tight` — H1 główne
- `text-xl font-bold` — H2 sekcji
- `text-base font-semibold` — H3 / etykiety sekcji
- `text-sm font-medium text-ink-2` — mikrotekst, etykiety

---

## Komponenty Astro — wzorce HTML z Tailwind

### NavBar.astro

```astro
---
export interface Props { current: 'przepisy' | 'plan' | 'zakupy' | 'wiecej'; }
const { current } = Astro.props;
const base = import.meta.env.BASE_URL;

const items = [
  { id: 'przepisy', href: `${base}/`,           label: 'Przepisy', icon: 'book' },
  { id: 'plan',     href: `${base}/plan`,        label: 'Plan',     icon: 'calendar' },
  { id: 'zakupy',   href: `${base}/zakupy`,      label: 'Zakupy',   icon: 'shopping-cart' },
  { id: 'wiecej',   href: `${base}/ustawienia`,  label: 'Więcej',   icon: 'more-horizontal' },
] as const;
---

<nav
  class="fixed bottom-0 inset-x-0 h-[var(--nav-height)] bg-emalia-900 border-t border-white/10 flex z-50"
  aria-label="Nawigacja główna"
>
  {items.map(item => (
    <a
      href={item.href}
      aria-current={current === item.id ? 'page' : undefined}
      class:list={[
        'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-touch',
        'text-[11px] font-semibold no-underline transition-colors',
        current === item.id
          ? 'text-kurkuma'
          : 'text-na-emalii-2 hover:text-na-emalii',
      ]}
    >
      <!-- SVG icon inline (Lucide) — patrz sekcja ikon -->
      <span class="sr-only">{item.label}</span>
      <span aria-hidden="true">{item.label}</span>
    </a>
  ))}
</nav>
```

### Przycisk — wzorzec Tailwind

Nie twórz osobnego komponentu Astro dla przycisku — używaj klas inline.
Wzorce klas do kopiowania:

```
PRIMARY (kurkuma):
  class="inline-flex items-center justify-center gap-1.5 px-5 py-3
         rounded-l bg-kurkuma text-kurkuma-tekst font-bold text-[15px]
         min-h-touch active:scale-[0.97] transition-transform"

SECONDARY (obramowanie):
  class="inline-flex items-center justify-center gap-1.5 px-5 py-3
         rounded-l border border-kreska bg-biel text-ink font-bold text-[15px]
         min-h-touch active:scale-[0.97] transition-transform"

DECYZJA TAK (zielony):
  class="flex-1 flex items-center justify-center gap-2 py-3.5
         rounded-l bg-tak-tint text-tak border border-[var(--tak-jasny)]
         font-bold min-h-touch active:scale-[0.97] transition-transform"

DECYZJA NIE (różowy):
  class="flex-1 flex items-center justify-center gap-2 py-3.5
         rounded-l bg-nie-tint text-nie border border-[var(--nie-jasny)]
         font-bold min-h-touch active:scale-[0.97] transition-transform"

COFNIJ (mały, neutralny):
  class="w-12 h-12 flex items-center justify-center rounded-full
         bg-biel/10 text-na-emalii border border-white/20
         active:scale-[0.97] transition-transform"
```

### Chip (filtr aktywny / nieaktywny)

```html
<!-- Nieaktywny -->
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
               text-[13px] font-semibold border border-kreska bg-biel text-ink
               min-h-touch cursor-pointer">
  Obiad
</button>

<!-- Aktywny -->
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
               text-[13px] font-semibold bg-emalia-900 text-na-emalii
               min-h-touch cursor-pointer">
  Obiad
  <span aria-hidden="true">✕</span>
  <span class="sr-only">zdejmij filtr obiad</span>
</button>
```

### Notka (komunikat informacyjny)

```html
<!-- Kurkuma (informacja) -->
<div class="bg-biel border-l-4 border-kurkuma rounded-r-m p-4 text-[14px]">
  <strong>Tytuł</strong> Treść komunikatu.
</div>

<!-- Czerwony (ostrzeżenie) -->
<div class="bg-biel border-l-4 border-nie rounded-r-m p-4 text-[14px]">
  Treść ostrzeżenia.
</div>

<!-- Zielony (sukces) -->
<div class="bg-biel border-l-4 border-tak rounded-r-m p-4 text-[14px]">
  Treść potwierdzenia.
</div>
```

### Nagłówek strony (ciemny pasek)

```astro
<header class="bg-emalia-900 text-na-emalii px-4 py-8 md:px-8 md:py-12">
  <p class="text-kurkuma text-[12.5px] font-bold mb-4">Jutro jem</p>
  <h1 class="text-[clamp(26px,6vw,42px)] font-extrabold tracking-tight leading-[1.05] mb-2 max-w-[20ch]">
    Tytuł strony
  </h1>
  <p class="text-na-emalii-2 text-[clamp(14px,2vw,16px)] max-w-[60ch]">
    Opis strony.
  </p>
</header>
```

---

## Ikony — Lucide SVG inline

Używaj ikon Lucide (open source). Wklej SVG inline, nie ładuj biblioteki JS.
Przydatne ikony dla projektu:

```html
<!-- book-open (Przepisy) -->
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
</svg>

<!-- calendar (Plan) -->
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
  <line x1="16" x2="16" y1="2" y2="6"/>
  <line x1="8" x2="8" y1="2" y2="6"/>
  <line x1="3" x2="21" y1="10" y2="10"/>
</svg>

<!-- shopping-cart (Zakupy) -->
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
</svg>

<!-- more-horizontal (Więcej) -->
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
</svg>

<!-- check (odhaczenie) -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2.5"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>

<!-- x (odrzuć / usuń) -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
</svg>

<!-- rotate-ccw (cofnij decyzję) -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
</svg>

<!-- plus (dodaj) -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>
```

---

## Responsywność — breakpointy

Astro/Tailwind używa standardowych breakpointów, ale dla tego projektu kluczowe są:

| Breakpoint | Tailwind prefix | Zastosowanie |
|-----------|----------------|--------------|
| < 480 px | (brak prefixu) | **Podstawowy — telefon 360 px** |
| ≥ 480 px | `sm:` | Kafelki 2 kolumny (E-09) |
| ≥ 768 px | `md:` | Padding/margines powiększony |
| ≥ 900 px | `lg:` | E-09: 3-4 kolumny, filtry w lewej kolumnie |
| ≥ 900 px | `lg:` | E-06: 2 kolumny kategorii |

Karta E-04: max `max-w-[380px]` wyśrodkowana na desktopie.

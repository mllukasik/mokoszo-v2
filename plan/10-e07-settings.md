# 10 — E-07: Ustawienia planu

---

## Plik: `src/pages/ustawienia.astro`

```astro
---
import App from '../layouts/App.astro';
const base = import.meta.env.BASE_URL;
---

<App title="Więcej — Jutro jem" currentNav="wiecej">
  <script id="base-url" type="application/json" set:html={JSON.stringify(base)} />
  <div id="settings-mount"></div>
</App>

<script src="../components/SettingsScreen.ts"></script>
```

---

## Plik: `src/components/SettingsScreen.ts`

```typescript
import type { SlotTag, AppSettings } from '../types';
import { SLOT_LABELS } from '../types';
import { loadSettings, saveSettings, loadPlan, clearPlan } from '../scripts/store';

let settings: AppSettings;

function init() {
  settings = loadSettings();
  renderUI();
}

function getBaseUrl(): string {
  return JSON.parse(document.getElementById('base-url')?.textContent ?? '""');
}

function renderUI() {
  const mount = document.getElementById('settings-mount');
  if (!mount) return;

  const plan = loadPlan(new Date().toISOString().slice(0, 10));
  const totalDishes = plan?.slots.reduce((n, s) => n + s.dishes.length, 0) ?? 0;

  mount.innerHTML = `
    <div class="max-w-[680px] mx-auto">
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <h1 class="text-[28px] font-extrabold tracking-tight">Więcej</h1>
      </header>

      <!-- Informacja o zapisie lokalnym (NFR-09) -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-2">Gdzie jest Twój plan</h2>
        <p class="text-[14px] text-ink-2 leading-relaxed">
          Plan posiłków jest zapisany wyłącznie w tej przeglądarce, na tym urządzeniu.
          Nie ma konta, nie ma chmury — plan nie pojawi się na innym telefonie ani komputerze.
        </p>
        <p class="text-[14px] text-ink-2 mt-2">
          Wyczyszczenie danych przeglądarki lub używanie trybu prywatnego usuwa plan bez śladu.
        </p>
      </section>

      <!-- Domyślne sloty dnia -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-1">Domyślne posiłki nowego dnia</h2>
        <p class="text-[13px] text-ink-2 mb-4">
          Te posiłki pojawią się gdy zaczniesz planować nowy dzień.
        </p>
        <div class="space-y-2">
          ${renderDefaultSlots()}
        </div>
        <button id="btn-save-slots"
          class="mt-4 px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zapisz domyślne posiłki
        </button>
      </section>

      <!-- Czyszczenie planu (FR-17) -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-1">Wyczyść plan</h2>
        <p class="text-[14px] text-ink-2 mb-4">
          ${totalDishes > 0
            ? `Masz teraz zaplanowane ${totalDishes} ${totalDishes === 1 ? 'danie' : 'dania'}. Wyczyszczenie usuwa wszystko bezpowrotnie.`
            : 'Plan jest pusty.'
          }
        </p>
        <button id="btn-clear-plan"
          ${totalDishes === 0 ? 'disabled' : ''}
          class="px-5 py-3 rounded-l border border-nie text-nie font-bold min-h-touch disabled:opacity-40">
          Wyczyść plan
        </button>
      </section>

      <!-- Eksport/Import (FR-21 — etap 2) -->
      <section class="px-4 py-5 opacity-50">
        <h2 class="font-bold text-[16px] mb-1">Eksport i import planu</h2>
        <p class="text-[13px] text-ink-2">
          Przenoszenie planu między urządzeniami — planowane w kolejnej wersji.
        </p>
      </section>

      <!-- Wersja aplikacji -->
      <section class="px-4 py-5">
        <p class="text-[12.5px] text-ink-3">Jutro jem · MVP v0.1 · plan lokalny</p>
      </section>
    </div>
  `;

  attachEvents();
}

const SLOT_OPTIONS: SlotTag[] = ['sniadanie', 'drugie-sniadanie', 'obiad', 'kolacja', 'deser'];

function renderDefaultSlots(): string {
  return SLOT_OPTIONS.map(slot => `
    <label class="flex items-center gap-3 py-2 cursor-pointer min-h-touch">
      <input
        type="checkbox"
        data-slot="${slot}"
        class="default-slot-check w-5 h-5 rounded-s accent-kurkuma"
        ${settings.defaultSlots.includes(slot) ? 'checked' : ''}
      />
      <span class="font-semibold text-[15px]">${SLOT_LABELS[slot]}</span>
    </label>
  `).join('');
}

function attachEvents() {
  // Zapisz domyślne sloty
  document.getElementById('btn-save-slots')?.addEventListener('click', () => {
    const checked = Array.from(document.querySelectorAll('.default-slot-check'))
      .filter(el => (el as HTMLInputElement).checked)
      .map(el => (el as HTMLElement).dataset.slot as SlotTag);

    if (checked.length === 0) {
      alert('Wybierz co najmniej jeden domyślny posiłek.');
      return;
    }

    settings.defaultSlots = checked;
    saveSettings(settings);
    showToast('Zapisano domyślne posiłki');
  });

  // Wyczyść plan (FR-17)
  document.getElementById('btn-clear-plan')?.addEventListener('click', () => {
    // Potwierdzenie z nazwaniem skutku — bez "czy na pewno?" (per spec)
    const confirmed = confirm(
      'Wyczyszczenie usuwa wszystkie zaplanowane posiłki. Tej operacji nie można cofnąć.'
    );
    if (!confirmed) return;
    clearPlan();
    showToast('Plan wyczyszczony');
    renderUI();
  });
}

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 text-[14px] shadow-lg z-40';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', init);
```

---

## Lista kontrolna E-07

- [ ] Informacja o zapisie lokalnym — czytelna, nie w stopce (NFR-09)
- [ ] Domyślne sloty — checkboxy, zapis po kliknięciu przycisku
- [ ] Wyczyść plan — aktywny tylko gdy plan niepusty
- [ ] Wyczyść plan — potwierdzenie z opisem skutku (bez „czy na pewno?")
- [ ] Eksport/import zarezerwowany wizualnie (widoczny, wygaszony)
- [ ] Wersja aplikacji na dole

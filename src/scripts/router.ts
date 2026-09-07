// Helpery routingu dla statycznego hostingu (GitHub Pages).
// Dynamiczne daty przekazywane są przez URLSearchParams (?date=YYYY-MM-DD),
// podświetlenie slotu po powrocie z E-04 — przez hash (#slot-<id>).

export interface RecipeIngredient {
  slug: string;
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeSummary {
  slug: string;
  title: string;
  image?: string | null;
  timeMinutes: number;
  calories: number;
  slots: string[];
  ingredients: RecipeIngredient[];
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string | null | undefined): value is string {
  if (!value || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Bazowy URL aplikacji (np. "/mokoszo-v2"). Bez końcowego slasha. */
export function getBaseUrl(): string {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="base-url"]') as HTMLMetaElement | null;
    if (meta?.content) return meta.content.replace(/\/$/, '');
  }
  return '';
}

export function getQueryParam(name: string, search?: string): string | null {
  const qs = search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const params = new URLSearchParams(qs);
  const value = params.get(name);
  return value && value.length > 0 ? value : null;
}

/** Data z ?date= — poprawna lub dzisiejsza (fallback). */
export function getDateParam(search?: string, now = new Date()): string {
  const raw = getQueryParam('date', search);
  return isValidDateString(raw) ? (raw as string) : todayISO(now);
}

/** Slot z ?slot= — pusty string gdy brak. */
export function getSlotParam(search?: string): string {
  return getQueryParam('slot', search) ?? '';
}

function withBase(path: string): string {
  const base = getBaseUrl();
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export function buildUrl(
  path: string,
  params: Record<string, string | null | undefined> = {},
  hash?: string,
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') qs.set(k, v);
  }
  const query = qs.toString();
  const anchor = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';
  return `${withBase(path)}${query ? `?${query}` : ''}${anchor}`;
}

export function buildPlanUrl(date: string, slotId?: string): string {
  return buildUrl('/plan', { date }, slotId ? `slot-${slotId}` : undefined);
}

export function buildWybieramUrl(date: string, slot?: string): string {
  return buildUrl('/wybieram', { date, slot });
}

export function buildZakupyUrl(date: string): string {
  return buildUrl('/zakupy', { date });
}

export function buildRecipeUrl(slug: string): string {
  return withBase(`/przepis/${slug}`);
}

/** Powrót z E-04 do E-03 z hashem do podświetlenia slotu. */
export function navigateBackToPlan(date: string, slotId: string): void {
  window.location.href = buildPlanUrl(date, slotId);
}

/** Dane przepisów wbudowane w stronę jako JSON (script#recipes-data). */
export function getRecipesData(): RecipeSummary[] {
  if (typeof document === 'undefined') return [];
  const el = document.getElementById('recipes-data');
  if (!el?.textContent?.trim()) return [];
  try {
    const parsed = JSON.parse(el.textContent) as RecipeSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Po wejściu na /plan?date=...#slot-<id>: przewiń do slotu
 * i dodaj krótkie podświetlenie .slot--just-updated.
 * Zwraca id slotu lub null.
 */
export function scrollToSlotFromHash(): string | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const hash = window.location.hash;
  const match = hash.match(/^#slot-(.+)$/);
  if (!match) return null;
  const slotId = match[1];
  const el = document.getElementById(`slot-${slotId}`);
  if (!el) return slotId;
  el.scrollIntoView({ behavior: 'auto', block: 'center' });
  el.classList.add('slot--just-updated');
  window.setTimeout(() => el.classList.remove('slot--just-updated'), 2400);
  return slotId;
}

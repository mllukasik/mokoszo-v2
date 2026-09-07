import { describe, it, expect } from 'vitest';
import {
  isValidDateString,
  todayISO,
  getQueryParam,
  getDateParam,
  getSlotParam,
  buildUrl,
  buildPlanUrl,
  buildWybieramUrl,
  buildZakupyUrl,
  buildRecipeUrl,
  getBaseUrl,
  getRecipesData,
} from '../router';

describe('isValidDateString', () => {
  it('akceptuje poprawną datę', () => {
    expect(isValidDateString('2026-09-05')).toBe(true);
  });

  it('odrzuca zły format', () => {
    expect(isValidDateString('05-09-2026')).toBe(false);
    expect(isValidDateString('2026/09/05')).toBe(false);
    expect(isValidDateString('')).toBe(false);
    expect(isValidDateString(null)).toBe(false);
    expect(isValidDateString(undefined)).toBe(false);
  });

  it('odrzuca nieistniejącą datę', () => {
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('2026-02-30')).toBe(false);
  });
});

describe('todayISO', () => {
  it('formatuje datę jako YYYY-MM-DD', () => {
    expect(todayISO(new Date(2026, 8, 5))).toBe('2026-09-05');
  });
});

describe('getQueryParam / getDateParam / getSlotParam', () => {
  it('czyta parametr z query string', () => {
    expect(getQueryParam('date', '?date=2026-09-05&slot=obiad')).toBe('2026-09-05');
    expect(getQueryParam('slot', '?date=2026-09-05&slot=obiad')).toBe('obiad');
    expect(getQueryParam('brak', '?date=2026-09-05')).toBeNull();
  });

  it('getDateParam zwraca datę z URL albo dzisiejszą', () => {
    expect(getDateParam('?date=2026-09-05', new Date(2026, 0, 1))).toBe('2026-09-05');
    expect(getDateParam('?date=zła-data', new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(getDateParam('', new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('getSlotParam zwraca slot albo pusty string', () => {
    expect(getSlotParam('?date=2026-09-05&slot=obiad')).toBe('obiad');
    expect(getSlotParam('?date=2026-09-05')).toBe('');
  });
});

describe('budowanie URL-i (bez document → base pusty)', () => {
  it('buildUrl składa ścieżkę, query i hash', () => {
    expect(buildUrl('/plan', { date: '2026-09-05' })).toBe('/plan?date=2026-09-05');
    expect(buildUrl('/plan', { date: '2026-09-05' }, 'slot-abc')).toBe(
      '/plan?date=2026-09-05#slot-abc',
    );
    expect(buildUrl('/plan', { date: '2026-09-05', slot: '' })).toBe('/plan?date=2026-09-05');
  });

  it('buildPlanUrl dokleja hash slotu', () => {
    expect(buildPlanUrl('2026-09-05')).toBe('/plan?date=2026-09-05');
    expect(buildPlanUrl('2026-09-05', 'abc')).toBe('/plan?date=2026-09-05#slot-abc');
  });

  it('buildWybieramUrl przekazuje date i slot', () => {
    expect(buildWybieramUrl('2026-09-05', 'obiad')).toBe('/wybieram?date=2026-09-05&slot=obiad');
    expect(buildWybieramUrl('2026-09-05')).toBe('/wybieram?date=2026-09-05');
  });

  it('buildZakupyUrl przekazuje datę', () => {
    expect(buildZakupyUrl('2026-09-05')).toBe('/zakupy?date=2026-09-05');
  });

  it('buildRecipeUrl prowadzi do statycznej strony przepisu', () => {
    expect(buildRecipeUrl('zapiekanka-z-soczewica')).toBe('/przepis/zapiekanka-z-soczewica');
  });
});

describe('getBaseUrl / getRecipesData bez DOM', () => {
  it('poza przeglądarką base jest pusty, a dane przepisów puste', () => {
    expect(getBaseUrl()).toBe('');
    expect(getRecipesData()).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';

describe('Konfiguracja projektu', () => {
  it('środowisko testowe działa', () => {
    expect(true).toBe(true);
  });

  it('tokeny slotów są poprawne', async () => {
    const { SLOTS } = await import('../src/data/slots.js');
    expect(SLOTS).toHaveLength(5);
    expect(SLOTS[0].id).toBe('sniadanie');
    expect(SLOTS[2].id).toBe('obiad');
  });
});

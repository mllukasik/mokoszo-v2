import { describe, it, expect } from 'vitest';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';

// Walidacja frontmatter przepisów bez uruchamiania Astro
// (szybki smoke test przed buildem)

const VALID_SLOTS = ['sniadanie', 'drugie-sniadanie', 'obiad', 'kolacja', 'deser'];

function parseFrontmatter(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`Brak frontmatter: ${filePath}`);
  return parseYaml(match[1]);
}

describe('Przepisy — walidacja frontmatter', async () => {
  const files = await glob('src/content/recipes/*.md');

  it('istnieje co najmniej 10 przepisów', () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  files.forEach(file => {
    const name = file.split('/').pop();

    it(`${name} — ma wymagane pola`, () => {
      const meta = parseFrontmatter(file);
      expect(meta.title, 'brak title').toBeTruthy();
      expect(meta.time_minutes, 'brak time_minutes').toBeGreaterThan(0);
      expect(meta.calories, 'brak calories').toBeGreaterThan(0);
      expect(meta.slots, 'brak slots').toBeInstanceOf(Array);
      expect(meta.ingredients, 'brak ingredients').toBeInstanceOf(Array);
    });

    it(`${name} — title mieści się w 60 znakach`, () => {
      const meta = parseFrontmatter(file);
      expect(meta.title.length).toBeLessThanOrEqual(60);
    });

    it(`${name} — slots są poprawne`, () => {
      const meta = parseFrontmatter(file);
      (meta.slots as string[]).forEach((slot: string) => {
        expect(VALID_SLOTS).toContain(slot);
      });
    });

    it(`${name} — każdy składnik ma slug, name, amount, unit`, () => {
      const meta = parseFrontmatter(file);
      (meta.ingredients as any[]).forEach((ing: any, i: number) => {
        expect(ing.slug, `składnik ${i}: brak slug`).toBeTruthy();
        expect(ing.name, `składnik ${i}: brak name`).toBeTruthy();
        expect(ing.amount, `składnik ${i}: brak amount`).toBeGreaterThan(0);
        expect(ing.unit, `składnik ${i}: brak unit`).toBeTruthy();
      });
    });
  });
});

import { defineCollection, z } from 'astro:content';

const slotTagEnum = z.enum([
  'sniadanie',
  'drugie-sniadanie',
  'obiad',
  'kolacja',
  'deser',
]);

const ingredientSchema = z.object({
  slug: z.string(),               // klucz do ingredients.json
  name: z.string(),               // nazwa wyświetlana
  amount: z.number(),
  unit: z.string(),               // "g", "szt", "ml", "łyżka", "szklanka"
});

const recipes = defineCollection({
  type: 'content',               // parsuje body Markdown jako HTML
  schema: z.object({
    title: z.string().max(60),   // max 60 znaków — musi mieścić się na karcie
    image: z.string().optional(),// np. "/images/zapiekanka-z-soczewica.jpg"
    time_minutes: z.number().int().positive(),
    calories: z.number().int().positive(),
    servings: z.number().int().positive().default(2),
    slots: z.array(slotTagEnum).min(1),
    tags: z.array(z.string()).default([]),
    ingredients: z.array(ingredientSchema),
    // steps NIE są w frontmatter — są w body Markdown jako lista
  }),
});

export const collections = { recipes };

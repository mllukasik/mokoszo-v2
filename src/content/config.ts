import { defineCollection, z } from 'astro:content';

const recipes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    prepTime: z.number().int().positive().optional(),   // minuty przygotowania
    cookTime: z.number().int().positive().optional(),   // minuty gotowania
    servings: z.number().int().positive().default(2),
    tags: z.array(z.string()).default([]),
    slots: z.array(
      z.enum(['sniadanie', 'drugie-sniadanie', 'obiad', 'podwieczorek', 'kolacja'])
    ).default([]),
    kcalTotal: z.number().int().nonnegative().optional(),
    ingredients: z.array(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
      })
    ).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { recipes };

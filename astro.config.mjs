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

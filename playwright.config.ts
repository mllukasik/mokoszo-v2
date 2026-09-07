import { defineConfig, devices } from '@playwright/test';

// Ścieżka bazowa z env lub domyślnie — musi być zgodna z base w astro.config.mjs
const BASE_PATH = process.env.BASE_PATH ?? '/mokoszo-v2';
const PORT = process.env.PREVIEW_PORT ?? '4321';
const SERVER_URL = `http://localhost:${PORT}${BASE_PATH}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // baseURL zawiera base path — page.goto('/') trafi na właściwą stronę
    baseURL: SERVER_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    // url do health-check — budowany dynamicznie, bez hardcoded ścieżki
    url: `${SERVER_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

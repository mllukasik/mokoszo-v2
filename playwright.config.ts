import { defineConfig, devices } from '@playwright/test';

// Ścieżka bazowa z env lub domyślnie — musi być zgodna z base w astro.config.mjs
const BASE_PATH = process.env.BASE_PATH ?? '/mokoszo-v2';
const PORT = process.env.PREVIEW_PORT ?? '4321';
const SERVER_URL = `http://localhost:${PORT}${BASE_PATH}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : 'list',

  use: {
    // baseURL zawiera base path — nawigacja helperem goto() w testach
    baseURL: SERVER_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Zbuduj przed startem serwera (wymagane przez preview w e2e)
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: `${SERVER_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'], // 360px — podstawowy viewport projektu
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});

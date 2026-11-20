import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'movil', use: { browserName: 'chromium', viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } },
    { name: 'escritorio', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
});

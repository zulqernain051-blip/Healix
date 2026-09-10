import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 5 * 60 * 1000,
  expect: {
    timeout: 10000
  },
  use: {
    headless: false,
    launchOptions: {
      slowMo: 500,
    },
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

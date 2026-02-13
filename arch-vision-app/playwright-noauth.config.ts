import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for QA tests that don't require authentication.
 * No setup project, no storageState — tests run independently.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /qa-no-auth\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never', outputFolder: 'e2e/qa-report' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    actionTimeout: 15_000,
    ...devices['Desktop Chrome'],
  },

  outputDir: './e2e/test-results-noauth',
})

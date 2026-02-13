import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 300_000, // 5 min per test (AI analysis can take a while)
  expect: { timeout: 30_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    // Auth setup — runs first, generates storageState
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Main E2E tests — depend on setup, reuse authenticated session
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],

  outputDir: './e2e/test-results',
})

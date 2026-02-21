/**
 * Playwright Auth Setup
 *
 * Runs before all tests to establish an authenticated session.
 * Calls the E2E auth API which generates + verifies a magic link
 * server-side, setting session cookies on the response.
 * Then navigates to /dashboard to confirm auth and saves storageState.
 *
 * Required env vars:
 *   E2E_TEST_SECRET  — shared secret matching the API route
 *   E2E_USER_EMAIL   — email for the test user
 *   E2E_BASE_URL     — app URL (default: http://localhost:3000)
 */
import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/user.json'

setup('authenticate via E2E session API', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000'
  const secret = process.env.E2E_TEST_SECRET || 'e2e-local-secret-change-me'

  if (!secret) {
    throw new Error(
      'E2E_TEST_SECRET env var is required. Set it in .env or pass via CLI:\n' +
      '  E2E_TEST_SECRET=your-secret npx playwright test'
    )
  }

  console.log('[Auth Setup] Creating session via API...')

  // Navigate to the app first so cookies are set on the correct origin
  await page.goto(baseUrl)

  // Call the E2E auth API — it generates a magic link token,
  // verifies it server-side, and returns Set-Cookie headers with the session
  const response = await page.request.post(`${baseUrl}/api/auth/e2e-session`, {
    data: { secret },
  })

  const body = await response.json()
  console.log(`[Auth Setup] API response: ${response.status()} — ${JSON.stringify(body)}`)

  if (!response.ok()) {
    throw new Error(`Auth API failed: ${response.status()} — ${body.error}`)
  }

  console.log(`[Auth Setup] Session created for: ${body.user}`)

  // Navigate to dashboard to confirm the session cookies work
  await page.goto(`${baseUrl}/dashboard`)
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})

  // Verify we're authenticated and on the dashboard (not redirected to login)
  const currentUrl = page.url()
  console.log(`[Auth Setup] Current URL after navigation: ${currentUrl}`)

  if (currentUrl.includes('/login')) {
    throw new Error(
      'Session cookies not applied — redirected to /login. ' +
      'Check SUPABASE_SERVICE_ROLE_KEY and E2E_USER_EMAIL.'
    )
  }

  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10_000 })
  console.log('[Auth Setup] Authenticated successfully!')

  // Save the storage state (cookies + localStorage) for all tests
  await page.context().storageState({ path: AUTH_FILE })
  console.log(`[Auth Setup] Session saved to ${AUTH_FILE}`)
})

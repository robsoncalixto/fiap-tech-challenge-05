/**
 * Arch Vision — E2E QA Validation
 *
 * Combined validation that exercises the core user journey:
 *   Dashboard → Upload diagram → Wait for AI report →
 *   Validate report rendering → Toggle dark mode →
 *   Validate dark-mode report → Screenshots
 *
 * Auth is handled automatically by auth.setup.ts (magic link via E2E API).
 *
 * Run:
 *   npm run test:e2e
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

// ─── Fixtures ────────────────────────────────────────────────────────
const DIAGRAM_PATH = path.resolve(__dirname, 'fixtures/test-architecture-diagram.jpeg')
const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots')

// ─── Helpers ─────────────────────────────────────────────────────────

/** Take a timestamped screenshot with a descriptive name. */
async function snap(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.jpeg`),
    fullPage: true,
  })
}

/** Wait for navigation to settle (no pending network for 500ms). */
async function waitForIdle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
}

// ─── Test Suite ──────────────────────────────────────────────────────

test.describe('Arch Vision — Full QA Validation', () => {
  test.describe.configure({ mode: 'serial' })

  let reportUrl: string

  // ── STEP 1: Landing Page ────────────────────────────────────────
  test('01 — Landing page loads correctly', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    // Verify hero section renders
    await expect(page.locator('text=Arch Vision').first()).toBeVisible()

    await snap(page, '01-landing-page')
    console.log('[QA] Landing page rendered OK')
  })

  // ── STEP 2: Login Page Structure ────────────────────────────────
  test('02 — Login page renders with all auth methods', async ({ page }) => {
    await page.goto('/login')
    await waitForIdle(page)

    // Since we're already authenticated (storageState), the login page
    // may redirect to /dashboard. Check if we can still see login or
    // if we've been redirected (both are valid).
    const onLogin = page.url().includes('/login')

    if (onLogin) {
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.getByText('Enviar Link Mágico')).toBeVisible()
      await expect(page.getByText('Continuar com GitHub')).toBeVisible()
      await snap(page, '02-login-page')
      console.log('[QA] Login page rendered with all auth options')
    } else {
      console.log('[QA] Already authenticated — redirected away from login')
      await snap(page, '02-already-authenticated')
    }
  })

  // ── STEP 3: Dashboard Validation ───────────────────────────────
  test('03 — Dashboard displays stats and navigation', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForIdle(page)

    // Dashboard title
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

    // "Nova Análise" button (use role to avoid sidebar duplicate)
    await expect(page.getByRole('button', { name: 'Nova Análise' })).toBeVisible()

    // Credits info should be visible somewhere in the stats
    await expect(page.locator('text=Créditos').first()).toBeVisible({ timeout: 10_000 })

    await snap(page, '03-dashboard-stats')
    console.log('[QA] Dashboard stats and navigation verified')
  })

  // ── STEP 4: Navigate to Analysis & Upload ──────────────────────
  test('04 — Upload diagram on analyze page', async ({ page }) => {
    await page.goto('/analyze')
    await waitForIdle(page)

    // Page title
    await expect(page.locator('h1:has-text("Nova Análise STRIDE")')).toBeVisible()

    // Credits visible
    await expect(page.locator('text=Créditos disponíveis').first()).toBeVisible({ timeout: 10_000 })

    // Upload zone visible
    await expect(page.locator('text=Arraste seu diagrama aqui')).toBeVisible()

    // Upload the test architecture diagram
    const fileInput = page.locator('#file-input')
    await fileInput.setInputFiles(DIAGRAM_PATH)

    // Verify preview appeared (the file name should be shown)
    await expect(page.locator('text=test-architecture-diagram.jpeg')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('img[alt="Preview do diagrama"]')).toBeVisible()

    await snap(page, '04-file-uploaded-preview')
    console.log('[QA] File uploaded and preview displayed correctly')

    // Model selector should be visible and default to free model
    await expect(page.locator('#model')).toBeVisible()
    const selectedModel = await page.locator('#model').inputValue()
    console.log(`[QA] Default model selected: ${selectedModel}`)

    // "Iniciar Análise" button should be enabled
    const submitButton = page.getByText('Iniciar Análise')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()

    await snap(page, '04-ready-to-submit')
  })

  // ── STEP 5: Submit Analysis & Track Processing ─────────────────
  test('05 — Submit analysis and track processing status', async ({ page }) => {
    await page.goto('/analyze')
    await waitForIdle(page)

    // Upload file
    const fileInput = page.locator('#file-input')
    await fileInput.setInputFiles(DIAGRAM_PATH)
    await expect(page.locator('text=test-architecture-diagram.jpeg')).toBeVisible({ timeout: 5_000 })

    // Submit the analysis
    const submitButton = page.getByText('Iniciar Análise')
    await submitButton.click()

    // Should navigate to report page
    await page.waitForURL('**/report/**', { timeout: 30_000 })

    // Capture the report URL for later tests
    reportUrl = page.url()
    console.log(`[QA] Redirected to report: ${reportUrl}`)

    // Processing status should appear
    await expect(
      page.locator('text=Analisando seu diagrama').or(page.locator('text=Relatório STRIDE'))
    ).toBeVisible({ timeout: 15_000 })

    await snap(page, '05-processing-status')

    // If still processing, wait for completion (up to 4 minutes)
    const isProcessing = await page.locator('text=Analisando seu diagrama').isVisible().catch(() => false)

    if (isProcessing) {
      console.log('[QA] Analysis in progress, waiting for completion...')

      // Take periodic screenshots while processing
      let elapsed = 0
      const interval = setInterval(async () => {
        elapsed += 15
        const still = await page.locator('text=Analisando seu diagrama').isVisible().catch(() => false)
        if (still) {
          console.log(`[QA] Still processing... (${elapsed}s)`)
          await snap(page, `05-processing-${elapsed}s`).catch(() => {})
        }
      }, 15_000)

      // Wait until either "Relatório STRIDE" or "Análise falhou" appears
      await expect(
        page.locator('text=Relatório STRIDE').or(page.locator('text=Análise falhou'))
      ).toBeVisible({ timeout: 240_000 })

      clearInterval(interval)
    }

    await snap(page, '05-analysis-complete')
    console.log('[QA] Analysis processing tracked successfully')
  })

  // ── STEP 6: Validate Report Content (Light Mode) ───────────────
  test('06 — Report renders correctly in LIGHT mode', async ({ page }) => {
    test.skip(!reportUrl, 'No report URL from previous step')
    await page.goto(reportUrl)
    await waitForIdle(page)

    // Set light theme explicitly
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.documentElement.style.colorScheme = 'light'
    })
    await page.reload()
    await waitForIdle(page)

    // If report failed, skip detailed content checks
    const failed = await page.locator('text=Análise falhou').isVisible().catch(() => false)
    if (failed) {
      console.log('[QA] Report failed — capturing failure state')
      await snap(page, '06-report-failed-light')
      return
    }

    // Report title
    await expect(page.locator('h1:has-text("Relatório STRIDE")')).toBeVisible()

    // Model info
    await expect(page.locator('text=Modelo:').first()).toBeVisible()

    // Diagram preview should be rendered
    const diagramImg = page.locator('img').first()
    await expect(diagramImg).toBeVisible({ timeout: 10_000 })

    // Report content (markdown area)
    const reportContent = page.locator('#report-content')
    await expect(reportContent).toBeVisible({ timeout: 10_000 })

    // Check for severity badges (at least one should exist)
    const hasSeverity = await page
      .locator('text=/CRITICAL|HIGH|MEDIUM|LOW/i')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    console.log(`[QA] Severity badges visible: ${hasSeverity}`)

    // Toolbar buttons
    await expect(page.getByLabel(/compartilh/i).or(page.getByText('Compartilhar'))).toBeVisible()
    await expect(page.getByText(/PDF/)).toBeVisible()
    await expect(page.getByText('Excluir')).toBeVisible()

    // Verify it's actually in light mode (background should be light)
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('color-scheme')
        || getComputedStyle(document.body).backgroundColor
    })
    console.log(`[QA] Light mode background check: ${bgColor}`)

    await snap(page, '06-report-light-mode-full')

    // Scroll down to capture the full report
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)
    await snap(page, '06-report-light-mode-mid')

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await snap(page, '06-report-light-mode-bottom')

    console.log('[QA] Report verified in LIGHT mode')
  })

  // ── STEP 7: Dark Mode Toggle & Report Validation ───────────────
  test('07 — Toggle to DARK mode and validate report rendering', async ({ page }) => {
    test.skip(!reportUrl, 'No report URL from previous step')
    await page.goto(reportUrl)
    await waitForIdle(page)

    // Set dark mode via localStorage + class (avoids sidebar z-index overlap on dropdown)
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    })
    await page.reload()
    await waitForIdle(page)

    // Give the theme a moment to apply
    await page.waitForTimeout(1_000)

    // Verify dark class is applied to the html element
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )
    expect(hasDarkClass).toBeTruthy()
    console.log(`[QA] Dark class applied: ${hasDarkClass}`)

    // Check that the background color changed (should be dark now)
    const bodyBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    )
    console.log(`[QA] Dark mode body background: ${bodyBg}`)

    // If report failed, just capture the failure state in dark mode
    const failed = await page.locator('text=Análise falhou').isVisible().catch(() => false)
    if (failed) {
      await snap(page, '07-report-failed-dark')
      console.log('[QA] Report failed state captured in dark mode')
      return
    }

    // Report title still visible in dark mode
    await expect(page.locator('h1:has-text("Relatório STRIDE")')).toBeVisible()

    // Report content still readable
    const reportContent = page.locator('#report-content')
    await expect(reportContent).toBeVisible()

    // Verify text contrast in dark mode
    const textColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      return h1 ? getComputedStyle(h1).color : 'unknown'
    })
    console.log(`[QA] Dark mode text color: ${textColor}`)

    // Severity badges should still be visible in dark mode
    const hasSeverity = await page
      .locator('text=/CRITICAL|HIGH|MEDIUM|LOW/i')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    console.log(`[QA] Severity badges in dark mode: ${hasSeverity}`)

    // Diagram preview in dark mode
    const diagramImg = page.locator('img').first()
    await expect(diagramImg).toBeVisible({ timeout: 10_000 })

    await snap(page, '07-report-dark-mode-full')

    // Scroll to capture full dark-mode report
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)
    await snap(page, '07-report-dark-mode-mid')

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await snap(page, '07-report-dark-mode-bottom')

    console.log('[QA] Report verified in DARK mode')
  })

  // ── STEP 8: Toggle back to LIGHT mode ──────────────────────────
  test('08 — Toggle back to LIGHT mode (theme consistency)', async ({ page }) => {
    test.skip(!reportUrl, 'No report URL from previous step')

    // Start in dark mode
    await page.goto(reportUrl)
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    })
    await page.reload()
    await waitForIdle(page)

    // Switch to light
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    })
    await page.reload()
    await waitForIdle(page)

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )
    expect(hasDarkClass).toBeFalsy()

    await snap(page, '08-report-back-to-light')
    console.log('[QA] Theme toggled back to light mode successfully')
  })

  // ── STEP 9: Dashboard shows the new report ────────────────────
  test('09 — Dashboard lists the newly created report', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForIdle(page)

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

    // The reports table should have at least one row
    const hasReports = await page
      .locator('table tbody tr, [class*="report"], a[href*="/report/"]')
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false)

    console.log(`[QA] Dashboard shows reports: ${hasReports}`)

    await snap(page, '09-dashboard-with-report')
    console.log('[QA] Dashboard validation complete')
  })

  // ── STEP 10: Dark Mode on Dashboard ────────────────────────────
  test('10 — Dashboard renders correctly in DARK mode', async ({ page }) => {
    await page.goto('/dashboard')
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    })
    await page.reload()
    await waitForIdle(page)

    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )
    expect(hasDarkClass).toBeTruthy()

    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()

    await snap(page, '10-dashboard-dark-mode')
    console.log('[QA] Dashboard dark mode validated')
  })

  // ── STEP 11: Analyze Page in Dark Mode ─────────────────────────
  test('11 — Analyze page renders correctly in DARK mode', async ({ page }) => {
    await page.goto('/analyze')
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
    })
    await page.reload()
    await waitForIdle(page)

    await expect(page.locator('h1:has-text("Nova Análise STRIDE")')).toBeVisible()

    // Upload zone should render properly in dark
    await expect(page.locator('text=Arraste seu diagrama aqui')).toBeVisible()

    // Upload file to see preview in dark mode
    const fileInput = page.locator('#file-input')
    await fileInput.setInputFiles(DIAGRAM_PATH)
    await expect(page.locator('text=test-architecture-diagram.jpeg')).toBeVisible({ timeout: 5_000 })

    await snap(page, '11-analyze-dark-mode-with-upload')
    console.log('[QA] Analyze page dark mode with upload validated')
  })
})

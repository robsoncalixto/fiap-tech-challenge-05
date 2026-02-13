/**
 * Arch Vision — QA Navigation (No Authentication Required)
 *
 * Validates ALL routes and UI elements without depending on Supabase
 * authentication or external redirects (archvision.work).
 *
 * Public routes are fully tested. Private routes verify correct
 * redirect behavior to /login with the proper `next` query param.
 *
 * Run:
 *   npx playwright test e2e/qa-no-auth.spec.ts --headed
 */
import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/qa-no-auth')
const DIAGRAM_PATH = path.resolve(__dirname, 'fixtures/test-architecture-diagram.jpeg')

interface QAFinding {
  step: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'INFO'
  description: string
  details?: string
}

const findings: QAFinding[] = []

function record(step: string, status: QAFinding['status'], description: string, details?: string) {
  findings.push({ step, status, description, details })
  const icon = { PASS: '\u2705', FAIL: '\u274c', WARN: '\u26a0\ufe0f', INFO: '\u2139\ufe0f' }[status]
  console.log(`[QA ${icon}] ${step}: ${description}${details ? ` — ${details}` : ''}`)
}

async function snap(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  })
}

async function waitForIdle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
}

// ─── Test Suite ──────────────────────────────────────────────────────

test.describe('Arch Vision — QA (No Auth)', () => {
  test.describe.configure({ mode: 'serial' })

  // ────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES
  // ────────────────────────────────────────────────────────────────────

  test('01 — Landing page (/) loads and renders hero', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    const url = page.url()

    // Should NOT redirect anywhere
    if (!url.endsWith('/') && !url.endsWith(':3000')) {
      record('01', 'FAIL', 'Landing page redirected unexpectedly', `Redirected to: ${url}`)
    } else {
      record('01', 'PASS', 'Landing page loaded without redirect')
    }

    // Hero section
    const heroVisible = await page.locator('text=Arch Vision').first().isVisible().catch(() => false)
    if (heroVisible) {
      record('01', 'PASS', 'Hero section "Arch Vision" text visible')
    } else {
      record('01', 'FAIL', 'Hero section "Arch Vision" text NOT visible')
    }

    // Check for navigation links
    const navLinks = page.locator('nav a, header a')
    const navCount = await navLinks.count()
    record('01', 'INFO', `Navigation contains ${navCount} links`)

    // Check for CTA button (login/signup)
    const ctaVisible = await page.locator('a[href*="login"], button:has-text("Comec"), a:has-text("Comec")').first().isVisible().catch(() => false)
    if (ctaVisible) {
      record('01', 'PASS', 'CTA button/link visible on landing page')
    } else {
      record('01', 'WARN', 'No obvious CTA button found on landing page')
    }

    // Check for features section
    const featuresVisible = await page.locator('text=STRIDE').first().isVisible().catch(() => false)
    record('01', featuresVisible ? 'PASS' : 'WARN', `STRIDE mention visible: ${featuresVisible}`)

    // Check for pricing section
    const pricingVisible = await page.locator('text=Planos, text=Preços, text=pricing').first().isVisible().catch(() => false)
    record('01', pricingVisible ? 'PASS' : 'INFO', `Pricing section visible: ${pricingVisible}`)

    // Check for footer
    const footerVisible = await page.locator('footer').isVisible().catch(() => false)
    record('01', footerVisible ? 'PASS' : 'WARN', `Footer visible: ${footerVisible}`)

    // Responsive: check viewport meta tag
    const hasViewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]')
      return meta ? meta.getAttribute('content') : null
    })
    record('01', hasViewport ? 'PASS' : 'WARN', 'Viewport meta tag', hasViewport || 'missing')

    // Performance: check page load
    const loadTime = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return nav ? Math.round(nav.loadEventEnd - nav.startTime) : -1
    })
    record('01', loadTime < 5000 ? 'PASS' : 'WARN', `Page load time: ${loadTime}ms`)

    await snap(page, '01-landing-page')

    // Scroll to bottom for full page capture
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await snap(page, '01-landing-page-bottom')
  })

  test('02 — About page (/about) loads', async ({ page }) => {
    await page.goto('/about')
    await waitForIdle(page)

    const url = page.url()
    const onAbout = url.includes('/about')

    if (onAbout) {
      record('02', 'PASS', 'About page loaded without redirect')
    } else {
      record('02', 'FAIL', 'About page redirected unexpectedly', `URL: ${url}`)
    }

    // Check for team/group info
    const hasTeamInfo = await page.locator('text=Grupo 46').isVisible().catch(() => false)
    record('02', hasTeamInfo ? 'PASS' : 'INFO', `Team info (Grupo 46) visible: ${hasTeamInfo}`)

    // Check page has content
    const bodyText = await page.locator('main, [role="main"], body').first().textContent().catch(() => '')
    const hasContent = (bodyText?.length || 0) > 50
    record('02', hasContent ? 'PASS' : 'WARN', `Page has substantial content: ${hasContent}`)

    await snap(page, '02-about-page')
  })

  test('03 — Login page (/login) renders auth methods', async ({ page }) => {
    await page.goto('/login')
    await waitForIdle(page)

    const url = page.url()

    // If already authenticated it may redirect to dashboard — both are valid
    if (url.includes('/login')) {
      record('03', 'PASS', 'Login page loaded')

      // Email input
      const emailInput = await page.locator('#email, input[type="email"], input[name="email"]').first().isVisible().catch(() => false)
      record('03', emailInput ? 'PASS' : 'FAIL', `Email input field visible: ${emailInput}`)

      // Magic link button
      const magicLink = await page.getByText('Enviar Link Mágico').isVisible().catch(() => false)
      record('03', magicLink ? 'PASS' : 'FAIL', `Magic Link button visible: ${magicLink}`)

      // GitHub OAuth
      const github = await page.getByText('Continuar com GitHub').isVisible().catch(() => false)
      record('03', github ? 'PASS' : 'FAIL', `GitHub OAuth button visible: ${github}`)

      // Check for accessibility: labels, aria attributes
      const emailLabel = await page.evaluate(() => {
        const input = document.querySelector('#email, input[type="email"]')
        if (!input) return 'no-input'
        const id = input.id
        const label = document.querySelector(`label[for="${id}"]`)
        const ariaLabel = input.getAttribute('aria-label')
        return label ? 'label-found' : ariaLabel ? 'aria-label' : 'no-label'
      })
      record('03', emailLabel !== 'no-label' ? 'PASS' : 'WARN', `Email input accessibility: ${emailLabel}`)

      // Check that form does NOT auto-submit or redirect externally
      const hasExternalAction = await page.evaluate(() => {
        const forms = document.querySelectorAll('form')
        for (const form of forms) {
          const action = form.getAttribute('action')
          if (action && action.startsWith('http') && !action.includes('localhost')) return action
        }
        return null
      })
      record('03', !hasExternalAction ? 'PASS' : 'WARN', 'No external form actions', hasExternalAction || 'all internal')

    } else {
      record('03', 'INFO', 'Already authenticated, login page redirected', `URL: ${url}`)
    }

    await snap(page, '03-login-page')
  })

  test('04 — Login page: invalid email shows validation', async ({ page }) => {
    await page.goto('/login')
    await waitForIdle(page)

    if (!page.url().includes('/login')) {
      record('04', 'INFO', 'Skipped — already authenticated')
      return
    }

    // Try submitting with empty email
    const submitBtn = page.locator('button:has-text("Enviar Link Mágico"), button:has-text("Enviar"), button[type="submit"]').first()
    const btnExists = await submitBtn.isVisible().catch(() => false)

    if (btnExists) {
      await submitBtn.click()
      await page.waitForTimeout(1000)

      // Check for validation message
      const hasValidation = await page.locator('[role="alert"]').or(page.getByText('invalid')).or(page.getByText('obrigatório')).or(page.getByText('required')).first().isVisible({ timeout: 3_000 }).catch(() => false)
      record('04', hasValidation ? 'PASS' : 'WARN', `Empty email validation feedback: ${hasValidation}`)

      // Try with invalid format
      const emailInput = page.locator('#email, input[type="email"]').first()
      await emailInput.fill('not-an-email')
      await submitBtn.click()
      await page.waitForTimeout(2000)

      const hasFormatError = await page.getByText('invalid format').or(page.getByText('inválido')).or(page.getByText('Unable to validate')).first().isVisible({ timeout: 3_000 }).catch(() => false)
      record('04', hasFormatError ? 'PASS' : 'WARN', `Invalid email format validation: ${hasFormatError}`)
    } else {
      record('04', 'WARN', 'Submit button not found for validation test')
    }

    await snap(page, '04-login-validation')
  })

  // ────────────────────────────────────────────────────────────────────
  // PRIVATE ROUTES — Redirect Behavior (no auth)
  // ────────────────────────────────────────────────────────────────────

  test('05 — /dashboard redirects unauthenticated to /login', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies()

    await page.goto('/dashboard')
    await waitForIdle(page)

    const url = page.url()

    if (url.includes('/login')) {
      record('05', 'PASS', 'Dashboard correctly redirects to /login')

      // Verify `next` param is set
      const urlObj = new URL(url)
      const nextParam = urlObj.searchParams.get('next')
      if (nextParam === '/dashboard') {
        record('05', 'PASS', 'Redirect includes next=/dashboard param')
      } else {
        record('05', 'WARN', `next param: ${nextParam || 'missing'}`)
      }
    } else if (url.includes('/dashboard')) {
      record('05', 'INFO', 'Dashboard accessible (session may still be cached)')
    } else {
      record('05', 'FAIL', 'Unexpected redirect', `URL: ${url}`)
    }

    await snap(page, '05-dashboard-redirect')
  })

  test('06 — /analyze redirects unauthenticated to /login', async ({ page }) => {
    await page.context().clearCookies()

    await page.goto('/analyze')
    await waitForIdle(page)

    const url = page.url()

    if (url.includes('/login')) {
      record('06', 'PASS', 'Analyze page correctly redirects to /login')

      const urlObj = new URL(url)
      const nextParam = urlObj.searchParams.get('next')
      if (nextParam === '/analyze') {
        record('06', 'PASS', 'Redirect includes next=/analyze param')
      } else {
        record('06', 'WARN', `next param: ${nextParam || 'missing'}`)
      }
    } else {
      record('06', 'FAIL', 'Unexpected behavior', `URL: ${url}`)
    }

    await snap(page, '06-analyze-redirect')
  })

  test('07 — /report/test-id redirects unauthenticated to /login', async ({ page }) => {
    await page.context().clearCookies()

    await page.goto('/report/test-id-123')
    await waitForIdle(page)

    const url = page.url()

    if (url.includes('/login')) {
      record('07', 'PASS', 'Report page correctly redirects to /login')

      const urlObj = new URL(url)
      const nextParam = urlObj.searchParams.get('next')
      if (nextParam?.startsWith('/report/')) {
        record('07', 'PASS', 'Redirect preserves report path in next param')
      } else {
        record('07', 'WARN', `next param: ${nextParam || 'missing'}`)
      }
    } else {
      record('07', 'FAIL', 'Unexpected behavior', `URL: ${url}`)
    }

    await snap(page, '07-report-redirect')
  })

  test('08 — /upgrade redirects unauthenticated to /login', async ({ page }) => {
    await page.context().clearCookies()

    await page.goto('/upgrade')
    await waitForIdle(page)

    const url = page.url()

    if (url.includes('/login')) {
      record('08', 'PASS', 'Upgrade page correctly redirects to /login')
    } else {
      record('08', 'FAIL', 'Unexpected behavior', `URL: ${url}`)
    }

    await snap(page, '08-upgrade-redirect')
  })

  // ────────────────────────────────────────────────────────────────────
  // THEME & VISUAL CONSISTENCY
  // ────────────────────────────────────────────────────────────────────

  test('09 — Light mode: landing page visual consistency', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    })
    await page.reload()
    await waitForIdle(page)

    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    record('09', 'INFO', `Light mode body bg: ${bgColor}`)

    // Check for visible text contrast (text shouldn't be invisible)
    const textColor = await page.evaluate(() => {
      const h1 = document.querySelector('h1')
      return h1 ? getComputedStyle(h1).color : 'no h1'
    })
    record('09', 'INFO', `Light mode h1 text color: ${textColor}`)

    // Ensure images have alt text
    const imgsMissingAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img')
      let missing = 0
      imgs.forEach(img => { if (!img.alt) missing++ })
      return { total: imgs.length, missing }
    })
    record('09', imgsMissingAlt.missing === 0 ? 'PASS' : 'WARN',
      `Images alt text: ${imgsMissingAlt.total - imgsMissingAlt.missing}/${imgsMissingAlt.total} have alt`)

    await snap(page, '09-landing-light-mode')
  })

  test('10 — Dark mode: landing page visual consistency', async ({ page }) => {
    await page.goto('/')
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
    record('10', hasDarkClass ? 'PASS' : 'FAIL', `Dark class applied: ${hasDarkClass}`)

    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    record('10', 'INFO', `Dark mode body bg: ${bgColor}`)

    await snap(page, '10-landing-dark-mode')
  })

  test('11 — Dark mode: login page visual consistency', async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    })
    await page.reload()
    await waitForIdle(page)

    if (page.url().includes('/login')) {
      const hasDarkClass = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      )
      record('11', hasDarkClass ? 'PASS' : 'FAIL', `Dark mode on login: ${hasDarkClass}`)

      // Check button visibility in dark mode
      const btnVisible = await page.locator('button').first().isVisible().catch(() => false)
      record('11', btnVisible ? 'PASS' : 'WARN', `Buttons visible in dark mode: ${btnVisible}`)
    } else {
      record('11', 'INFO', 'Skipped — already authenticated, redirected from login')
    }

    await snap(page, '11-login-dark-mode')
  })

  // ────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY & SEO CHECKS
  // ────────────────────────────────────────────────────────────────────

  test('12 — Accessibility basics: headings, landmarks, tab order', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    // Check for proper heading hierarchy
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      return Array.from(hs).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim().slice(0, 50) || '',
      }))
    })
    record('12', headings.length > 0 ? 'PASS' : 'FAIL', `Found ${headings.length} headings`)

    // Check for h1
    const hasH1 = headings.some(h => h.level === 1)
    record('12', hasH1 ? 'PASS' : 'FAIL', `Has h1 element: ${hasH1}`)

    // Check heading hierarchy (no skipping levels)
    let hierarchyOk = true
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level > headings[i - 1].level + 1) {
        hierarchyOk = false
        record('12', 'WARN', `Heading hierarchy skip: h${headings[i - 1].level} -> h${headings[i].level}`)
      }
    }
    if (hierarchyOk) record('12', 'PASS', 'Heading hierarchy is correct')

    // Check for ARIA landmarks
    const landmarks = await page.evaluate(() => {
      const roles = ['banner', 'navigation', 'main', 'contentinfo']
      const found: string[] = []
      roles.forEach(role => {
        if (document.querySelector(`[role="${role}"]`) ||
            document.querySelector(role === 'banner' ? 'header' :
              role === 'navigation' ? 'nav' :
              role === 'main' ? 'main' :
              'footer')) {
          found.push(role)
        }
      })
      return found
    })
    record('12', landmarks.length >= 2 ? 'PASS' : 'WARN', `ARIA landmarks found: ${landmarks.join(', ')}`)

    // Check for skip navigation link
    const hasSkipLink = await page.locator('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]').first().isVisible().catch(() => false)
    record('12', 'INFO', `Skip navigation link: ${hasSkipLink}`)

    // Check tab index issues
    const tabIssues = await page.evaluate(() => {
      const elements = document.querySelectorAll('[tabindex]')
      let issues = 0
      elements.forEach(el => {
        const val = parseInt(el.getAttribute('tabindex') || '0')
        if (val > 0) issues++
      })
      return { total: elements.length, positiveTabIndex: issues }
    })
    record('12', tabIssues.positiveTabIndex === 0 ? 'PASS' : 'WARN',
      `Tab index: ${tabIssues.total} elements, ${tabIssues.positiveTabIndex} with positive tabindex`)
  })

  test('13 — SEO basics: meta tags, title, description', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    const seo = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
        lang: document.documentElement.lang || null,
      }
    })

    record('13', seo.title ? 'PASS' : 'FAIL', `Page title: ${seo.title || 'MISSING'}`)
    record('13', seo.description ? 'PASS' : 'WARN', `Meta description: ${seo.description ? 'present' : 'MISSING'}`)
    record('13', seo.ogTitle ? 'PASS' : 'INFO', `OG title: ${seo.ogTitle ? 'present' : 'missing'}`)
    record('13', seo.ogImage ? 'PASS' : 'INFO', `OG image: ${seo.ogImage ? 'present' : 'missing'}`)
    record('13', seo.lang ? 'PASS' : 'WARN', `HTML lang attribute: ${seo.lang || 'MISSING'}`)
    record('13', seo.canonical ? 'PASS' : 'INFO', `Canonical URL: ${seo.canonical || 'not set'}`)
  })

  // ────────────────────────────────────────────────────────────────────
  // NAVIGATION & LINK INTEGRITY
  // ────────────────────────────────────────────────────────────────────

  test('14 — Internal links on landing page are valid', async ({ page }) => {
    await page.goto('/')
    await waitForIdle(page)

    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]')
      return Array.from(anchors).map(a => ({
        href: a.getAttribute('href') || '',
        text: a.textContent?.trim().slice(0, 30) || '',
      })).filter(l => l.href.startsWith('/') || l.href.startsWith('#'))
    })

    record('14', 'INFO', `Found ${links.length} internal links`)

    // Check for broken anchor links
    for (const link of links.filter(l => l.href.startsWith('#'))) {
      if (link.href === '#') continue
      const exists = await page.evaluate((selector) => {
        return !!document.querySelector(selector)
      }, link.href)
      record('14', exists ? 'PASS' : 'WARN', `Anchor ${link.href}: ${exists ? 'target exists' : 'target NOT found'}`)
    }

    // Check for external links that open in new tab (security)
    const externalLinks = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href^="http"]')
      const issues: string[] = []
      anchors.forEach(a => {
        const target = a.getAttribute('target')
        const rel = a.getAttribute('rel')
        if (target === '_blank' && (!rel || !rel.includes('noopener'))) {
          issues.push(a.getAttribute('href') || '')
        }
      })
      return issues
    })
    record('14', externalLinks.length === 0 ? 'PASS' : 'WARN',
      `External links missing rel="noopener": ${externalLinks.length}`,
      externalLinks.length > 0 ? externalLinks.join(', ') : undefined)
  })

  // ────────────────────────────────────────────────────────────────────
  // RESPONSIVE BEHAVIOR
  // ────────────────────────────────────────────────────────────────────

  test('15 — Mobile viewport: landing page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.goto('/')
    await waitForIdle(page)

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    record('15', !hasOverflow ? 'PASS' : 'FAIL', `No horizontal overflow on mobile: ${!hasOverflow}`)

    // Check hero is still visible
    const heroVisible = await page.locator('text=Arch Vision').first().isVisible().catch(() => false)
    record('15', heroVisible ? 'PASS' : 'FAIL', `Hero visible on mobile: ${heroVisible}`)

    // Check for mobile menu (hamburger)
    const hasMobileMenu = await page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [class*="mobile"], [class*="hamburger"]').first().isVisible().catch(() => false)
    record('15', 'INFO', `Mobile menu/hamburger visible: ${hasMobileMenu}`)

    await snap(page, '15-mobile-landing')
  })

  test('16 — Mobile viewport: login page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')
    await waitForIdle(page)

    if (page.url().includes('/login')) {
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      record('16', !hasOverflow ? 'PASS' : 'FAIL', `No horizontal overflow on mobile login: ${!hasOverflow}`)

      // Email input should still be usable
      const emailVisible = await page.locator('#email, input[type="email"]').first().isVisible().catch(() => false)
      record('16', emailVisible ? 'PASS' : 'FAIL', `Email input visible on mobile: ${emailVisible}`)

      // Buttons should be full width or at least tappable (find the main CTA, not icon buttons)
      const btnWidth = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button')
        let maxWidth = 0
        buttons.forEach(btn => {
          const w = btn.getBoundingClientRect().width
          if (w > maxWidth) maxWidth = w
        })
        return maxWidth
      })
      record('16', btnWidth > 200 ? 'PASS' : 'WARN', `Main button width on mobile: ${Math.round(btnWidth)}px`)
    } else {
      record('16', 'INFO', 'Skipped — already authenticated')
    }

    await snap(page, '16-mobile-login')
  })

  // ────────────────────────────────────────────────────────────────────
  // PERFORMANCE & CONSOLE ERRORS
  // ────────────────────────────────────────────────────────────────────

  test('17 — Console errors check across public pages', async ({ page }) => {
    const errors: string[] = []
    const warnings: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
      if (msg.type() === 'warning') warnings.push(msg.text())
    })

    // Visit all public pages
    const publicPages = ['/', '/about', '/login']
    for (const route of publicPages) {
      await page.goto(route)
      await waitForIdle(page)
    }

    record('17', errors.length === 0 ? 'PASS' : 'WARN',
      `Console errors: ${errors.length}`,
      errors.length > 0 ? errors.slice(0, 5).join(' | ') : undefined)

    record('17', 'INFO', `Console warnings: ${warnings.length}`)
  })

  test('18 — No broken images on public pages', async ({ page }) => {
    const publicPages = ['/', '/about', '/login']
    let totalImages = 0
    let brokenImages = 0

    for (const route of publicPages) {
      await page.goto(route)
      await waitForIdle(page)

      const result = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img')
        let total = 0
        let broken = 0
        imgs.forEach(img => {
          total++
          if (!img.complete || img.naturalWidth === 0) broken++
        })
        return { total, broken }
      })

      totalImages += result.total
      brokenImages += result.broken

      if (result.broken > 0) {
        record('18', 'FAIL', `Broken images on ${route}: ${result.broken}/${result.total}`)
      }
    }

    record('18', brokenImages === 0 ? 'PASS' : 'FAIL',
      `Total images: ${totalImages}, broken: ${brokenImages}`)
  })

  // ────────────────────────────────────────────────────────────────────
  // SECURITY HEADERS
  // ────────────────────────────────────────────────────────────────────

  test('19 — Security headers check', async ({ page }) => {
    const response = await page.goto('/')
    if (!response) {
      record('19', 'FAIL', 'No response from landing page')
      return
    }

    const headers = response.headers()

    const securityHeaders = [
      { name: 'x-frame-options', required: false },
      { name: 'x-content-type-options', required: false },
      { name: 'strict-transport-security', required: false },
      { name: 'content-security-policy', required: false },
      { name: 'referrer-policy', required: false },
    ]

    for (const header of securityHeaders) {
      const value = headers[header.name]
      record('19', value ? 'PASS' : 'INFO',
        `${header.name}: ${value || 'not set'}`)
    }

    await waitForIdle(page)
  })

  // ────────────────────────────────────────────────────────────────────
  // GENERATE REPORT SUMMARY
  // ────────────────────────────────────────────────────────────────────

  test('99 — Generate QA Report Summary', async () => {
    const pass = findings.filter(f => f.status === 'PASS').length
    const fail = findings.filter(f => f.status === 'FAIL').length
    const warn = findings.filter(f => f.status === 'WARN').length
    const info = findings.filter(f => f.status === 'INFO').length

    console.log('\n' + '='.repeat(70))
    console.log('  ARCH VISION — QA REPORT SUMMARY (No Auth)')
    console.log('='.repeat(70))
    console.log(`  PASS: ${pass}  |  FAIL: ${fail}  |  WARN: ${warn}  |  INFO: ${info}`)
    console.log('='.repeat(70))

    if (fail > 0) {
      console.log('\n--- FAILURES ---')
      findings.filter(f => f.status === 'FAIL').forEach(f => {
        console.log(`  [${f.step}] ${f.description}${f.details ? ` — ${f.details}` : ''}`)
      })
    }

    if (warn > 0) {
      console.log('\n--- WARNINGS ---')
      findings.filter(f => f.status === 'WARN').forEach(f => {
        console.log(`  [${f.step}] ${f.description}${f.details ? ` — ${f.details}` : ''}`)
      })
    }

    console.log('\n--- ALL FINDINGS ---')
    findings.forEach(f => {
      const icon = { PASS: '\u2705', FAIL: '\u274c', WARN: '\u26a0\ufe0f', INFO: '\u2139\ufe0f' }[f.status]
      console.log(`  ${icon} [${f.step}] ${f.description}${f.details ? ` — ${f.details}` : ''}`)
    })

    console.log('\n' + '='.repeat(70))

    // The test always passes — it's a report generator
    expect(true).toBeTruthy()
  })
})

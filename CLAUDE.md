# tech challenge 5 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-12

## Active Technologies
- TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `next-themes` (new), `lucide-react` (existing — Sun, Moon, Monitor icons) (002-dark-mode)
- N/A (client-side localStorage only, managed by next-themes) (002-dark-mode)
- TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `@supabase/ssr` 0.8.x, `@supabase/supabase-js` 2.95.x, `lucide-react` 0.563.x, `next-themes` 0.4.x (003-email-magic-login)
- Supabase Auth (managed) + existing `public.users` table (no changes) (003-email-magic-login)
- TypeScript 5.x, React 19, Next.js 16.1.6 + html2canvas-pro 1.6.6, jspdf 4.1.0 (both already installed, dynamically imported) (005-pdf-a4-formatting)
- N/A (client-side PDF generation only) (005-pdf-a4-formatting)
- TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `@supabase/ssr` 0.8.x, `@supabase/supabase-js` 2.95.x, `react-markdown` 10.x, `lucide-react` 0.563.x, `next-themes` 0.4.x (006-report-chat-consultant)
- Supabase PostgreSQL (new tables: `chat_conversations`, `chat_messages`) (006-report-chat-consultant)

- TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `@supabase/ssr`, `@supabase/supabase-js`, `stripe`, `lucide-react`, `@react-pdf/renderer` (or `html2pdf.js`), `react-markdown`, `@tailwindcss/typography` (001-arch-vision-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, Next.js 16.1.6, React 19.2.3: Follow standard conventions

## Recent Changes
- 006-report-chat-consultant: Added TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `@supabase/ssr` 0.8.x, `@supabase/supabase-js` 2.95.x, `react-markdown` 10.x, `lucide-react` 0.563.x, `next-themes` 0.4.x
- 005-pdf-a4-formatting: Added TypeScript 5.x, React 19, Next.js 16.1.6 + html2canvas-pro 1.6.6, jspdf 4.1.0 (both already installed, dynamically imported)
- 003-email-magic-login: Added TypeScript 5.x, Next.js 16.1.6, React 19.2.3 + `@supabase/ssr` 0.8.x, `@supabase/supabase-js` 2.95.x, `lucide-react` 0.563.x, `next-themes` 0.4.x


<!-- MANUAL ADDITIONS START -->

## Playwright E2E Testing

When running Playwright tests that require authenticated access (GitHub OAuth login):

- **Email:** robsoncaliixto@gmail.com
- **Password:** 4mONhtQ5E1J5J1cali7X
- **Provider:** GitHub

Prefer using the existing E2E session API (`/api/auth/e2e-session`) with the `E2E_TEST_SECRET` env var for automated tests. Use the GitHub credentials above only when manual browser login via Playwright is required (e.g., visual QA or OAuth flow testing).

These credentials must NEVER be committed to test files, specs, or any tracked source code.

<!-- MANUAL ADDITIONS END -->

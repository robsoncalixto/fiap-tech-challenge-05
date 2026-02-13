import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/e2e-session
 *
 * Creates an authenticated session for E2E tests.
 * 1. Generates a magic link token via Admin SDK
 * 2. Verifies the OTP server-side using the SSR client (sets cookies)
 * 3. Returns success — browser now has valid session cookies
 *
 * Guarded by E2E_TEST_SECRET — returns 404 when not configured.
 */
export async function POST(request: Request) {
  const secret = process.env.E2E_TEST_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'E2E auth not configured' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  if (body.secret !== secret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const email = process.env.E2E_USER_EMAIL
  if (!email) {
    return NextResponse.json({ error: 'E2E_USER_EMAIL not set' }, { status: 500 })
  }

  const admin = createAdminClient()

  // Ensure test user exists
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const userExists = existingUsers?.users?.some((u) => u.email === email)

  if (!userExists) {
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    })
    if (createError && !createError.message.includes('already')) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
  }

  // Generate magic link to get the OTP token
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkError || !linkData) {
    return NextResponse.json({ error: linkError?.message || 'Failed to generate link' }, { status: 500 })
  }

  const tokenHash = linkData.properties.hashed_token

  // Verify the OTP using the SSR server client — this sets session cookies
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: session, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  })

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 })
  }

  // Ensure test user has credits for analysis
  if (session.user) {
    const { data: profile } = await admin
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.credits < 2) {
      await admin
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          credits: 5,
          tier: 'starter',
        }, { onConflict: 'id' })
    }
  }

  return NextResponse.json({
    ok: true,
    user: session.user?.email,
  })
}

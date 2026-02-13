'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Mail, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

type LoginStep = 'form' | 'magic-link-sent'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const next = searchParams.get('next') || '/dashboard'
  const authError = searchParams.get('error') === 'auth'

  const [step, setStep] = useState<LoginStep>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authError ? 'Link expirado ou inválido. Tente novamente.' : '')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router, supabase.auth])

  useEffect(() => {
    if (cooldown <= 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  async function handleMagicLink() {
    if (!email.trim()) {
      setError('Informe seu email.')
      return
    }
    setLoading(true)
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    setStep('magic-link-sent')
    setCooldown(60)
  }

  async function handleGitHubLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  function handleBack() {
    setStep('form')
    setError('')
  }

  // Form state
  if (step === 'form') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="font-heading text-2xl font-bold">Arch Vision</h1>
            </div>

            <div className="text-center">
              <h2 className="text-lg font-semibold">Bem-vindo de volta</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Entre com sua conta para continuar
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              {error && (
                <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMagicLink()
                }}
              />

              <Button
                size="lg"
                className="w-full"
                onClick={handleMagicLink}
                loading={loading}
              >
                <Mail className="h-5 w-5" />
                Enviar Link Mágico
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-text-muted">ou</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleGitHubLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continuar com GitHub
              </Button>
            </div>

            <p className="text-xs text-text-muted text-center">
              Ao continuar, você concorda com nossos Termos de Serviço e Política
              de Privacidade.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Magic link sent state
  if (step === 'magic-link-sent') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6 py-4">
            <Mail className="h-12 w-12 text-primary" />

            <div className="text-center">
              <h2 className="text-lg font-semibold">Verifique seu email</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Enviamos um link mágico para <strong>{email}</strong>
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleMagicLink}
                disabled={cooldown > 0}
                loading={loading}
              >
                {cooldown > 0 ? `Reenviar (${cooldown}s)` : 'Reenviar'}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return null
}

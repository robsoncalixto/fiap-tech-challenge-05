'use client'

import { useState, useEffect } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/app/actions/credits'
import { toast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'

const features = {
  starter: ['1 crédito por mês', 'Gemini 2.0 Flash Lite', 'Relatórios STRIDE', 'Links compartilháveis'],
  pro: ['5 créditos por mês', 'Todos os modelos de IA', 'Exportação em PDF', 'Links compartilháveis', 'Suporte prioritário'],
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)
  const [currentTier, setCurrentTier] = useState('starter')

  useEffect(() => {
    async function loadTier() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('tier').eq('id', user.id).single()
        if (data) setCurrentTier(data.tier)
      }
    }
    loadTier()
  }, [])

  async function handleUpgrade() {
    setLoading(true)
    try {
      const { checkoutUrl } = await createCheckoutSession()
      window.location.href = checkoutUrl
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Erro ao iniciar checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Planos</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Compare os planos e escolha o melhor para você
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className={`rounded-2xl border p-8 ${currentTier === 'starter' ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
          {currentTier === 'starter' && (
            <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary mb-4">
              Plano Atual
            </span>
          )}
          <h3 className="font-heading text-xl font-bold">Starter</h3>
          <div className="mt-2">
            <span className="font-heading text-4xl font-bold">Grátis</span>
          </div>
          <ul className="mt-6 space-y-3">
            {features.starter.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-2xl border p-8 ${currentTier === 'pro' ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
          {currentTier === 'pro' ? (
            <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary mb-4">
              Plano Atual
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-4">
              <Sparkles className="h-3 w-3" />
              Recomendado
            </span>
          )}
          <h3 className="font-heading text-xl font-bold">Pro</h3>
          <div className="mt-2">
            <span className="font-heading text-4xl font-bold">R$49</span>
            <span className="text-text-secondary">/mês</span>
          </div>
          <ul className="mt-6 space-y-3">
            {features.pro.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-success" />
                {f}
              </li>
            ))}
          </ul>
          {currentTier !== 'pro' && (
            <Button
              className="mt-8 w-full"
              size="lg"
              loading={loading}
              onClick={handleUpgrade}
            >
              Assinar Pro
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Grátis',
    period: '',
    description: 'Perfeito para experimentar',
    features: [
      '1 crédito por mês',
      'Modelo Gemini 2.0 Flash Lite',
      'Relatórios STRIDE completos',
      'Links compartilháveis',
    ],
    cta: 'Começar Grátis',
    href: '/login',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$49',
    period: '/mês',
    description: 'Para equipes e profissionais',
    features: [
      '5 créditos por mês',
      'Todos os modelos de IA',
      'Exportação em PDF',
      'Links compartilháveis',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    href: '/login',
    highlighted: true,
  },
]

export function PricingCards() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-heading text-3xl font-bold">Preços Simples</h2>
          <p className="mt-3 text-text-secondary">Comece grátis e faça upgrade quando precisar</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? 'border-primary bg-surface shadow-lg ring-1 ring-primary'
                  : 'border-border bg-surface'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-white mb-4">
                  Mais Popular
                </span>
              )}
              <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>
              <div className="mt-4">
                <span className="font-heading text-4xl font-bold">{plan.price}</span>
                <span className="text-text-secondary">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-lg py-3 text-center text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-border bg-surface hover:bg-surface-secondary'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

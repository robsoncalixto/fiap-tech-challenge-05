'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'O que é análise STRIDE?',
    a: 'STRIDE é uma metodologia de modelagem de ameaças desenvolvida pela Microsoft que categoriza ameaças em 6 tipos: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service e Elevation of Privilege.',
  },
  {
    q: 'Quais formatos de diagrama são aceitos?',
    a: 'Aceitamos imagens nos formatos PNG, JPG e SVG com tamanho máximo de 10MB. Diagramas de qualquer ferramenta (draw.io, Excalidraw, Lucidchart, etc.) são suportados.',
  },
  {
    q: 'Como funcionam os créditos?',
    a: 'Cada análise consome 1 crédito. O plano Starter inclui 1 crédito/mês e o Pro inclui 5 créditos/mês. Os créditos são renovados no início de cada período de cobrança.',
  },
  {
    q: 'Posso cancelar minha assinatura?',
    a: 'Sim, você pode cancelar a qualquer momento. Após o cancelamento, você mantém acesso ao plano Pro até o final do período de cobrança atual, depois volta ao plano Starter.',
  },
  {
    q: 'Meus diagramas estão seguros?',
    a: 'Sim. Os diagramas são armazenados em buckets privados com políticas de segurança (RLS) que garantem que apenas você pode acessar seus arquivos.',
  },
  {
    q: 'Quanto tempo leva uma análise?',
    a: 'A maioria das análises é concluída em menos de 2 minutos. O tempo pode variar dependendo da complexidade do diagrama e do modelo de IA selecionado.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-surface-secondary">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold">Perguntas Frequentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span className="text-sm font-medium text-text">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-text-muted shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-96 pb-4' : 'max-h-0'
                }`}
                role="region"
              >
                <p className="px-6 text-sm text-text-secondary">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

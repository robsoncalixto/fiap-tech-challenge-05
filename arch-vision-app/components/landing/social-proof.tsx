import { Shield, AlertTriangle, FileText, Users } from 'lucide-react'

const metrics = [
  { label: 'Análises Realizadas', value: '500+', icon: FileText },
  { label: 'Ameaças Identificadas', value: '2.500+', icon: AlertTriangle },
  { label: 'Modelos STRIDE', value: '6 categorias', icon: Shield },
  { label: 'Usuários Ativos', value: '100+', icon: Users },
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-surface-secondary py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <metric.icon className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="font-heading text-2xl font-bold text-text">{metric.value}</p>
              <p className="text-sm text-text-secondary">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

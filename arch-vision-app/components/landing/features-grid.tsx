import { Shield, Cpu, FileDown, Link2, Zap, Lock, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Análise STRIDE Completa',
    description: 'Todas as 6 categorias de ameaças analisadas: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.',
  },
  {
    icon: Cpu,
    title: 'Múltiplos Modelos de IA',
    description: 'Escolha entre os melhores modelos de IA incluindo Claude, GPT-4o e Gemini para suas análises.',
  },
  {
    icon: FileDown,
    title: 'Exportação em PDF',
    description: 'Exporte seus relatórios como PDFs profissionais com branding e classificações de severidade coloridas.',
  },
  {
    icon: Link2,
    title: 'Links Compartilháveis',
    description: 'Gere links únicos para compartilhar relatórios com sua equipe sem necessidade de login.',
  },
  {
    icon: MessageSquare,
    title: 'Consultor de Segurança via Chat',
    description: 'Discuta os pontos fracos da sua arquitetura com um consultor sênior de segurança. Tire dúvidas e aprofunde a análise em tempo real.',
  },
  {
    icon: Zap,
    title: 'Resultados em Minutos',
    description: 'Receba relatórios detalhados de ameaças em menos de 2 minutos após o upload do diagrama.',
  },
  {
    icon: Lock,
    title: 'Dados Seguros',
    description: 'Seus diagramas são armazenados com criptografia e acessíveis apenas por você.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-heading text-3xl font-bold">Funcionalidades</h2>
          <p className="mt-3 text-text-secondary">
            Tudo que você precisa para análise de segurança de arquitetura
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-surface p-6 hover:shadow-md transition-shadow"
            >
              <div className="rounded-lg bg-primary-light p-3 w-fit">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

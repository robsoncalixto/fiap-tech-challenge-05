import { Upload, Cpu, FileText } from 'lucide-react'

const steps = [
  {
    step: 1,
    icon: Upload,
    title: 'Upload do Diagrama',
    description: 'Faça upload do seu diagrama de arquitetura em PNG, JPG ou SVG.',
  },
  {
    step: 2,
    icon: Cpu,
    title: 'IA Analisa',
    description: 'Nossa IA examina cada componente e fluxo de dados usando a metodologia STRIDE.',
  },
  {
    step: 3,
    icon: FileText,
    title: 'Receba o Relatório',
    description: 'Obtenha um relatório detalhado com ameaças classificadas por severidade e recomendações.',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-surface-secondary py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-heading text-3xl font-bold">Como Funciona</h2>
          <p className="mt-3 text-text-secondary">Três passos simples para proteger sua arquitetura</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                <item.icon className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {item.step}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

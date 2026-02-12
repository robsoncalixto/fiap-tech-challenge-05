import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            Análise STRIDE automatizada por IA
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
            Transforme Diagramas em{' '}
            <span className="text-primary">Relatórios de Segurança</span>
          </h1>
          <p className="mt-6 text-lg text-text-secondary">
            Faça upload do seu diagrama de arquitetura e receba um relatório completo de ameaças STRIDE com classificações de severidade e recomendações acionáveis — em menos de 2 minutos.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Analisar Meu Diagrama Grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              Saiba mais
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

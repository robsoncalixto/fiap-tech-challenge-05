import { Metadata } from 'next'
import { Users, Mail, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Sobre Nós — Arch Vision',
  description: 'Conheça o Grupo 46, responsável pelo desenvolvimento do Arch Vision.',
}

const members = [
  {
    name: 'Araguacy Bezerra Pereira',
    email: 'araguacybp@yahoo.com.br',
  },
  {
    name: 'Robson Carvalho Calixto',
    email: 'robsoncaliixto@gmail.com',
  },
  {
    name: 'Vinícius Fernando Marcondes Costa',
    email: 'mcostavini98@gmail.com',
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-sm text-text-secondary">
          <Users className="h-4 w-4 text-primary" />
          Grupo 46
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Sobre Nós
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Somos o Grupo 46, responsáveis pelo desenvolvimento do{' '}
          <span className="font-semibold text-primary">Arch Vision</span> — uma
          plataforma de modelagem de ameaças automatizada com análise STRIDE
          para arquiteturas de software.
        </p>
      </div>

      {/* Project Summary */}
      <div className="mx-auto mt-16 max-w-3xl">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">O Projeto</h2>
              <p className="mt-2 leading-relaxed text-text-secondary">
                O Arch Vision permite que equipes de desenvolvimento façam upload
                de diagramas de arquitetura e recebam relatórios de análise de
                ameaças STRIDE gerados por inteligência artificial, com
                classificação de severidade e recomendações práticas de
                mitigação.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-8 text-center font-heading text-2xl font-semibold">
          Integrantes
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {members.map((member) => (
            <Card key={member.email} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <span className="font-heading text-lg font-bold text-primary">
                  {member.name
                    .split(' ')
                    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <h3 className="font-heading text-sm font-semibold leading-snug">
                {member.name}
              </h3>
              <a
                href={`mailto:${member.email}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
              >
                <Mail className="h-3 w-3" />
                {member.email}
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

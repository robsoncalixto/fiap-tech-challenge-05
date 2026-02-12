import { FileText, CreditCard, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils/format'

interface StatsCardsProps {
  credits: number
  totalAnalyses: number
  lastAnalysisDate: string | null
}

export function StatsCards({ credits, totalAnalyses, lastAnalysisDate }: StatsCardsProps) {
  const stats = [
    {
      label: 'Créditos Disponíveis',
      value: credits,
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary-light',
    },
    {
      label: 'Total de Análises',
      value: totalAnalyses,
      icon: FileText,
      color: 'text-secondary',
      bgColor: 'bg-info-bg',
    },
    {
      label: 'Última Análise',
      value: lastAnalysisDate ? formatRelativeDate(lastAnalysisDate) : 'Nenhuma',
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-warning-bg',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${stat.bgColor}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="text-xl font-semibold text-text">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

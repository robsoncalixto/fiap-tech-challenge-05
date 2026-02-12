'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeDate } from '@/lib/utils/format'
import { deleteReport } from '@/app/actions/reports'
import { toast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

interface Report {
  id: string
  image_url: string
  ai_model: string
  status: string
  created_at: string
  signedUrl?: string
}

interface ReportsTableProps {
  reports: Report[]
}

const statusVariant: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  pending: 'default',
  processing: 'info',
  completed: 'success',
  failed: 'warning',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const router = useRouter()

  async function handleDelete(e: React.MouseEvent, reportId: string) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteReport(reportId)
      toast('success', 'Relatório excluído')
      router.refresh()
    } catch {
      toast('error', 'Erro ao excluir relatório')
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-secondary">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Diagrama</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Modelo</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Data</th>
            <th className="px-4 py-3 font-medium text-text-secondary sr-only">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-surface-secondary transition-colors">
              <td className="px-4 py-3">
                <Link href={`/report/${report.id}`} className="flex items-center gap-3">
                  {report.signedUrl ? (
                    <img
                      src={report.signedUrl}
                      alt=""
                      className="h-10 w-10 rounded border border-border object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded border border-border bg-surface-tertiary" />
                  )}
                  <span className="font-medium text-text hover:text-primary transition-colors">
                    Ver relatório
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-text-secondary">{report.ai_model.split('/').pop()}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[report.status] || 'default'}>
                  {statusLabel[report.status] || report.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {formatRelativeDate(report.created_at)}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(e, report.id)}
                  aria-label="Excluir relatório"
                >
                  <Trash2 className="h-4 w-4 text-text-muted" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReportContent } from '@/components/report/report-content'
import { DiagramPreview } from '@/components/report/diagram-preview'
import { parseSeverity } from '@/lib/utils/severity-parser'

interface Report {
  id: string
  status: string
  image_url: string
  ai_model: string
  context_text: string | null
  result_markdown: string | null
  severity_summary: { critical: number; high: number; medium: number; low: number } | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  share_token: string | null
}

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('share_token', token)
    .single()

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full space-y-6 text-center">
          <h1 className="font-heading text-3xl font-bold">Relatório não encontrado</h1>
          <p className="text-text-secondary">
            Este link de compartilhamento não existe ou foi removido.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ir para página inicial
          </Link>
        </div>
      </div>
    )
  }

  const reportData = report as Report

  if (reportData.status !== 'completed' || !reportData.result_markdown) {
    notFound()
  }

  let imageUrl: string | null = null
  if (reportData.image_url) {
    const { data: signedData } = await supabase.storage
      .from('diagrams')
      .createSignedUrl(reportData.image_url, 3600)

    if (signedData) {
      imageUrl = signedData.signedUrl
    }
  }

  const severitySummary = reportData.severity_summary || parseSeverity(reportData.result_markdown)

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>Compartilhado via</span>
              <Link href="/" className="font-semibold text-primary hover:underline">
                Arch Vision
              </Link>
            </div>
            <h1 className="font-heading text-2xl font-bold">Relatório STRIDE</h1>
            <p className="text-sm text-text-secondary">Modelo: {reportData.ai_model}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {imageUrl && <DiagramPreview imageUrl={imageUrl} />}

        {reportData.result_markdown && (
          <div id="report-content">
            <ReportContent
              markdown={reportData.result_markdown}
              severitySummary={severitySummary}
            />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-text-secondary mb-4">
            Gostou desta análise de segurança?
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Analise seus diagramas em archvision.com.br
          </Link>
        </div>
      </div>
    </div>
  )
}

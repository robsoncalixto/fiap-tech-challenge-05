'use client'

import { useEffect, useState, useRef, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProcessingStatus } from '@/components/report/processing-status'
import { ReportContent } from '@/components/report/report-content'
import { ReportToolbar } from '@/components/report/report-toolbar'
import { DiagramPreview } from '@/components/report/diagram-preview'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<Report | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [tier, setTier] = useState('starter')
  const triggeredRef = useRef(false)
  const loadedRef = useRef(false)

  const loadReport = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setReport(data as Report)

      const { data: signedData } = await supabase.storage
        .from('diagrams')
        .createSignedUrl(data.image_url, 3600)

      if (signedData) {
        setImageUrl(signedData.signedUrl)
      }

      // Trigger analysis for pending reports
      if (data.status === 'pending' && !triggeredRef.current) {
        triggeredRef.current = true
        fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: id }),
        })
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()
      if (profile) setTier(profile.tier)
    }
  }, [id])

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
      loadReport()
    }
  }, [loadReport])

  if (!report) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-tertiary border-t-primary" />
      </div>
    )
  }

  if (report.status === 'pending' || report.status === 'processing') {
    return (
      <ProcessingStatus
        reportId={id}
        onComplete={loadReport}
        onFailed={(error) => {
          setReport({ ...report, status: 'failed', error_message: error })
        }}
      />
    )
  }

  if (report.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-12 w-12 text-error" />
        <h3 className="text-lg font-semibold">Análise falhou</h3>
        <p className="text-sm text-text-secondary max-w-md text-center">
          {report.error_message || 'Ocorreu um erro durante a análise. Seu crédito foi reembolsado.'}
        </p>
        <Button variant="secondary" onClick={() => window.location.href = '/analyze'}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Relatório STRIDE</h1>
          <p className="text-sm text-text-secondary">Modelo: {report.ai_model}</p>
        </div>
        <ReportToolbar reportId={id} tier={tier} />
      </div>

      {imageUrl && <DiagramPreview imageUrl={imageUrl} />}

      {report.result_markdown && (
        <div id="report-content">
          <ReportContent
            markdown={report.result_markdown}
            severitySummary={report.severity_summary}
          />
        </div>
      )}
    </div>
  )
}

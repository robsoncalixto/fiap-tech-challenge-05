'use client'

import { useState } from 'react'
import { Trash2, Link2, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteReport, generateShareToken } from '@/app/actions/reports'
import { toast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

interface ReportToolbarProps {
  reportId: string
  tier: string
}

export function ReportToolbar({ reportId, tier }: ReportToolbarProps) {
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteReport(reportId)
      toast('success', 'Relatório excluído com sucesso')
      router.push('/dashboard')
    } catch {
      toast('error', 'Erro ao excluir relatório')
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  async function handleExportPdf() {
    if (tier !== 'pro') {
      router.push('/upgrade')
      return
    }

    setExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('report-content')
      if (!element) {
        toast('error', 'Conteúdo do relatório não encontrado')
        return
      }

      // Force light mode for PDF so text is readable on white background
      const root = document.documentElement
      const wasDark = root.classList.contains('dark')
      if (wasDark) {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }

      // Save scroll position before capture
      const scrollX = window.scrollX
      const scrollY = window.scrollY

      // Brief delay for styles to repaint
      await new Promise(r => setTimeout(r, 100))

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (html2pdf() as any)
          .set({
            margin: [15, 10, 15, 10],
            filename: `arch-vision-report-${reportId}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              scrollX: 0,
              scrollY: -scrollY,
              windowWidth: element.scrollWidth,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] },
          })
          .from(element)
          .save()

        toast('success', 'PDF exportado com sucesso')
      } finally {
        // Restore scroll position after capture
        window.scrollTo(scrollX, scrollY)
        // Restore dark mode if it was active
        if (wasDark) {
          root.classList.add('dark')
          root.style.colorScheme = 'dark'
        }
      }
    } catch {
      toast('error', 'Erro ao gerar PDF')
    } finally {
      setExporting(false)
    }
  }

  async function handleShareLink() {
    setSharing(true)
    try {
      const { shareUrl } = await generateShareToken(reportId)
      const fullUrl = `${window.location.origin}${shareUrl}`
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast('success', 'Link copiado para a área de transferência')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast('error', 'Erro ao gerar link de compartilhamento')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleShareLink}
        loading={sharing}
        aria-label="Copiar link de compartilhamento"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Compartilhar'}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExportPdf}
        loading={exporting}
        disabled={tier !== 'pro' && !exporting}
        title={tier !== 'pro' ? 'Disponível no plano Pro' : 'Exportar PDF'}
        aria-label={tier !== 'pro' ? 'Exportar PDF - disponível no plano Pro' : 'Exportar PDF'}
      >
        <Download className="h-4 w-4" />
        {tier !== 'pro' ? 'PDF (Pro)' : 'PDF'}
      </Button>

      {showConfirm ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Confirmar exclusão?</span>
          <Button variant="destructive" size="sm" loading={deleting} onClick={handleDelete}>
            Sim, excluir
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setShowConfirm(true)} aria-label="Excluir relatório">
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      )}
    </div>
  )
}

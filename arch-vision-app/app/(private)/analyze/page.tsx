'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/analyze/upload-zone'
import { ContextInput } from '@/components/analyze/context-input'
import { ModelSelect } from '@/components/analyze/model-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uploadAndCreateReport } from '@/app/actions/upload'
import { toast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function AnalyzePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [context, setContext] = useState('')
  const [model, setModel] = useState('google/gemini-2.5-flash-lite')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [tier, setTier] = useState('starter')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('credits, tier')
          .eq('id', user.id)
          .single()
        if (data) {
          setCredits(data.credits)
          setTier(data.tier)
        }
      }
    }
    loadProfile()
  }, [])

  async function handleSubmit() {
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context)
      formData.append('model', model)

      const { reportId } = await uploadAndCreateReport(formData)
      router.push(`/report/${reportId}`)
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Erro ao criar análise')
    } finally {
      setLoading(false)
    }
  }

  const noCredits = credits !== null && credits <= 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Nova Análise STRIDE</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Faça upload do seu diagrama de arquitetura para receber um relatório de ameaças
        </p>
      </div>

      {credits !== null && (
        <p className="text-sm text-text-secondary">
          Créditos disponíveis: <strong>{credits}</strong>
        </p>
      )}

      <Card>
        <div className="space-y-6">
          <UploadZone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          <ContextInput value={context} onChange={setContext} />
          <ModelSelect value={model} onChange={setModel} tier={tier} />

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            loading={loading}
            disabled={!file || noCredits}
          >
            {noCredits ? 'Sem créditos — Fazer Upgrade' : 'Iniciar Análise'}
          </Button>

          {noCredits && (
            <p className="text-center text-sm text-text-muted">
              <a href="/upgrade" className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                Adquira mais créditos
              </a>{' '}
              para continuar analisando.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

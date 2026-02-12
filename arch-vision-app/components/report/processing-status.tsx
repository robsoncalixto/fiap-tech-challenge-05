'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProcessingStatusProps {
  reportId: string
  onComplete: () => void
  onFailed: (error: string) => void
}

export function ProcessingStatus({ reportId, onComplete, onFailed }: ProcessingStatusProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai/status/${reportId}`)
        const data = await res.json()

        if (data.status === 'completed') {
          clearInterval(poller)
          clearInterval(timer)
          onComplete()
        } else if (data.status === 'failed') {
          clearInterval(poller)
          clearInterval(timer)
          onFailed(data.errorMessage || 'Analysis failed')
        }
      } catch {
        // Continue polling on network error
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(poller)
    }
  }, [reportId, onComplete, onFailed])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-surface-tertiary" />
        <Loader2 className="absolute inset-0 m-auto h-12 w-12 text-primary animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text">Analisando seu diagrama...</h3>
        <p className="mt-1 text-sm text-text-secondary">
          A IA está identificando ameaças STRIDE na sua arquitetura
        </p>
        <p className="mt-3 text-sm font-mono text-text-muted">
          {minutes > 0 ? `${minutes}m ` : ''}{seconds.toString().padStart(2, '0')}s
        </p>
      </div>
    </div>
  )
}

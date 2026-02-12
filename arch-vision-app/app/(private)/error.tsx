'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PrivateError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-error" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">
            Algo deu errado
          </h1>
          {error.message && (
            <p className="text-sm text-text-secondary">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>
            Tentar novamente
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-4 py-2 text-sm bg-surface-secondary text-text border border-border hover:bg-surface-tertiary"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

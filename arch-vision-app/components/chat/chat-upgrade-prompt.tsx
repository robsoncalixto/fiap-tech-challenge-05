'use client'

import Link from 'next/link'
import { Lock, MessageSquare } from 'lucide-react'

export function ChatUpgradePrompt() {
  return (
    <div className="flex flex-col w-full lg:w-[400px] lg:min-w-[400px] h-[500px] lg:h-[calc(100vh-8rem)] border border-border rounded-xl bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-text-muted" />
          <h3 className="text-sm font-semibold font-heading text-text-muted">Consultor de Segurança</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">Pro</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-secondary mb-4">
          <Lock size={28} className="text-text-muted" />
        </div>

        <h4 className="text-lg font-semibold font-heading mb-2">Consultor de Segurança</h4>

        <p className="text-sm text-text-secondary mb-6 max-w-[280px]">
          Interaja com um consultor de segurança especializado para explorar os achados do seu relatório em profundidade.
        </p>

        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
        >
          Fazer upgrade para Pro
        </Link>
      </div>
    </div>
  )
}

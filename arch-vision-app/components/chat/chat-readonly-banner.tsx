'use client'

import { Lock } from 'lucide-react'

export function ChatReadonlyBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-tertiary rounded-t-xl border-b border-border">
      <Lock size={14} className="text-text-muted" />
      <span className="text-xs text-text-muted">Este chat é somente leitura</span>
    </div>
  )
}

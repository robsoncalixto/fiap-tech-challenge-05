'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

interface DiagramPreviewProps {
  imageUrl: string
}

export function DiagramPreview({ imageUrl }: DiagramPreviewProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`relative rounded-xl border border-border overflow-hidden bg-surface-secondary ${expanded ? 'fixed inset-4 z-50' : ''}`}>
      {expanded && (
        <div className="fixed inset-0 bg-black/50 -z-10" onClick={() => setExpanded(false)} />
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute right-3 top-3 rounded-lg bg-surface/80 p-2 shadow-sm hover:bg-surface backdrop-blur-sm z-10"
        aria-label={expanded ? 'Minimizar' : 'Expandir'}
      >
        {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <img
        src={imageUrl}
        alt="Diagrama de arquitetura"
        className={`w-full object-contain ${expanded ? 'h-full' : 'max-h-80'}`}
      />
    </div>
  )
}

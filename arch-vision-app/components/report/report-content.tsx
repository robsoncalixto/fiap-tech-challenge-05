'use client'

import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { SeverityBadge } from './severity-badge'
import type { SeveritySummary } from '@/lib/utils/severity-parser'

interface ReportContentProps {
  markdown: string
  severitySummary: SeveritySummary | null
}

function replaceSeverityTags(text: string): React.ReactNode[] {
  const parts = text.split(/(\[(?:CRITICAL|HIGH|MEDIUM|LOW)\])/gi)
  return parts.map((part, i) => {
    const match = part.match(/^\[(CRITICAL|HIGH|MEDIUM|LOW)\]$/i)
    if (match) {
      const severity = match[1].toLowerCase() as 'critical' | 'high' | 'medium' | 'low'
      return <SeverityBadge key={i} severity={severity} />
    }
    return part
  })
}

export function ReportContent({ markdown, severitySummary }: ReportContentProps) {
  useEffect(() => {
    console.log('[ReportContent] Mounted with markdown length:', markdown?.length ?? 0)
    console.log('[ReportContent] Markdown first 200 chars:', markdown?.substring(0, 200))
    console.log('[ReportContent] Severity summary:', severitySummary)
    console.log('[ReportContent] ReactMarkdown type:', typeof ReactMarkdown)
  }, [markdown, severitySummary])

  return (
    <div>
      {severitySummary && (
        <div className="mb-6 flex flex-wrap gap-3">
          {severitySummary.critical > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-severity-critical-bg px-3 py-2">
              <SeverityBadge severity="critical" />
              <span className="text-sm font-medium text-severity-critical">{severitySummary.critical}</span>
            </div>
          )}
          {severitySummary.high > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-severity-high-bg px-3 py-2">
              <SeverityBadge severity="high" />
              <span className="text-sm font-medium text-severity-high">{severitySummary.high}</span>
            </div>
          )}
          {severitySummary.medium > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-severity-medium-bg px-3 py-2">
              <SeverityBadge severity="medium" />
              <span className="text-sm font-medium text-severity-medium">{severitySummary.medium}</span>
            </div>
          )}
          {severitySummary.low > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-severity-low-bg px-3 py-2">
              <SeverityBadge severity="low" />
              <span className="text-sm font-medium text-severity-low">{severitySummary.low}</span>
            </div>
          )}
        </div>
      )}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              if (typeof children === 'string') {
                return <p>{replaceSeverityTags(children)}</p>
              }
              return <p>{children}</p>
            },
            li: ({ children }) => {
              if (typeof children === 'string') {
                return <li>{replaceSeverityTags(children)}</li>
              }
              return <li>{children}</li>
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  )
}

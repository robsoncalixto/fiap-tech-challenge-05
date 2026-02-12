export interface SeveritySummary {
  critical: number
  high: number
  medium: number
  low: number
}

export function parseSeverity(markdown: string): SeveritySummary {
  const critical = (markdown.match(/\[CRITICAL\]/gi) || []).length
  const high = (markdown.match(/\[HIGH\]/gi) || []).length
  const medium = (markdown.match(/\[MEDIUM\]/gi) || []).length
  const low = (markdown.match(/\[LOW\]/gi) || []).length

  return { critical, high, medium, low }
}

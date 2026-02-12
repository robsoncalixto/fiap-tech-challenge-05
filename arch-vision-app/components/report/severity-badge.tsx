import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react'

type Severity = 'critical' | 'high' | 'medium' | 'low'

interface SeverityBadgeProps {
  severity: Severity
}

const config: Record<Severity, { icon: typeof AlertTriangle; label: string; className: string }> = {
  critical: {
    icon: ShieldAlert,
    label: 'CRITICAL',
    className: 'bg-severity-critical-bg text-severity-critical',
  },
  high: {
    icon: AlertTriangle,
    label: 'HIGH',
    className: 'bg-severity-high-bg text-severity-high',
  },
  medium: {
    icon: AlertCircle,
    label: 'MEDIUM',
    className: 'bg-severity-medium-bg text-severity-medium',
  },
  low: {
    icon: Info,
    label: 'LOW',
    className: 'bg-severity-low-bg text-severity-low',
  },
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { icon: Icon, label, className } = config[severity]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

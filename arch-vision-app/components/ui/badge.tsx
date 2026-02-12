import { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-tertiary text-text-secondary',
  critical: 'bg-severity-critical-bg text-severity-critical',
  high: 'bg-severity-high-bg text-severity-high',
  medium: 'bg-severity-medium-bg text-severity-medium',
  low: 'bg-severity-low-bg text-severity-low',
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

interface SkeletonProps {
  className?: string
  circle?: boolean
}

export function Skeleton({ className = '', circle }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-tertiary ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
    />
  )
}

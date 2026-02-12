import { Skeleton } from '@/components/ui/skeleton'

export default function ReportLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Heading + Toolbar */}
      <Skeleton className="h-10 w-3/4" />

      {/* Diagram Preview */}
      <Skeleton className="h-48" />

      {/* Report Content Lines */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-8/12" />
      </div>
    </div>
  )
}

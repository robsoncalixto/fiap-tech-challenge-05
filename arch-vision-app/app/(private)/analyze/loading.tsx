import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyzeLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Zone */}
      <Skeleton className="h-48" />

      {/* Context Textarea */}
      <Skeleton className="h-24" />

      {/* Model Select */}
      <Skeleton className="h-10 w-64" />

      {/* Submit Button */}
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

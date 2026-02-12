import { Skeleton } from '@/components/ui/skeleton'

export default function UpgradeLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Title */}
      <Skeleton className="h-8 w-64 mx-auto" />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

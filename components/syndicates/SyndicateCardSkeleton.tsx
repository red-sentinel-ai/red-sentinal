import { Skeleton } from '@/components/ui/skeleton'

export function SyndicateCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="mb-1 h-5 w-full" />
      <Skeleton className="mb-6 h-5 w-3/4" />
      <div className="mt-auto grid grid-cols-2 gap-4">
        <Skeleton className="h-[60px] rounded" />
        <Skeleton className="h-[60px] rounded" />
      </div>
      <div className="mb-6 mt-6 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded" />
    </div>
  )
}

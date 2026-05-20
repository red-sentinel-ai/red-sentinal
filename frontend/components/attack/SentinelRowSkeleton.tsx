import { Skeleton } from '@/components/ui/skeleton'

export function SentinelRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pr-4">
          <div className="w-[230px] shrink-0 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] sm:w-[250px]">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-3 flex justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="mt-3 h-8 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

export function SentinelRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
        >
          <Skeleton className="h-48 w-full rounded-none bg-white/10" />
          <div className="p-6">
            <Skeleton className="h-5 w-3/4 rounded-none bg-white/10" />
            <div className="mt-6 flex justify-between">
              <Skeleton className="h-8 w-24 rounded-none bg-white/10" />
              <Skeleton className="h-8 w-20 rounded-none bg-white/10" />
            </div>
            <Skeleton className="mt-8 h-11 w-full rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

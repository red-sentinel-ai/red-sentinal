import { Skeleton } from '@/components/ui/skeleton'

interface StatBadgeProps {
  label: string
  value: string | null
}

export function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      {value === null ? (
        <Skeleton className="mt-1 h-7 w-20" />
      ) : (
        <span className="font-mono text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
          {value}
        </span>
      )}
    </div>
  )
}

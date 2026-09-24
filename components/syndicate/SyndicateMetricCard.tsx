import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  label: string
  value: string | null
  subtitle: string
  subtitleClass?: string
}

export function SyndicateMetricCard({ label, value, subtitle, subtitleClass }: Props) {
  return (
    <div className="p-6 transition-colors hover:bg-white/[0.02]">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      {value === null ? (
        <Skeleton className="mb-1 h-10 w-40" />
      ) : (
        <p className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
          {value}
        </p>
      )}
      <p className={`mt-1 text-xs uppercase ${subtitleClass ?? 'text-[var(--color-text-muted)]'}`}>
        {subtitle}
      </p>
    </div>
  )
}

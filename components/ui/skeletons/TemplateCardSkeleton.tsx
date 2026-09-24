export function TemplateCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
      <div className="aspect-square w-full animate-pulse bg-[var(--color-border-subtle)]/50" />

      <div className="p-5">
        <div className="mb-2 h-6 w-2/5 animate-pulse rounded bg-[var(--color-border-subtle)]" />

        <div className="mb-4 space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-[var(--color-border-subtle)]" />
          <div className="h-3.5 w-3/5 animate-pulse rounded bg-[var(--color-border-subtle)]" />
        </div>

        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--color-border-subtle)]" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--color-border-subtle)]" />
        </div>
      </div>
    </div>
  )
}

export const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="space-y-2">
      <div className="h-4 w-20 rounded bg-[var(--color-border-subtle)]"></div>
      <div className="h-10 rounded bg-[var(--color-border-subtle)]"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-24 rounded bg-[var(--color-border-subtle)]"></div>
      <div className="h-10 rounded bg-[var(--color-border-subtle)]"></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-[var(--color-border-subtle)]"></div>
        <div className="h-10 rounded bg-[var(--color-border-subtle)]"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-[var(--color-border-subtle)]"></div>
        <div className="h-10 rounded bg-[var(--color-border-subtle)]"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-32 rounded bg-[var(--color-border-subtle)]"></div>
      <div className="h-20 rounded bg-[var(--color-border-subtle)]"></div>
    </div>
    <div className="h-12 rounded-full bg-[var(--color-border-subtle)]"></div>
  </div>
)

import { Skeleton } from '@/components/ui'

export const AgentChallengePageSkeleton = () => {
  return (
    <div
      className="flex h-[calc(100dvh-64px)] flex-col bg-no-repeat md:h-[calc(100vh-64px)] md:flex-row"
      style={{
        backgroundImage: 'url(/img/chat_bg.png)',
        backgroundPosition: '0% 17%',
        backgroundSize: '100% auto',
      }}
    >
      {/* Mobile header skeleton */}
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 md:hidden">
        <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-border-subtle)]" />
        <Skeleton className="h-4 w-32 bg-[var(--color-border-subtle)]" />
      </div>

      <div className="hidden w-[25%] min-w-[200px] max-w-[40%] flex-col gap-4 bg-[var(--color-bg-subtle)]/50 px-6 py-4 md:flex">
        <Skeleton className="h-4 w-28 bg-[var(--color-border-subtle)]" />

        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border-subtle)] p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-5 w-32 bg-[var(--color-border-subtle)]" />
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-[var(--color-border-subtle)] p-3">
          <Skeleton className="h-3 w-20 bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-4 w-full bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-4 w-3/4 bg-[var(--color-border-subtle)]" />
        </div>

        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24 bg-[var(--color-border-subtle)]" />
            <Skeleton className="h-6 w-28 bg-[var(--color-border-subtle)]" />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-3 w-full bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-3 w-full bg-[var(--color-border-subtle)]" />
          <Skeleton className="h-3 w-2/3 bg-[var(--color-border-subtle)]" />
        </div>

        <Skeleton className="mt-auto h-9 w-full rounded-lg bg-[var(--color-border-subtle)]" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
            <Skeleton className="h-20 w-[55%] rounded-2xl bg-[var(--color-border-subtle)]" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-14 w-[45%] rounded-2xl bg-[var(--color-border-subtle)]" />
          </div>
          <div className="flex justify-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
            <Skeleton className="h-24 w-[60%] rounded-2xl bg-[var(--color-border-subtle)]" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-[35%] rounded-2xl bg-[var(--color-border-subtle)]" />
          </div>
        </div>

        <Skeleton className="h-16 w-full rounded-2xl bg-[var(--color-border-subtle)]" />
      </div>
    </div>
  )
}

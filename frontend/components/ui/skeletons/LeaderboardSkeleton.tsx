export const LeaderboardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-x-auto whitespace-nowrap border border-[var(--color-border-default)] text-xs">
      <div className="grid min-h-14 min-w-[760px] animate-pulse grid-cols-12 gap-5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-5">
        <div className="col-span-5 grid grid-cols-12 items-center md:col-span-3">
          <div className="col-span-2 h-3 bg-white/10 pr-1 lg:col-span-1"></div>
          <div className="h-full w-[1px] bg-white/10"></div>
          <div className="col-span-2 h-3 bg-white/10"></div>
        </div>
        <div className="col-span-2 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
        <div className="col-span-3 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
        <div className="col-span-2 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
      </div>

      {new Array(10).fill(1).map((_, index) => (
        <div
          className="grid min-h-16 min-w-[760px] animate-pulse grid-cols-12 gap-1 border-b border-[var(--color-border-subtle)] bg-black p-5 last:border-b-0"
          key={`agent-skeleton-${index}`}
        >
          <div className="col-span-5 grid grid-cols-12 items-center md:col-span-3">
            <div className="col-span-2 h-3 bg-white/10 pr-1 lg:col-span-1"></div>
            <div className="h-full w-[1px] bg-white/10"></div>
            <div className="col-span-2 h-3 bg-white/10"></div>
          </div>
          <div className="col-span-2 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
          <div className="col-span-3 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
          <div className="col-span-2 h-3 w-16 border-l border-l-white/10 bg-white/10 ps-4"></div>
        </div>
      ))}
    </div>
  )
}

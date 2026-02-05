export const LeaderboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 overflow-x-auto whitespace-nowrap text-xs">
      <div className="mb-2 grid min-h-10 min-w-[680px] animate-pulse grid-cols-12 gap-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="col-span-5 grid grid-cols-12 items-center md:col-span-3">
          <div className="col-span-2 h-3 rounded bg-gray-200 pr-1 lg:col-span-1"></div>
          <div className="h-full w-[1px] bg-gray-300"></div>
          <div className="col-span-2 h-3 rounded bg-gray-200"></div>
        </div>
        <div className="col-span-2 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
        <div className="col-span-3 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
        <div className="col-span-2 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
      </div>

      {new Array(10).fill(1).map((_, index) => (
        <div
          className="grid min-h-11 min-w-[680px] animate-pulse grid-cols-12 gap-1 rounded-lg border border-gray-200 bg-white p-4"
          key={`agent-skeleton-${index}`}
        >
          <div className="col-span-5 grid grid-cols-12 items-center md:col-span-3">
            <div className="col-span-2 h-3 rounded bg-gray-200 pr-1 lg:col-span-1"></div>
            <div className="h-full w-[1px] bg-gray-300"></div>
            <div className="col-span-2 h-3 rounded bg-gray-200"></div>
          </div>
          <div className="col-span-2 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
          <div className="col-span-3 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
          <div className="col-span-2 h-3 w-16 rounded border-l border-l-gray-300 bg-gray-200 ps-4"></div>
        </div>
      ))}
    </div>
  )
}

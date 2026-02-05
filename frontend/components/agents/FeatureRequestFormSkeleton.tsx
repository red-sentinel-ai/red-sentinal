export const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="space-y-2">
      <div className="h-4 w-20 rounded bg-gray-200"></div>
      <div className="h-10 rounded bg-gray-200"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      <div className="h-10 rounded bg-gray-200"></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-32 rounded bg-gray-200"></div>
      <div className="h-20 rounded bg-gray-200"></div>
    </div>
    <div className="h-12 rounded-full bg-gray-200"></div>
  </div>
)

export const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-20 bg-gray-200 rounded"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded-full"></div>
  </div>
)

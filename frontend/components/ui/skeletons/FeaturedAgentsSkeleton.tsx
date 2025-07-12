export const FeaturedAgentsSkeleton = () => {
  return (
    <div className="mb-16">
      <div className="mb-8">
        <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-2 animate-pulse"></div>
        <div className="flex max-w-[400px] mx-auto">
          <div className="gradient-border blue"></div>
          <div className="gradient-border blue rotate-180"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {new Array(3).fill(1).map((_, index) => (
          <div
            key={`featured-skeleton-${index}`}
            className="border border-[#558EB4] bg-[#12121266] rounded-lg lg:rounded-2xl p-2 lg:p-4 animate-pulse flex flex-col"
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="h-6 bg-gray-700 rounded w-32"></div>
                <div className="h-5 w-5 bg-gray-700 rounded"></div>
              </div>

              <div className="h-3 bg-gray-700 rounded w-24 mx-auto mb-3"></div>

              <div className="flex max-w-[394px] mx-auto mb-3">
                <div className="gradient-border blue"></div>
                <div className="gradient-border blue rotate-180"></div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>

              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>

              <div className="bg-[#1a1a1a] rounded p-2 max-h-16">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="h-11 bg-[#2E40494D] backdrop-blur-xl border border-[#558EB4] rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

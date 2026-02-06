export const FeaturedAgentsSkeleton = () => {
  return (
    <div className="mb-16">
      <div className="mb-8">
        <div className="mx-auto mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto flex max-w-[400px]">
          <div className="black-gradient-border"></div>
          <div className="black-gradient-border rotate-180"></div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {new Array(3).fill(1).map((_, index) => (
          <div
            key={`featured-skeleton-${index}`}
            className="flex animate-pulse flex-col rounded-lg border border-gray-200 bg-white p-2 lg:rounded-2xl lg:p-4"
          >
            <div className="relative mb-4">
              <div className="flex h-36 w-full items-center justify-center rounded-lg bg-gray-100"></div>
            </div>

            <div className="mb-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-1">
                <div className="h-6 w-32 rounded bg-gray-200"></div>
                <div className="h-5 w-5 rounded bg-gray-200"></div>
              </div>

              <div className="mx-auto mb-3 h-3 w-24 rounded bg-gray-200"></div>

              <div className="mx-auto mb-3 flex max-w-[394px] border-t border-gray-200"></div>
            </div>

            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>

              <div className="max-h-16 rounded bg-gray-50 p-2">
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200"></div>
                  <div className="h-3 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="h-11 rounded-lg border border-gray-200 bg-gray-100"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

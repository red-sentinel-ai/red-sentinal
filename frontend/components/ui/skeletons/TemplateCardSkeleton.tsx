export function TemplateCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-6 w-2/5 animate-pulse rounded bg-gray-200" />
        <div className="ml-2 h-5 w-12 animate-pulse rounded-full bg-gray-200" />
      </div>

      <div className="mb-4 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-3.5 w-3/5 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-200" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}

export const AlreadyRequestedState = () => (
  <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-6">
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-white">Request Already Submitted!</h3>
      <p className="text-sm text-gray-400 max-w-sm">
        You have already requested to feature this agent. Our team will review your submission and
        get back to you soon.
      </p>
    </div>

    {/* <div className="pt-4">
      <Link
        href={`${SUI_SENTINEL_DOCS_URL}/agents/feature-request-status`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[#558EB4] hover:text-[#1388D5] transition-colors flex items-center gap-1 underline"
      >
        <BookOpen className="size-3" />
        Learn more about the review process
      </Link>
    </div> */}
  </div>
)

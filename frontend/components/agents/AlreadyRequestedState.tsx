export const AlreadyRequestedState = ({ onClose }: { onClose: () => void }) => (
  <div className="flex min-h-[300px] flex-col items-center justify-between space-y-12 py-8 text-center text-black">
    <h3 className="text-2xl font-bold text-black">Request Already Submitted!</h3>
    <p className="max-w-sm text-sm leading-relaxed text-gray-600">
      You have already requested to feature this agent. Our team will review your submission and get
      back to you soon.
    </p>

    <button onClick={onClose} className="btn btn-black mt-auto w-full">
      Close
    </button>
  </div>
)

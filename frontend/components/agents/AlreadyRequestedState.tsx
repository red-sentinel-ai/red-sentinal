export const AlreadyRequestedState = ({ onClose }: { onClose: () => void }) => (
  <div className="min-h-[300px] flex flex-col items-center justify-between text-center space-y-12 py-8 text-black">
    <h3 className="text-2xl font-bold text-black">Request Already Submitted!</h3>
    <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
      You have already requested to feature this agent. Our team will review your submission and get
      back to you soon.
    </p>

    <button
      onClick={onClose}
      className="w-full btn btn-black mt-auto"
    >
      Close
    </button>
  </div>
)

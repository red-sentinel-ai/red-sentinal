export const AlreadyRequestedState = ({ onClose }: { onClose: () => void }) => (
  <div className="min-h-[300px] flex flex-col items-center justify-between text-center space-y-12 py-8">
    <h3 className="text-2xl font-bold bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent">
      Request Already Submitted!
    </h3>
    <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
      You have already requested to feature this agent. Our team will review your submission and get
      back to you soon.
    </p>

    <button
      onClick={onClose}
      className="w-full bg-gradient-to-r mt-auto from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] text-white rounded-full py-3 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue"
    >
      Close
    </button>
  </div>
)

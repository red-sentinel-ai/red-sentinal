'use client'

interface FeatureRequestSuccessStateProps {
  onClose: () => void
}

export const FeatureRequestSuccessState = ({ onClose }: FeatureRequestSuccessStateProps) => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-between text-center space-y-12 py-8">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent">
        Request Submitted Successfully!
      </h3>
      <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
        Thank you for your submission! Our team will review your feature request within 3-5 business
        days.
      </p>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r mt-auto from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] text-white rounded-full py-3 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue"
      >
        Close
      </button>
    </div>
  )
}

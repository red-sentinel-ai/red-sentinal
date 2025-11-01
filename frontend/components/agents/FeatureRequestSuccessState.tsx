'use client'

interface FeatureRequestSuccessStateProps {
  onClose: () => void
}

export const FeatureRequestSuccessState = ({ onClose }: FeatureRequestSuccessStateProps) => {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-between text-center space-y-12 py-8 text-black">
      <h3 className="text-2xl font-bold text-black">Request Submitted Successfully!</h3>
      <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
        Thank you for your submission! Our team will review your feature request within 3-5 business
        days.
      </p>

      <button
        onClick={onClose}
        className="w-full btn btn-black mt-auto"
      >
        Close
      </button>
    </div>
  )
}

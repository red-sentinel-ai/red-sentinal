'use client'

interface FeatureRequestSuccessStateProps {
  onClose: () => void
}

export const FeatureRequestSuccessState = ({ onClose }: FeatureRequestSuccessStateProps) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-between space-y-12 py-8 text-center text-black">
      <h3 className="text-2xl font-bold text-black">Request Submitted Successfully!</h3>
      <p className="max-w-sm text-sm leading-relaxed text-gray-600">
        Thank you for your submission! Our team will review your feature request within 3-5 business
        days.
      </p>

      <button onClick={onClose} className="btn btn-black mt-auto w-full">
        Close
      </button>
    </div>
  )
}

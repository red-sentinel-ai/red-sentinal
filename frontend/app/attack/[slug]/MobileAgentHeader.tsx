'use client'

import { Info, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={() => router.push('/attack')}
          className="flex-shrink-0 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold text-black">{agentName}</h1>
      </div>
      <button
        onClick={onInfoClick}
        className="flex-shrink-0 rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        aria-label="Show agent information"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  )
}

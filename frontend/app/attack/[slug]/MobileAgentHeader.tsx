'use client'

import { Info } from 'lucide-react'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
      <h1 className="truncate text-lg font-bold text-black">Target: {agentName}</h1>
      <button
        onClick={onInfoClick}
        className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        aria-label="Show agent information"
      >
        <Info className="h-5 w-5" />
      </button>
    </div>
  )
}

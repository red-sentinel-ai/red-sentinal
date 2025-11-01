'use client'

import { Info } from 'lucide-react'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
      <h1 className="text-lg font-bold text-black truncate">Target: {agentName}</h1>
      <button
        onClick={onInfoClick}
        className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Show agent information"
      >
        <Info className="w-5 h-5" />
      </button>
    </div>
  )
}

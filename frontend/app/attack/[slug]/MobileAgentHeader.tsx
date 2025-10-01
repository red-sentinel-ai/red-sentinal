'use client'

import { Info } from 'lucide-react'

interface MobileAgentHeaderProps {
  agentName: string
  onInfoClick: () => void
}

export const MobileAgentHeader = ({ agentName, onInfoClick }: MobileAgentHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-[#101112] flex-shrink-0">
      <h1 className="text-lg font-bold text-white truncate">Target: {agentName}</h1>
      <button
        onClick={onInfoClick}
        className="p-2 text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        aria-label="Show agent information"
      >
        <Info className="w-5 h-5" />
      </button>
    </div>
  )
}

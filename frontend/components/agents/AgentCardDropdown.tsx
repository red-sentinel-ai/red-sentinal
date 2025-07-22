'use client'

import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

interface AgentDropdownProps {
  isOwner: boolean
  agentId: string | number
  openFeatureModal: (agentId: number) => void
}

export const AgentDropdown = ({ isOwner, agentId, openFeatureModal }: AgentDropdownProps) => {
  if (!isOwner) return null

  return (
    <div className="absolute top-2 right-2 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-[#12121266] backdrop-blur-sm border border-[#383838] hover:border-[#558EB4] p-2 rounded-xl transition-all duration-300 hover:shadow-glow-blue group">
            <MoreVertical className="text-gray-400 group-hover:text-[#558EB4] w-5 h-5 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#12121266] backdrop-blur-xl border border-[#383838] rounded-2xl p-2 text-white min-w-[200px]">
          <DropdownMenuItem
            onClick={() => openFeatureModal(+agentId)}
            className="cursor-pointer flex items-center gap-3 text-gray-300 hover:text-[#558EB4] focus:text-[#558EB4] hover:bg-[#1a1b1f] focus:bg-[#1a1b1f] rounded-xl px-4 py-3 transition-colors"
          >
            <Image
              src="/icons/check-mark.svg"
              width={24}
              height={24}
              alt="checkmark"
            />
            <span className="font-medium">Request to Feature</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

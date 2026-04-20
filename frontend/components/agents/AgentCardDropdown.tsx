'use client'

import { useState } from 'react'
import { MoreVertical, Star, Edit, DollarSign } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { UpdatePromptModal } from './UpdatePromptModal'
import { UpdateCostModal } from './UpdateCostModal'
import { getTokenForCoinType } from '@/constants'
import type { SupportedChain } from '@/constants/chains'

const PROMPT_UPDATE_WINDOW_MS = 10_800_000

interface AgentDropdownProps {
  isOwner: boolean
  isFeatured: boolean
  agentId: string
  agentObjectId: string
  openFeatureModal: (agentId: string) => void
  currentPrompt?: string
  currentCost?: number
  accumulatedFees?: number
  createdAt?: string
  coinType?: string
  chain?: SupportedChain
}

export const AgentDropdown = ({
  isOwner,
  isFeatured,
  agentId,
  agentObjectId,
  openFeatureModal,
  currentPrompt,
  currentCost,
  createdAt,
  coinType,
  chain = 'sui',
}: AgentDropdownProps) => {
  const isSolana = chain === 'solana'
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [isCostModalOpen, setIsCostModalOpen] = useState(false)

  const isUpdateWindowExpired = createdAt
    ? Date.now() - Number(createdAt) > PROMPT_UPDATE_WINDOW_MS
    : false

  const handleOpenFeatureModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    openFeatureModal(agentId)
  }

  const handleOpenPromptModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPromptModalOpen(true)
  }

  const handleOpenCostModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCostModalOpen(true)
  }

  const hasItems = !isFeatured || isOwner

  return (
    <>
      {hasItems && (
        <div className="absolute right-2 top-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm outline-none backdrop-blur-sm transition-colors hover:bg-white">
              <MoreVertical className="h-5 w-5 text-gray-700" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!isFeatured && (
                <DropdownMenuItem onClick={handleOpenFeatureModal} className="cursor-pointer gap-2">
                  <Star className="h-4 w-4" />
                  Request to Feature
                </DropdownMenuItem>
              )}

              {isOwner && (
                <>
                  {!isFeatured && <DropdownMenuSeparator />}

                  <DropdownMenuItem
                    onClick={handleOpenPromptModal}
                    className="cursor-pointer gap-2"
                    disabled={isUpdateWindowExpired || isSolana}
                    title={
                      isSolana
                        ? 'Not available for Solana sentinels yet'
                        : isUpdateWindowExpired
                          ? 'Updates are only allowed within 3 hours of launch'
                          : undefined
                    }
                  >
                    <Edit className="h-4 w-4" />
                    Update Instructions
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleOpenCostModal}
                    className="cursor-pointer gap-2"
                    disabled={isUpdateWindowExpired || isSolana}
                    title={
                      isSolana
                        ? 'Not available for Solana sentinels yet'
                        : isUpdateWindowExpired
                          ? 'Updates are only allowed within 3 hours of launch'
                          : undefined
                    }
                  >
                    <DollarSign className="h-4 w-4" />
                    Update Attack Fee
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isOwner && (
        <>
          <UpdatePromptModal
            open={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            agentId={agentId}
            agentObjectId={agentObjectId}
            currentPrompt={currentPrompt}
            coinType={coinType}
          />
          <UpdateCostModal
            open={isCostModalOpen}
            onClose={() => setIsCostModalOpen(false)}
            agentId={agentId}
            agentObjectId={agentObjectId}
            currentCost={currentCost ? currentCost / Math.pow(10, getTokenForCoinType(coinType).decimals) : 0}
            coinType={coinType}
          />
        </>
      )}
    </>
  )
}

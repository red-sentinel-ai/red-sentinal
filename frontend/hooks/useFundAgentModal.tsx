'use client'
import { FundAgentModal, FundAgentModalProps } from '@/components/FundAgentModal'
import React, { useState } from 'react'

interface UseFundAgentModalReturn {
  openModal: (agentObjectId: string, agentId: string, coinType?: string, tokenSymbol?: string, tokenDecimals?: number) => void
  Modal: React.FC<Omit<FundAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'coinType' | 'tokenSymbol' | 'tokenDecimals'>>
}

/**
 * Hook to manage the FundAgentModal state
 * @returns {object} An object containing:
 * - openModal: Function to open the modal for a specific agent (requires objectId and agentId)
 * - Modal: The modal component ready to be rendered
 */
export function useFundAgentModal(): UseFundAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentObjectId, setCurrentObjectId] = useState('')
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null)
  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(undefined)
  const [currentTokenSymbol, setCurrentTokenSymbol] = useState<string | undefined>(undefined)
  const [currentTokenDecimals, setCurrentTokenDecimals] = useState<number | undefined>(undefined)

  const openModal = (agentObjectId: string, agentId: string, coinType?: string, tokenSymbol?: string, tokenDecimals?: number) => {
    setCurrentObjectId(agentObjectId)
    setCurrentAgentId(agentId)
    setCurrentCoinType(coinType)
    setCurrentTokenSymbol(tokenSymbol)
    setCurrentTokenDecimals(tokenDecimals)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentObjectId('')
    setCurrentAgentId(null)
  }

  const Modal: React.FC<
    Omit<FundAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'coinType' | 'tokenSymbol' | 'tokenDecimals'>
  > = props => (
    <FundAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentObjectId}
      agentId={currentAgentId}
      coinType={currentCoinType}
      tokenSymbol={currentTokenSymbol}
      tokenDecimals={currentTokenDecimals}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

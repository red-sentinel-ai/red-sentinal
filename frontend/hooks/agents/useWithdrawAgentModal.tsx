'use client'
import { WithdrawAgentModal, WithdrawAgentModalProps } from '@/components/WithdrawAgentModal'
import React, { useState } from 'react'

interface UseWithdrawAgentModalReturn {
  openModal: (agentObjectId: string, agentId: string, agentBalanceRaw: number, coinType?: string) => void
  Modal: React.FC<
    Omit<
      WithdrawAgentModalProps,
      'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceRaw' | 'coinType'
    >
  >
}

export function useWithdrawAgentModal(): UseWithdrawAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAgentObjectId, setCurrentAgentObjectId] = useState('')
  const [currentAgentId, setCurrentAgentId] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(undefined)

  const openModal = (agentObjectId: string, agentId: string, agentBalanceRaw: number, coinType?: string) => {
    setCurrentAgentObjectId(agentObjectId)
    setCurrentAgentId(agentId)
    setCurrentBalance(agentBalanceRaw)
    setCurrentCoinType(coinType)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentAgentObjectId('')
    setCurrentAgentId('')
    setCurrentBalance(0)
    setCurrentCoinType(undefined)
  }

  const Modal: React.FC<
    Omit<
      WithdrawAgentModalProps,
      'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceRaw' | 'coinType'
    >
  > = props => (
    <WithdrawAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentAgentObjectId}
      agentId={currentAgentId}
      agentBalanceRaw={currentBalance}
      coinType={currentCoinType}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

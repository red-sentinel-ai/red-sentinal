'use client'
import { WithdrawAgentModal, WithdrawAgentModalProps } from '@/components/WithdrawAgentModal'
import React, { useState } from 'react'
import type { SupportedChain } from '@/constants/chains'

interface OpenWithdrawAgentModalArgs {
  agentObjectId: string
  agentId: string
  agentBalanceRaw: number
  coinType?: string
  chain?: SupportedChain
}

interface UseWithdrawAgentModalReturn {
  openModal: (args: OpenWithdrawAgentModalArgs) => void
  Modal: React.FC<
    Omit<
      WithdrawAgentModalProps,
      'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceRaw' | 'coinType' | 'chain'
    >
  >
}

export function useWithdrawAgentModal(): UseWithdrawAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAgentObjectId, setCurrentAgentObjectId] = useState('')
  const [currentAgentId, setCurrentAgentId] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [currentCoinType, setCurrentCoinType] = useState<string | undefined>(undefined)
  const [currentChain, setCurrentChain] = useState<SupportedChain>('sui')

  const openModal = ({
    agentObjectId,
    agentId,
    agentBalanceRaw,
    coinType,
    chain = 'sui',
  }: OpenWithdrawAgentModalArgs) => {
    setCurrentAgentObjectId(agentObjectId)
    setCurrentAgentId(agentId)
    setCurrentBalance(agentBalanceRaw)
    setCurrentCoinType(coinType)
    setCurrentChain(chain)
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
      'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceRaw' | 'coinType' | 'chain'
    >
  > = props => (
    <WithdrawAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentAgentObjectId}
      agentId={currentAgentId}
      agentBalanceRaw={currentBalance}
      coinType={currentCoinType}
      chain={currentChain}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

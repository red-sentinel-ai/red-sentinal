'use client'
import { WithdrawAgentModal, WithdrawAgentModalProps } from '@/components/WithdrawAgentModal'
import React, { useState } from 'react'

interface UseWithdrawAgentModalReturn {
  openModal: (agentObjectId: string, agentId: string, agentBalanceInMist: number) => void
  Modal: React.FC<
    Omit<WithdrawAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceInMist'>
  >
}

export function useWithdrawAgentModal(): UseWithdrawAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAgentObjectId, setCurrentAgentObjectId] = useState('')
  const [currentAgentId, setCurrentAgentId] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)

  const openModal = (agentObjectId: string, agentId: string, agentBalanceInMist: number) => {
    setCurrentAgentObjectId(agentObjectId)
    setCurrentAgentId(agentId)
    setCurrentBalance(agentBalanceInMist)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentAgentObjectId('')
    setCurrentAgentId('')
    setCurrentBalance(0)
  }

  const Modal: React.FC<
    Omit<WithdrawAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentId' | 'agentBalanceInMist'>
  > = props => (
    <WithdrawAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentAgentObjectId}
      agentId={currentAgentId}
      agentBalanceInMist={currentBalance}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

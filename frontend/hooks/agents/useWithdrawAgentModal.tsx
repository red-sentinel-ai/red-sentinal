'use client'
import { WithdrawAgentModal, WithdrawAgentModalProps } from '@/components/WithdrawAgentModal'
import React, { useState } from 'react'

interface UseWithdrawAgentModalReturn {
  openModal: (agentObjectId: string, agentBalanceInMist: number) => void
  Modal: React.FC<
    Omit<WithdrawAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentBalanceInMist'>
  >
}

export function useWithdrawAgentModal(): UseWithdrawAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAgentId, setCurrentAgentId] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)

  const openModal = (agentObjectId: string, agentBalanceInMist: number) => {
    setCurrentAgentId(agentObjectId)
    setCurrentBalance(agentBalanceInMist)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentAgentId('')
    setCurrentBalance(0)
  }

  const Modal: React.FC<
    Omit<WithdrawAgentModalProps, 'open' | 'onClose' | 'agentObjectId' | 'agentBalanceInMist'>
  > = (props) => (
    <WithdrawAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentAgentId}
      agentBalanceInMist={currentBalance}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

'use client'
import { useState } from 'react'
import { FeatureAgentModal, FeatureAgentModalProps } from '@/components/agents/FeatureAgentModal'

export function useFeatureAgentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [agentId, setAgentId] = useState<number | null>(null)

  const openModal = (agentId: number) => {
    setAgentId(agentId)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setAgentId(null)
  }

  const Modal: React.FC<Omit<FeatureAgentModalProps, 'open' | 'onClose' | 'agentId'>> = (props) => (
    <FeatureAgentModal
      open={isOpen}
      onClose={closeModal}
      agentId={agentId!}
      {...props}
    />
  )

  return {
    openModal,
    Modal,
  }
}

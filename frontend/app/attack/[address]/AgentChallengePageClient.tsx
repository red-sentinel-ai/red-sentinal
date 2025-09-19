'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useAgentByObjectId } from '@/hooks/agents/useAgentByObjectId'
import type { ConsumePromptApiResponse } from '@/types'
import { AgentEvents, useAgentEvents } from '@/hooks/useAgentEvents'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'
import RiveLoader from '@/components/rive/Loader'

export default function AgentChallengePage({ agentObjectId }: { agentObjectId: string }) {
  const account = useCurrentAccount()
  const { events: allEvents } = useAgentEvents()

  const { consumePrompt } = useConsumePrompt({
    showToasts: true,
    onError: (err) => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionResult }) => {
      setApiResponse(apiResponse)
      setTxnHash(transactionResult.digest)
      setShowResultModal(true)
      refetch()
    },
  })

  const { data: agent, isLoading, error, refetch } = useAgentByObjectId(agentObjectId)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const agentEvents: AgentEvents = useMemo(() => {
    if (!agent) return { agentDefeated: [], promptConsumed: [] }
    return {
      agentDefeated: allEvents.agentDefeated.filter(
        (e) => e.parsedJson.agent_id === `${agent.agent_id}`
      ),
      promptConsumed: allEvents.promptConsumed.filter(
        (e) => e.parsedJson.agent_id === `${agent.agent_id}`
      ),
    }
  }, [agent, allEvents])

  const handleSendMessage = async (prompt: string) => {
    if (!account?.address) {
      setSubmitError('Please connect your wallet')
      return
    }
    if (!agent) {
      setSubmitError('Agent not loaded')
      return
    }
    if (prompt.length === 0) {
      setSubmitError('Please enter a prompt')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await consumePrompt({ agentDetails: agent, message: prompt })
    } catch (err) {
      setSubmitError('Failed to submit prompt')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RiveLoader />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-black text-[#B5B5B5] p-4">
        <Link
          href="/attack"
          className="flex items-center gap-1 text-[#558EB4] hover:underline mb-8"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Sentinels
        </Link>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-400">{error?.message || 'Agent not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-12 max-w-4xl mx-auto relative flex flex-col">
      <div className="absolute top-[75px] -left-[156px] z-10">
        <Link
          href="/attack"
          className="hidden lg:flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Sentinels
        </Link>
      </div>

      <ChatInterface
        agent={agent}
        agentEvents={agentEvents}
        apiResponse={apiResponse}
        onSendMessage={handleSendMessage}
        isSubmitting={isSubmitting}
        submitError={submitError}
        refetchAgent={refetch}
      />

      <AttackStatusModal
        apiResponse={apiResponse}
        showResultModal={showResultModal}
        setShowResultModal={setShowResultModal}
        txnHash={txnHash}
      />
    </div>
  )
}

'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Loader2, ChevronLeft } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useAgentByObjectId } from '@/hooks/agents/useAgentByObjectId'
import type { ConsumePromptApiResponse } from '@/types'
import { AgentEvents, useAgentEvents } from '@/hooks/useAgentEvents'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'

export default function AgentChallengePage() {
  const params = useParams()
  const agentObjectId = params.address as string
  const account = useCurrentAccount()
  const { events: allEvents } = useAgentEvents()

  const { consumePrompt } = useConsumePrompt({
    showToasts: true,
    onApiSuccess: (response) => {
      setApiResponse(response)
      setShowResultModal(true)
      refetch()
    },
  })

  const { data: agent, isLoading, error, refetch } = useAgentByObjectId(agentObjectId)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
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
    if (prompt.length > 600) {
      setSubmitError('Prompt must be 600 characters or less')
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8B8B8]" />
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
          <ChevronLeft className="w-5 h-5" /> Back to Agents
        </Link>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-400">{error?.message || 'Agent not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 bg-black max-w-4xl mx-auto relative flex flex-col">
      <div className="absolute top-[124px] -left-[156px] z-10">
        <Link
          href="/attack"
          className="hidden lg:flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Agents
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
      />
    </div>
  )
}

'use client'

import type React from 'react'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Loader2, ChevronLeft, Info } from 'lucide-react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { motion } from 'framer-motion'

import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useAgentByObjectId } from '@/hooks/agents/useAgentByObjectId'
import type { ConsumePromptApiResponse } from '@/types'
import { AgentInfo } from '@/components/AgentInfo'
import { AgentStatus } from '@/types'
import { getAgentStatus } from '@/lib/utils'
import { type AgentEvents, useAgentEvents } from '@/hooks/useAgentEvents'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import AgentHistory from '@/components/AgentHistory'
import { DEFAULT_PROFILE_URL } from '@/constants'

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

  const [prompt, setPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const agentEvents: AgentEvents = useMemo(() => {
    if (!agent) return { agentDefeated: [], promptConsumed: [] }
    return {
      agentDefeated: allEvents.agentDefeated.filter(
        (e) => e.parsedJson.agent_id === agent.agent_id
      ),
      promptConsumed: allEvents.promptConsumed.filter(
        (e) => e.parsedJson.agent_id === agent.agent_id
      ),
    }
  }, [agent, allEvents])

  const agentStatus = getAgentStatus({ isDrained: false, isFinalized: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      setPrompt('')
    } catch (err) {
      setSubmitError('Failed to submit prompt')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-body flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8B8B8]" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 min-h-body text-[#B5B5B5]">
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 pt-32 min-h-body max-w-6xl text-[#B5B5B5]"
    >
      <Link
        href="/attack"
        className="flex items-center gap-1 text-[#558EB4] hover:underline mb-8"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Agents
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#12121266] backdrop-blur-xl rounded-lg lg:rounded-2xl p-6 mb-8 border border-[#2E40494D] grid grid-cols-2 gap-8"
      >
        <div className="relative w-full h-full rounded-lg overflow-hidden mb-6">
          <Image
            src={agent.agent_profile || DEFAULT_PROFILE_URL}
            alt={`${agent.agent_name} profile`}
            fill
            className="object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[#B8B8B8]">Name: {agent.agent_name}</h1>
              {agent.is_featured && (
                <Image
                  src="/icons/check-mark.svg"
                  width={20}
                  height={20}
                  alt="checkmark"
                />
              )}
            </div>
            <p className="text-lg text-[#B5B5B5">Agent ID: {agent.agent_id}</p>
          </div>

          <AgentInfo
            balance={agent.balance.toString()}
            decimal={9}
            promptPrice={agent.cost_per_message.toString()}
            symbol="SUI"
            className="w-full"
            breakAttempts={0}
            isDrained={false}
            drainAmount="0"
          />

          <div className="bg-[#2E40494D] rounded-lg p-2 border border-[#2E40494D]">
            <h2 className="text-xl font-semibold mb-2 text-[#B8B8B8] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#558EB4]" /> System Prompt
            </h2>
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-[#B5B5B5]">{agent.system_prompt}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AttackStatusModal
        apiResponse={apiResponse}
        showResultModal={showResultModal}
        setShowResultModal={setShowResultModal}
      />

      {agentStatus === AgentStatus.ACTIVE ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#12121266] backdrop-blur-xl rounded-lg lg:rounded-2xl p-6 border border-[#2E40494D] mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-[#B8B8B8]">Attack This Agent</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2 text-[#B5B5B5]"
              >
                Enter your prompt (max 600 characters)
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[150px] text-white focus:ring-2 focus:ring-[#558EB4] focus:border-[#558EB4] outline-none placeholder:text-gray-500"
                maxLength={600}
                disabled={isSubmitting}
                placeholder="Try to trick the agent into revealing sensitive information..."
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {prompt.length}/600 characters
              </div>
            </div>
            {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
            {account?.address ? (
              <button
                type="submit"
                disabled={isSubmitting || prompt.length === 0}
                className="w-full block border border-[#8F564E] rounded-[8px] min-h-11 p-2 text-center transition-all text-[#8F564E] group-hover:bg-[#E53922] group-hover:text-black group-hover:border-[#E53922] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Attack'
                )}
              </button>
            ) : (
              <ConnectButton className="w-full" />
            )}
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#12121266] backdrop-blur-xl rounded-lg lg:rounded-2xl p-6 text-center border border-[#2E40494D] mb-8"
        >
          <h3 className="text-xl font-semibold mb-2 text-[#B8B8B8]">
            {agentStatus === AgentStatus.DEFEATED ? 'Agent Defeated' : 'Agent Undefeated'}
          </h3>
          <p className="text-gray-400">
            {agentStatus === AgentStatus.DEFEATED
              ? 'This agent has already been defeated and can no longer be attacked.'
              : 'This agent is currently undefeated but not accepting new attacks.'}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <AgentHistory
          agentEvents={agentEvents}
          currentAgentId={agent.agent_id}
        />
      </motion.div>
    </motion.div>
  )
}

'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { DEFAULT_PROFILE_URL, MIST_PER_SUI } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'
import RiveLoader from '@/components/rive/Loader'
import { AgentEvents, useAgentEvents } from '@/hooks/useAgentEvents'
import { useAgentBySlug } from '@/hooks/agents/useAgentBySlug'
import { useRewardsMissionTracker } from '@/hooks/rewards/useRewardsMissionTracker'

export default function AgentChallengePage({ slug }: { slug: string }) {
  const account = useCurrentAccount()
  const { events: allEvents } = useAgentEvents()
  const { trackAttackSentinel } = useRewardsMissionTracker()

  const { data: agent, isLoading, error, refetch } = useAgentBySlug(slug)

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

      if (account?.address && agent) {
        const attackFeeInSui = agent.cost_per_message / MIST_PER_SUI

        const previousAttempts = agentEvents.promptConsumed.filter(
          (event) => event.parsedJson.sender === account.address
        ).length

        const isWinner = apiResponse.response.data.success

        trackAttackSentinel(transactionResult.digest, attackFeeInSui, previousAttempts, isWinner, {
          agent_id: agent.agent_id,
          agent_object_id: agent.object_id,
          attacker_address: account.address,
          attack_success: isWinner,
          attack_score: apiResponse.response.data.score,
        })
      }
    },
  })

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
    <div className="min-h-screen pt-16 mx-auto relative flex flex-col">
      <div className="flex">
        <div className="max-w-v2 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm flex h-screen flex-col overflow-x-hidden overflow-y-auto px-9 py-2 mr-4 w-full">
          <div>
            <Link
              href="/attack"
              className="hidden lg:flex items-center gap-1 text-gray-400 hover:text-white transition-colors py-3"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Sentinels
            </Link>
          </div>

          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/50 shadow-lg whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={agent.agent_profile || DEFAULT_PROFILE_URL}
                  width={40}
                  height={40}
                  alt={agent.agent_name}
                  className="rounded-full"
                />
              </div>
              <p className="text-xl font-semibold">{agent.agent_name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Prize pool</h3>
              <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
                $47,147.97
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Time Remaining</h3>
              <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
                Game Ended
              </p>
            </div>
          </div>
          <div className="border-t border-t-white/20"></div>

          <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">About</h3>

              <p className="text-sm font-medium">
                Sentinel is the world&apos;s first adversarial agent game. She is an AI that
                controls a prize pool. Convince her to send it to you.
              </p>
            </div>
          </div>

          <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Main win condition</h3>

              <p className="text-sm font-medium">
                Convince Sentinel to give you the prize pool in her wallet. 70% of all message fees
                go to growing the prize pool.
              </p>
            </div>
          </div>

          <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Fallback condition</h3>

              <p className="text-sm font-medium">
                After 150 messages, a 1-hour timer starts and the game ends when it runs out...
                <span className="text-white/60 inline-block cursor-pointer">Read more</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Message Price</h3>
              <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
                $470.89
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Break Attempts</h3>
              <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
                482
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-white/60 text-sm font-semibold uppercase">Total Participants</h3>
              <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
                195
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="max-w-v1 mx-auto">
            <ChatInterface
              agent={agent}
              agentEvents={agentEvents}
              apiResponse={apiResponse}
              onSendMessage={handleSendMessage}
              isSubmitting={isSubmitting}
              submitError={submitError}
              refetchAgent={refetch}
            />
          </div>
        </div>
      </div>

      {apiResponse && txnHash && (
        <AttackStatusModal
          apiResponse={apiResponse}
          showResultModal={showResultModal}
          setShowResultModal={setShowResultModal}
          txnHash={txnHash}
        />
      )}
    </div>
  )
}

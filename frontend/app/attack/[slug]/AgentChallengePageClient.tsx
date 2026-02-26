'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'

import { AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, MIST_PER_SUI } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui'
import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useAgentBySlug } from '@/hooks/agents/useAgentBySlug'
import {
  useAgentEventsFromIndexer,
  AGENT_EVENTS_FROM_INDEXER_QUERY_KEY,
  type AgentEventsFromIndexer,
} from '@/hooks/useAgentEventsFromIndexer'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'
import { AgentSidebar } from '@/components/agents/AgentSidebar'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MobileAgentHeader } from './MobileAgentHeader'
import { Loader2, X } from 'lucide-react'

// Transform indexer events to match the legacy AgentEvents format expected by child components
// Events are sorted by timestamp in ascending order (oldest first) so most recent appears last in chat
function transformEventsForCompatibility(events: AgentEventsFromIndexer): {
  agentDefeated: Array<{ parsedJson: { agent_id: string; winner: string; amount_won: string } }>
  promptConsumed: Array<{
    id: { txDigest: string }
    timestampMs: string
    parsedJson: {
      agent_id: string
      sender: string
      message: string
      agent_response: string
      success: boolean
      score: number
      amount: string
      jury_response?: string
    }
  }>
} {
  // Sort prompt consumed events by timestamp ascending (oldest first) so recent messages appear last
  const sortedPromptConsumed = [...events.promptConsumed].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return timeA - timeB
  })

  return {
    agentDefeated: events.agentDefeated.map(event => ({
      parsedJson: {
        agent_id: event.agent_id,
        winner: event.winner,
        amount_won: event.amount_won,
      },
    })),
    promptConsumed: sortedPromptConsumed.map(event => ({
      id: {
        txDigest: event.tx_digest || '',
      },
      timestampMs: event.timestamp || Date.now().toString(),
      parsedJson: {
        agent_id: event.agent_id,
        sender: event.sender,
        message: event.message,
        agent_response: event.agent_response,
        success: event.success,
        score: event.score,
        amount: event.amount,
        jury_response: event.jury_response,
      },
    })),
  }
}

export default function AgentChallengePage({ slug }: { slug: string }) {
  const account = useCurrentAccount()
  const queryClient = useQueryClient()
  const { data: agent, isLoading, error, refetch } = useAgentBySlug(slug)
  const { events: indexerEvents, refetch: refetchEvents } = useAgentEventsFromIndexer(
    agent?.agent_id
  )

  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false)

  const { consumePrompt } = useConsumePrompt({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionResult }) => {
      setApiResponse(apiResponse)
      setTxnHash(transactionResult.digest)
      setShowResultModal(true)
      refetch()

      setTimeout(() => {
        refetchEvents()

        if (agent) {
          queryClient.invalidateQueries({
            queryKey: [AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, agent.agent_id],
          })
        }
      }, 1000)

      if (account?.address && agent) {
        const isWinner = apiResponse.response.data.success

        posthog.capture('sentinel_attacked', {
          agent_id: agent?.agent_id,
          agent_name: agent?.agent_name,
          attacker_address: account?.address,
          is_successful: isWinner,
          attack_score: apiResponse.response.data.score,
          tx_digest: transactionResult.digest,
          cost_to_attack: agent ? Number(agent.cost_per_message) / MIST_PER_SUI : 0,
        })

        if (isWinner) {
          posthog.capture('sentinel_defeated', {
            agent_id: agent?.agent_id,
            prize_pool_won: agent ? Number(agent.total_balance) / MIST_PER_SUI : 0,
            winner_address: account?.address,
          })
        }
      }
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const agentEvents = useMemo(() => {
    if (!agent) return { agentDefeated: [], promptConsumed: [] }
    return transformEventsForCompatibility(indexerEvents)
  }, [agent, indexerEvents])

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

  const ReadMoreModal = () => (
    <div className="absolute inset-0 flex flex-col overflow-hidden duration-200 animate-in fade-in">
      <div className="flex shrink-0 items-center justify-between py-6 md:py-8">
        <h2 className="text-2xl font-medium">Instructions</h2>
        <button onClick={() => setIsReadMoreOpen(false)} className="p-2">
          <X size={24} />
        </button>
      </div>

      <div className="overflow-y-auto whitespace-pre-wrap px-1">
        {agent.prompt || 'No instructions available.'}
      </div>

      <div className="shrink-0 pb-12 pt-8">
        <button onClick={() => setIsReadMoreOpen(false)} className="btn btn-black">
          CLOSE
        </button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div
        className="flex h-[calc(100vh-128px)] items-end justify-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/chat_bg.png)',
          backgroundPosition: '0% 17%',
          backgroundSize: '100% auto',
        }}
      >
        <Loader2 className="mr-2 h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div
        className="h-[calc(100vh-128px)] bg-no-repeat p-4 pt-20 text-gray-800"
        style={{
          backgroundImage: 'url(/img/chat_bg.png)',
          backgroundPosition: '0% 17%',
          backgroundSize: '100% auto',
        }}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-lg text-gray-600">{error?.message || 'Agent not found'}</p>
        </div>
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div
        className="flex h-[calc(100vh-128px)] items-end bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/chat_bg.png)',
          backgroundPosition: '0% 17%',
          backgroundSize: '100% auto',
        }}
      >
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-gray-50/50">
            <AgentSidebar
              agent={agent}
              agentEvents={agentEvents}
              onReadMore={() => setIsReadMoreOpen(true)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={75}>
            <div className="max-w-v1 relative mx-auto h-full w-full">
              {isReadMoreOpen ? (
                <ReadMoreModal />
              ) : (
                <ChatInterface
                  agent={agent}
                  agentEvents={agentEvents}
                  apiResponse={apiResponse}
                  onSendMessage={handleSendMessage}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  refetchAgent={refetch}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {apiResponse && txnHash && (
          <AttackStatusModal
            key={txnHash}
            apiResponse={apiResponse}
            showResultModal={showResultModal}
            setShowResultModal={setShowResultModal}
            txnHash={txnHash}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white pt-16">
      <MobileAgentHeader agentName={agent.agent_name} onInfoClick={() => setIsSidebarOpen(true)} />

      <div className="min-h-0 flex-1">
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

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-gray-50 shadow-2xl"
            >
              <AgentSidebar
                agent={agent}
                agentEvents={agentEvents}
                onReadMore={() => {
                  setIsSidebarOpen(false)
                  setIsReadMoreOpen(true)
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isReadMoreOpen && <ReadMoreModal />}

      {apiResponse && txnHash && (
        <AttackStatusModal
          key={txnHash}
          apiResponse={apiResponse}
          showResultModal={showResultModal}
          setShowResultModal={setShowResultModal}
          txnHash={txnHash}
        />
      )}
    </div>
  )
}

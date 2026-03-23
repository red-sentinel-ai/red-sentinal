'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'

import { MIST_PER_SUI , APP_NETWORK } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui'
import { AgentChallengePageSkeleton } from '@/components/ui/skeletons/AgentChallengePageSkeleton'
import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useAgentDetails, AGENT_DETAILS_FULL_QUERY_KEY } from '@/hooks/agents/useAgentDetails'
import { useAgentChatHistory, AGENT_CHAT_QUERY_KEY } from '@/hooks/agents/useAgentChatHistory'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'
import { AgentSidebar } from '@/components/agents/AgentSidebar'
import { MobileAgentHeader } from './MobileAgentHeader'

export default function AgentChallengePage({ slug }: { slug: string }) {
  const account = useCurrentAccount()
  const queryClient = useQueryClient()

  const { data: agent, isLoading, error, refetch } = useAgentDetails(slug)
  const { data: chat, isLoading: chatLoading, refetch: refetchChat } = useAgentChatHistory(
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

      setTimeout(() => {
        refetch()
        refetchChat()
        queryClient.invalidateQueries({
          queryKey: [AGENT_DETAILS_FULL_QUERY_KEY, slug, APP_NETWORK],
        })
        queryClient.invalidateQueries({
          queryKey: [AGENT_CHAT_QUERY_KEY, agent?.agent_id, APP_NETWORK],
        })
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
    <div className="ios-scroll absolute inset-0 flex flex-col overflow-hidden duration-200 animate-in fade-in">
      <div className="flex shrink-0 items-center justify-between py-6 md:py-8">
        <h2 className="text-2xl font-medium">Instructions</h2>
        <button onClick={() => setIsReadMoreOpen(false)} className="touch-manipulation p-2">
          <X size={24} />
        </button>
      </div>

      <div className="ios-scroll overflow-y-auto whitespace-pre-wrap px-1">
        {agent.prompt || 'No instructions available.'}
      </div>

      <div className="pb-safe shrink-0 pt-8">
        <button
          onClick={() => setIsReadMoreOpen(false)}
          className="btn btn-black touch-manipulation"
        >
          CLOSE
        </button>
      </div>
    </div>
  )

  if (isLoading) {
    return <AgentChallengePageSkeleton />
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
                  chatEvents={chat?.messages ?? []}
                  eventsLoading={chatLoading}
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
    <div className="ios-scroll flex h-[100dvh] flex-col bg-white pt-16">
      <MobileAgentHeader agentName={agent.agent_name} onInfoClick={() => setIsSidebarOpen(true)} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatInterface
          agent={agent}
          chatEvents={chat?.messages ?? []}
          eventsLoading={chatLoading}
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
              className="ios-scroll fixed bottom-0 left-0 top-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-gray-50 shadow-2xl"
            >
              <AgentSidebar
                agent={agent}
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

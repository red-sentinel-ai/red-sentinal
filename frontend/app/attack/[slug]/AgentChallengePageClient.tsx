'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'

import { APP_NETWORK, getTokenForCoinType } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui'
import { AgentChallengePageSkeleton } from '@/components/ui/skeletons/AgentChallengePageSkeleton'
import { useConsumePrompt } from '@/hooks/useConsumePrompt'
import { useConsumeSolanaPrompt } from '@/hooks/useConsumeSolanaPrompt'
import { useAgentDetails, AGENT_DETAILS_FULL_QUERY_KEY } from '@/hooks/agents/useAgentDetails'
import { useAgentChatHistory, AGENT_CHAT_QUERY_KEY } from '@/hooks/agents/useAgentChatHistory'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import ChatInterface from '@/components/agents/ChatInterface'
import { AgentSidebar } from '@/components/agents/AgentSidebar'
import { AgentReadMoreModal } from '@/components/agents/AgentReadMoreModal'
import { MobileAgentHeader } from './MobileAgentHeader'

export default function AgentChallengePage({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const { activeChain } = useActiveChain()
  const { address: connectedAddress } = useConnectedAddress()

  const { data: agent, isLoading, error, refetch } = useAgentDetails(slug)
  const { data: chat, isLoading: chatLoading, refetch: refetchChat } = useAgentChatHistory(
    agent?.agent_id
  )

  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false)

  const handleAttackComplete = useCallback((apiResponse: ConsumePromptApiResponse, txDigest: string) => {
    setApiResponse(apiResponse)
    setTxnHash(txDigest)
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

    if (connectedAddress && agent) {
      const isWinner = apiResponse.response.data.success

      posthog.capture('sentinel_attacked', {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        attacker_address: connectedAddress,
        is_successful: isWinner,
        attack_score: apiResponse.response.data.score,
        tx_digest: txDigest,
        cost_to_attack: Number(agent.cost_per_message) / Math.pow(10, getTokenForCoinType(agent.coin_type).decimals),
        chain: activeChain,
      })

      if (isWinner) {
        posthog.capture('sentinel_defeated', {
          agent_id: agent.agent_id,
          prize_pool_won: Number(agent.total_balance) / Math.pow(10, getTokenForCoinType(agent.coin_type).decimals),
          winner_address: connectedAddress,
          chain: activeChain,
        })
      }
    }
  }, [connectedAddress, agent, slug, refetch, refetchChat, queryClient, activeChain])

  const { consumePrompt: suiConsumePrompt } = useConsumePrompt({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionResult }) => {
      handleAttackComplete(apiResponse, transactionResult.digest)
    },
  })

  const { consumePrompt: solanaConsumePrompt } = useConsumeSolanaPrompt({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionDigest }) => {
      handleAttackComplete(apiResponse, transactionDigest)
    },
  })

  const agentChain = agent?.chain ?? 'sui'
  const chainMismatch = agent && agentChain !== activeChain ? agentChain : null
  const consumePrompt = agentChain === 'solana' ? solanaConsumePrompt : suiConsumePrompt

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleSendMessage = async (prompt: string) => {
    if (!agent) {
      setSubmitError('Agent not loaded')
      return
    }
    if (chainMismatch) {
      setSubmitError(`Switch to ${chainMismatch === 'solana' ? 'Solana' : 'Sui'} to attack this sentinel`)
      return
    }
    if (!connectedAddress) {
      setSubmitError('Please connect your wallet')
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
    return <AgentChallengePageSkeleton />
  }

  if (error || !agent) {
    return (
      <div
        className="h-[calc(100vh-128px)] bg-no-repeat p-4 pt-20 text-[var(--color-text-primary)]"
        style={{
          backgroundImage: 'url(/img/chat_bg.png)',
          backgroundPosition: '0% 17%',
          backgroundSize: '100% auto',
        }}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-lg text-[var(--color-text-secondary)]">{error?.message || 'Agent not found'}</p>
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
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <AgentSidebar
              agent={agent}
              onReadMore={() => setIsReadMoreOpen(true)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={75}>
            <div className="max-w-v1 relative mx-auto h-full w-full">
              <ChatInterface
                agent={agent}
                chatEvents={chat?.messages ?? []}
                eventsLoading={chatLoading}
                apiResponse={apiResponse}
                onSendMessage={handleSendMessage}
                isSubmitting={isSubmitting}
                submitError={submitError}
                refetchAgent={refetch}
                chainMismatch={chainMismatch}
              />
              {isReadMoreOpen && (
                <AgentReadMoreModal
                  prompt={agent.prompt}
                  onClose={() => setIsReadMoreOpen(false)}
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
    <div className="ios-scroll flex h-[calc(100dvh-96px)] flex-col bg-[var(--color-bg-surface)]">
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
          chainMismatch={chainMismatch}
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
              className="ios-scroll fixed bottom-0 left-0 top-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-[var(--color-bg-subtle)] shadow-2xl"
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

      {isReadMoreOpen && (
        <AgentReadMoreModal
          prompt={agent.prompt}
          onClose={() => setIsReadMoreOpen(false)}
        />
      )}

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

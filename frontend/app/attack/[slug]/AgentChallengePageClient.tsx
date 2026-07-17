'use client'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { Info, X } from 'lucide-react'

import { APP_NETWORK } from '@/constants'
import { getTokenForCoinType } from '@/constants/tokens'
import type { ConsumePromptApiResponse } from '@/types'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui'
import { AgentChallengePageSkeleton } from '@/components/ui/skeletons/AgentChallengePageSkeleton'
import { useConsumePromptSui } from '@/hooks/useConsumePromptSui'
import { useConsumePromptSolana } from '@/hooks/useConsumePromptSolana'
import { useConsumePromptEVM } from '@/hooks/useConsumePromptEVM'
import { useAgent, AGENT_QUERY_KEY } from '@/hooks/agents/useAgentDetails'
import { useAgentChatHistory, AGENT_CHAT_QUERY_KEY } from '@/hooks/agents/useAgentChatHistory'
import { useCanSendMessage } from '@/hooks/chat'
import { useAgentVoiceToken } from '@/hooks/voice'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useActiveChain } from '@/context/ActiveChainContext'
import { useFocusMode } from '@/context/FocusModeContext'
import { useRenderInTopbar } from '@/context/TopbarSlotContext'
import { CHAINS, type SupportedChain } from '@/constants/chains'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { AttackStatusModal } from '@/components/AttackStatusModal'
import { AttackWorkspace, type ViewMode } from '@/components/agents/AttackWorkspace'
import { AgentSidebar } from '@/components/agents/AgentSidebar'
import { AgentReadMoreModal } from '@/components/agents/AgentReadMoreModal'
import { VoiceRoomModal } from '@/components/voice/VoiceRoomModal'
import type { ChallengeMode } from '@/components/agents/ChallengeModeToggle'
import { AttackTopbarSlot } from './AttackTopbarSlot'
import { MobileAgentHeader } from './MobileAgentHeader'

const VOICE_PERMISSION_HINT =
  'You must be the agent owner, have made at least one attack, or be a syndicate member to join the voice room.'
/**
 *
 * useEffect(() => {}, [])
 */
export default function AgentChallengePage({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const { activeChain } = useActiveChain()
  const { address: connectedAddress, isHydrated } = useConnectedAddress()
  const { isFocusMode, disableFocusMode } = useFocusMode()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<ConsumePromptApiResponse | null>(null)
  const [txnHash, setTxnHash] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('attack')
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>('attack')
  const isMobile = useMediaQuery('(max-width: 768px)')

  const { data: agent, isLoading, error, refetch } = useAgent(slug)

  const didInitChallengeMode = useRef(false)
  useEffect(() => {
    if (didInitChallengeMode.current || !agent || !isHydrated) return
    didInitChallengeMode.current = true
    if (!connectedAddress) setChallengeMode('casual')
  }, [agent, isHydrated, connectedAddress])
  const {
    data: chat,
    isLoading: chatLoading,
    refetch: refetchChat,
  } = useAgentChatHistory(agent?.agent_id)

  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false)
  const [isVoiceRoomOpen, setIsVoiceRoomOpen] = useState(false)

  // On mobile the sentinel name and the attack/casual toggle share the topbar row
  // with the wallet button instead of each taking a bar of their own.
  const isModeToggleInTopbar = isMobile && !isFocusMode && viewMode !== 'chat'
  const topbarContent = useMemo(
    () =>
      isModeToggleInTopbar && agent ? (
        <AttackTopbarSlot
          agentName={agent.agent_name}
          challengeMode={challengeMode}
          onChangeChallengeMode={setChallengeMode}
        />
      ) : null,
    [isModeToggleInTopbar, agent, challengeMode]
  )
  useRenderInTopbar(topbarContent)

  const { data: canSendData } = useCanSendMessage(agent?.agent_id, connectedAddress || undefined)
  const canJoinVoice = !!canSendData?.can_send
  const voiceToken = useAgentVoiceToken(
    agent?.agent_id,
    connectedAddress || undefined,
    isVoiceRoomOpen && canJoinVoice
  )

  const handleAttackComplete = useCallback(
    (apiResponse: ConsumePromptApiResponse, txDigest: string) => {
      setApiResponse(apiResponse)
      setTxnHash(txDigest)
      setShowResultModal(true)

      setTimeout(() => {
        refetch()
        refetchChat()
        queryClient.invalidateQueries({
          queryKey: [AGENT_QUERY_KEY, slug, APP_NETWORK],
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
          cost_to_attack:
            Number(agent.cost_per_message) /
            Math.pow(10, getTokenForCoinType(agent.coin_type, agent.chain).decimals),
          chain: activeChain,
        })

        if (isWinner) {
          posthog.capture('sentinel_defeated', {
            agent_id: agent.agent_id,
            prize_pool_won:
              Number(agent.total_balance) /
              Math.pow(10, getTokenForCoinType(agent.coin_type, agent.chain).decimals),
            winner_address: connectedAddress,
            chain: activeChain,
          })
        }
      }
    },
    [connectedAddress, agent, slug, refetch, refetchChat, queryClient, activeChain]
  )

  const { consumePrompt: suiConsumePrompt } = useConsumePromptSui({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionResult }) => {
      handleAttackComplete(apiResponse, transactionResult.digest)
    },
  })

  const { consumePrompt: solanaConsumePrompt } = useConsumePromptSolana({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionDigest }) => {
      handleAttackComplete(apiResponse, transactionDigest)
    },
  })

  const { consumePrompt: evmConsumePrompt } = useConsumePromptEVM({
    showToasts: true,
    onError: err => {
      setSubmitError(err.message || 'Something went wrong')
    },
    onComplete: ({ apiResponse, transactionDigest }) => {
      handleAttackComplete(apiResponse, transactionDigest)
    },
  })

  const agentChain: SupportedChain = agent?.chain
  const chainToSwitch: SupportedChain | null =
    agent && agentChain !== activeChain ? agentChain : null
  let consumePrompt = suiConsumePrompt
  switch (agentChain) {
    case 'solana':
      consumePrompt = solanaConsumePrompt
      break
    case 'bnb':
    case 'bot':
    case 'arb':
      consumePrompt = evmConsumePrompt as typeof suiConsumePrompt // we should fix this
      break
  }

  const handleTextChatClick = useCallback(() => {
    setIsSidebarOpen(false)
    setViewMode('chat')
  }, [])

  const handleVoiceChatClick = useCallback(() => {
    setIsSidebarOpen(false)
    setIsVoiceRoomOpen(true)
  }, [])

  const handleBackToAttack = useCallback(() => {
    setViewMode('attack')
  }, [])

  const handleSendMessage = async (prompt: string) => {
    if (!agent) {
      setSubmitError('Agent not loaded')
      return
    }
    if (chainToSwitch) {
      const chainName = CHAINS[chainToSwitch]?.name
      setSubmitError(`Switch to ${chainName} to attack this sentinel`)
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
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black p-4">
        <div className="text-center">
          <p className="industrial-header text-sm text-[var(--color-text-muted)]">
            {error?.message ? 'ERROR_LOADING_SENTINEL' : 'SENTINEL_NOT_FOUND'}
          </p>
          <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
            {error?.message || 'The requested sentinel could not be located'}
          </p>
        </div>
      </div>
    )
  }

  // Rendered in every layout branch below — the sentinel's community voice room.
  const voiceRoomModal = (
    <VoiceRoomModal
      open={isVoiceRoomOpen}
      onClose={() => setIsVoiceRoomOpen(false)}
      title={agent.agent_name}
      authToken={voiceToken.data?.auth_token}
      isTokenLoading={voiceToken.isLoading}
      isTokenError={voiceToken.isError}
      canJoin={canJoinVoice}
      permissionHint={VOICE_PERMISSION_HINT}
      connectedAddress={connectedAddress || undefined}
    />
  )

  const attackWorkspace = (
    <AttackWorkspace
      agent={agent}
      viewMode={viewMode}
      onBackToAttack={handleBackToAttack}
      challengeMode={challengeMode}
      onChangeChallengeMode={setChallengeMode}
      showModeToggle={!isModeToggleInTopbar}
      chatEvents={chat?.messages ?? []}
      eventsLoading={chatLoading}
      apiResponse={apiResponse}
      onSendMessage={handleSendMessage}
      isSubmitting={isSubmitting}
      submitError={submitError}
      refetchAgent={refetch}
      chainMismatch={chainToSwitch}
    />
  )

  // Focus mode - full screen chat
  if (isFocusMode) {
    return (
      <div className="flex h-screen flex-col bg-black">
        {/* Focus mode header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
            >
              <Info className="h-3.5 w-3.5" />
              <span className="industrial-header text-[10px] tracking-widest">SENTINEL_INFO</span>
            </button>
            <span className="industrial-header text-[11px] tracking-widest text-white">
              {agent.agent_name.toUpperCase().replace(/\s+/g, '_')}
            </span>
          </div>
          <button
            onClick={disableFocusMode}
            className="flex items-center gap-2 border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            <span className="industrial-header text-[10px] tracking-widest">EXIT_FOCUS</span>
          </button>
        </div>

        {/* Full width chat */}
        <div className="min-h-0 flex-1 overflow-hidden">{attackWorkspace}</div>

        {/* Sidebar drawer for focus mode */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/80"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="ios-scroll terminal-scrollbar fixed bottom-0 left-0 top-0 z-50 w-[400px] max-w-[90vw] overflow-y-auto border-r border-[var(--color-border-strong)] bg-black shadow-2xl"
              >
                <AgentSidebar
                  agent={agent}
                  onReadMore={() => {
                    setIsSidebarOpen(false)
                    setIsReadMoreOpen(true)
                  }}
                  onTextChat={handleTextChatClick}
                  onVoiceChat={handleVoiceChatClick}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AgentReadMoreModal
          isOpen={isReadMoreOpen}
          prompt={agent.prompt}
          onClose={() => setIsReadMoreOpen(false)}
        />

        {apiResponse && txnHash && (
          <AttackStatusModal
            key={txnHash}
            apiResponse={apiResponse}
            showResultModal={showResultModal}
            setShowResultModal={setShowResultModal}
            txnHash={txnHash}
          />
        )}

        {voiceRoomModal}
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-black">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={28} minSize={22} maxSize={40}>
            <AgentSidebar
              agent={agent}
              onReadMore={() => setIsReadMoreOpen(true)}
              onTextChat={handleTextChatClick}
              onVoiceChat={handleVoiceChatClick}
            />
          </ResizablePanel>
          <ResizableHandle withHandle={true} className="bg-[var(--color-border-strong)]" />
          <ResizablePanel defaultSize={72}>
            <div className="relative h-full w-full">
              {attackWorkspace}
              <AgentReadMoreModal
                isOpen={isReadMoreOpen}
                prompt={agent.prompt}
                onClose={() => setIsReadMoreOpen(false)}
              />
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

        {voiceRoomModal}
      </div>
    )
  }

  return (
    <div className="ios-scroll flex h-[calc(100dvh-64px)] flex-col bg-black">
      {viewMode !== 'chat' && <MobileAgentHeader onInfoClick={() => setIsSidebarOpen(true)} />}

      <div className="min-h-0 flex-1 overflow-hidden">{attackWorkspace}</div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/80"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="ios-scroll terminal-scrollbar fixed bottom-0 left-0 top-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-black shadow-2xl"
            >
              <AgentSidebar
                agent={agent}
                onReadMore={() => {
                  setIsSidebarOpen(false)
                  setIsReadMoreOpen(true)
                }}
                onTextChat={handleTextChatClick}
                onVoiceChat={handleVoiceChatClick}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AgentReadMoreModal
        isOpen={isReadMoreOpen}
        prompt={agent.prompt}
        onClose={() => setIsReadMoreOpen(false)}
      />

      {apiResponse && txnHash && (
        <AttackStatusModal
          key={txnHash}
          apiResponse={apiResponse}
          showResultModal={showResultModal}
          setShowResultModal={setShowResultModal}
          txnHash={txnHash}
        />
      )}

      {voiceRoomModal}
    </div>
  )
}

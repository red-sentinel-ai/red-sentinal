'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@/components/Dialog'
import { TruncatedText } from '@/components/TruncatedText'
import { ConsumePromptApiResponse } from '@/types'
import type { Agent } from '@/types/agents'
import { useActiveChain } from '@/context/ActiveChainContext'
import { getExplorerTxUrl } from '@/lib/explorer'
import { cn } from '@/lib/utils'
import { SentinelSpeechButton } from '@/components/agents/SentinelSpeechButton'
import { useSpeechPlayback } from '@/hooks/useSpeechPlayback'
import { AttackShareCard } from '@/components/agents/AttackShareCard'

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
  txnHash: string
  /** The attacked sentinel — drives the share card's story and challenge link. */
  agent: Agent
  /** The prompt submitted for this attack, if it completed successfully. */
  submittedPrompt?: string | null
}

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
  txnHash,
  agent,
  submittedPrompt,
}: AttackStatusModalProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
  const { activeChain } = useActiveChain()

  const txExplorerUrl = getExplorerTxUrl(txnHash, activeChain)

  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore
  const explanation = apiResponse?.response.data.agent_response
  const juryResponse = apiResponse?.response.data.jury_response

  const explanationSpeech = useSpeechPlayback(explanation || '')

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
      className="flex max-h-[90dvh] w-[90vw] max-w-[773px] flex-col overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <button
          onClick={() => setShowResultModal(false)}
          className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="flex-shrink-0 p-6 pb-0">
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                'mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                success ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
              )}
            >
              <span className="text-lg font-bold text-white">{success ? '✓' : '!'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight text-white">
                {success ? 'Attack Successful' : 'Attack Failed'}
              </h2>
              <p className="text-[15px] leading-snug text-[var(--color-text-muted)]">
                {success
                  ? "Your Prompt Successfully breached the sentinel's defenses !"
                  : 'The Sentinel held strong against your attack.'}
              </p>
            </div>
          </div>

          <div className="my-5 h-[1px] w-full bg-white/10" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 pb-4 sm:px-8">
            <div className="mb-4 flex items-center">
              <span className="mr-2 text-base">⚔️</span>
              <span className="text-[15px] font-medium text-white">
                Your Attack Score: <span className="text-sm font-bold">{score}/100</span>
              </span>
              <Link
                href={txExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 mt-0.5 flex items-center text-[10px] font-medium text-white/40 hover:text-white hover:underline"
              >
                view on explorer
              </Link>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                  className="group flex items-center gap-2 text-left"
                >
                  <h3 className="text-[15px] font-medium text-white">Explanation</h3>
                  <span className="text-white/40 transition-colors group-hover:text-white">
                    {isExplanationOpen ? '▲' : '▼'}
                  </span>
                </button>
                {explanation && (
                  <SentinelSpeechButton
                    status={explanationSpeech.status}
                    onToggle={explanationSpeech.toggle}
                    variant="plain"
                  />
                )}
              </div>

              <AnimatePresence initial={false}>
                {isExplanationOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <TruncatedText
                      text={explanation || 'No explanation provided by the Sentinel.'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-2 mt-4">
              <h3 className="text-[15px] font-medium text-white">Jury Response</h3>

              <div className="overflow-hidden">
                <TruncatedText
                  text={juryResponse || 'No jury response provided by the Sentinel.'}
                />
              </div>
            </div>

            <div className="mt-6">
              <AttackShareCard
                agent={agent}
                success={success}
                score={score}
                prompt={submittedPrompt || ''}
                reply={explanation || ''}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Dialog>
  )
}

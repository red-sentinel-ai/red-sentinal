'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@/components/Dialog'
import { TruncatedText } from '@/components/TruncatedText'
import { ConsumePromptApiResponse } from '@/types'
import { useActiveChain } from '@/context/ActiveChainContext'
import { getExplorerTxUrl } from '@/lib/explorer'
import { cn } from '@/lib/utils'
import { SpinPassPromo } from '@/components/rewards/SpinPassPromo'

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
  txnHash: string
}

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
  txnHash,
}: AttackStatusModalProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
  const { activeChain } = useActiveChain()

  const txExplorerUrl = getExplorerTxUrl(txnHash, activeChain)

  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore
  const explanation = apiResponse?.response.data.agent_response
  const juryResponse = apiResponse?.response.data.jury_response

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
      className="flex max-h-[90dvh] w-[90vw] max-w-[773px] flex-col overflow-hidden rounded-xl border border-[#9A9A9A] bg-white p-0"
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
          className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-black transition-colors hover:bg-gray-100"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="flex-shrink-0 p-6 pb-0">
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                'mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                success ? 'bg-[#1FAD57]' : 'bg-[#D32F2F]'
              )}
            >
              <span className="text-lg font-bold text-white">{success ? '✓' : '!'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight text-black">
                {success ? 'Attack Successful' : 'Attack Failed'}
              </h2>
              <p className="text-[15px] leading-snug text-[#989898]">
                {success
                  ? "Your Prompt Successfully breached the sentinel's defenses !"
                  : 'The Sentinel held strong against your attack.'}
              </p>
            </div>
          </div>

          <div className="my-5 h-[1px] w-full bg-[#E5E5E5]" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 pb-4 sm:px-8">
            <div className="mb-4 flex items-center">
              <span className="mr-2 text-base">⚔️</span>
              <span className="text-[15px] font-medium text-black">
                Your Attack Score: <span className="text-sm font-bold">{score}/100</span>
              </span>
              <Link
                href={txExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 mt-0.5 flex items-center text-[10px] font-medium text-[#989898] hover:text-black hover:underline"
              >
                view on explorer
              </Link>
            </div>

            <div className="mb-2">
              <button
                onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                className="group flex w-full items-center justify-between text-left"
              >
                <h3 className="text-[15px] font-medium text-black">Explanation</h3>
                <span className="text-gray-500 transition-colors group-hover:text-black">
                  {isExplanationOpen ? '▲' : '▼'}
                </span>
              </button>

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
              <h3 className="text-[15px] font-medium text-black">Jury Response</h3>

              <div className="overflow-hidden">
                <TruncatedText
                  text={juryResponse || 'No jury response provided by the Sentinel.'}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E5E5]">
            <SpinPassPromo description="You've received a free spin pass for your attack!" />
          </div>
        </div>
      </motion.div>
    </Dialog>
  )
}

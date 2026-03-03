'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { Dialog } from '@/components/Dialog'
import { TruncatedText } from '@/components/TruncatedText'
import { ConsumePromptApiResponse } from '@/types'
import { SUIVISION_TXBLOCK_URL } from '@/constants'
import { cn } from '@/lib/utils'

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
  const { width, height } = useWindowSize()
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore
  const explanation = apiResponse?.response.data.agent_response
  const juryResponse = apiResponse?.response.data.jury_response

  // Trigger confetti animation when modal opens
  React.useEffect(() => {
    if (showResultModal) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showResultModal])

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
      className="flex max-h-[calc(100vh-40px)] w-full max-w-[773px] flex-col overflow-hidden rounded-xl border border-[#9A9A9A] bg-white p-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative flex h-full w-full flex-col overflow-hidden"
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
          <div className="px-8 pb-4">
            <div className="mb-4 flex items-center">
              <span className="mr-2 text-base">⚔️</span>
              <span className="text-[15px] font-medium text-black">
                Your Attack Score: <span className="text-sm font-bold">{score}/100</span>
              </span>
              <Link
                href={`${SUIVISION_TXBLOCK_URL}/${txnHash}`}
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

          <div className="mb-6 h-[1px] w-full bg-[#E5E5E5]" />

          <div className="relative flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-b from-white to-pink-50/30 px-6 pb-8">
            {showConfetti && (
              <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                  numberOfPieces={500}
                  gravity={0.2}
                />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 w-full max-w-md text-center"
            >
              <div className="mb-6 inline-block">
                <Image
                  src="/img/slot_machine_1x.png"
                  alt="Slot machine"
                  width={96}
                  height={126}
                  className="h-24 w-24"
                />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-black">Free Spin Pass Received!</h3>

              <p className="mb-6 text-base text-gray-600">
                You&apos;ve received a free spin pass for your attack!
                <br />
                Use your pass to WIN SENTINEL tokens from your profile rewards tab.
              </p>

              <div className="mb-6 rounded-xl border-2 border-dashed border-[#F632F3] bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  🎁 Spin passes may contain boosters with up to{' '}
                  <span className="font-bold text-[#F632F3]">100x multipliers</span>
                </p>
              </div>

              <Link
                href="/profile?tab=rewards"
                className="inline-block w-full rounded-lg bg-black px-6 py-4 font-semibold text-white transition-transform hover:scale-105"
              >
                Go to Profile → Spin Now
              </Link>

              <p className="mt-4 text-xs text-gray-500">
                Passes are automatically available in your profile
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Dialog>
  )
}

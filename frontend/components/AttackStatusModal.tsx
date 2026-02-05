'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Check, ChevronDown, ChevronUp, Swords } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { Dialog } from '@/components/Dialog'
import { ConsumePromptApiResponse } from '@/types'
import { SUI_TESTNET_BASE_URL } from '@/constants'
import { cn } from '@/lib/utils'
import { SlotMachine } from './slot-machine/SlotMachine'

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
  txnHash: string
}

const TruncatedText = ({ text, limit = 200 }: { text: string; limit?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= limit) {
    return <p className="mt-1 pr-2 text-sm leading-relaxed text-[#575757]">{text}</p>
  }

  return (
    <div className="mt-1 pr-2">
      <div
        className={cn(
          'text-sm leading-relaxed text-[#575757] transition-all',
          isExpanded && 'max-h-[150px] overflow-y-auto pr-1'
        )}
      >
        {isExpanded ? text : `${text.slice(0, limit)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="mt-1 text-xs font-medium text-[#989898] underline decoration-1 underline-offset-2 hover:text-black"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  )
}

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
  txnHash,
}: AttackStatusModalProps) => {
  const { width, height } = useWindowSize()
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
  const [rewardAmount, setRewardAmount] = useState<number | null>(null)
  const [isSlotAvailable, setIsSlotAvailable] = useState(true)

  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore
  const explanation = apiResponse?.response.data.agent_response
  const juryResponse = apiResponse?.response.data.jury_response

  const handleSlotWin = (amount: number) => {
    setRewardAmount(amount)
  }

  const handleSlotError = (errorMsg: string) => {
    if (errorMsg.includes('No unclaimed rewards')) {
      setIsSlotAvailable(false)
    } else {
      console.error('Slot Machine Error:', errorMsg)
    }
  }

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
          className="absolute right-5 top-5 z-20 rounded-full p-1 text-black transition-colors hover:bg-gray-100"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-shrink-0 p-6 pb-0">
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                'mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                success ? 'bg-[#1FAD57]' : 'bg-[#D32F2F]'
              )}
            >
              {success ? (
                <Check className="h-5 w-5 stroke-[3px] text-white" />
              ) : (
                <span className="text-lg font-bold text-white">!</span>
              )}
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

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-8 pb-4">
            <div className="mb-4 flex items-center">
              <Swords className="mr-2 h-5 w-5 fill-black text-black" />
              <span className="text-[15px] font-medium text-black">
                Your Attack Score: <span className="text-sm font-bold">{score}/100</span>
              </span>
              <Link
                href={`${SUI_TESTNET_BASE_URL}/${txnHash}`}
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
                {isExplanationOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 transition-colors group-hover:text-black" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 transition-colors group-hover:text-black" />
                )}
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
            {rewardAmount !== null && (
              <div className="pointer-events-none absolute inset-0 z-50">
                <Confetti
                  width={width}
                  height={height}
                  recycle={false}
                  numberOfPieces={500}
                  gravity={0.2}
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {isSlotAvailable ? (
                <motion.div
                  key="slot-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex w-full flex-col items-center"
                >
                  {!rewardAmount && (
                    <div className="mb-6 text-center text-xl font-medium">
                      <p>
                        The SENTINEL grants you a{' '}
                        <span className="font-bold text-[#F632F3]">bonus spin</span>.
                      </p>
                      <p className="text-lg text-black">Try your luck!</p>
                    </div>
                  )}

                  <SlotMachine onWin={handleSlotWin} onError={handleSlotError} />

                  {rewardAmount !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center"
                    >
                      <h3 className="mb-2 text-3xl font-bold text-black">Congratulations!</h3>
                      <p className="mb-6 text-lg text-[#5E5E5E]">
                        You won{' '}
                        <span className="font-bold text-[#F046D6]">{rewardAmount} SENTINEL</span>{' '}
                        points!
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm italic text-gray-400"
                ></motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </Dialog>
  )
}

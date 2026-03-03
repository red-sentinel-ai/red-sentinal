'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Check, ChevronDown, ChevronUp, Swords } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { Dialog } from '@/components/Dialog'
import { TruncatedText } from '@/components/TruncatedText'
import { ConsumePromptApiResponse } from '@/types'
import { SUIVISION_TXBLOCK_URL, BOOSTER_TIERS } from '@/constants'
import { cn } from '@/lib/utils'
import { useClaimReward } from '@/hooks/rewards/useClaimReward'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
  const account = useCurrentAccount()
  const [isExplanationOpen, setIsExplanationOpen] = useState(true)
  const [awardedBooster, setAwardedBooster] = useState<any>(null)
  const [isClaiming, setIsClaiming] = useState(false)

  const success = apiResponse?.response.data.success
  const originalScore = apiResponse?.response.data.score || 0
  const score = success ? 100 : originalScore
  const explanation = apiResponse?.response.data.agent_response
  const juryResponse = apiResponse?.response.data.jury_response

  const { mutateAsync: claimTokens } = useClaimReward()

  useEffect(() => {
    const claimBooster = async () => {
      if (!showResultModal || !account?.address || isClaiming || awardedBooster) return

      setIsClaiming(true)
      try {
        const data = await claimTokens({ recipient: account.address })
        if (data.claimed && data.boosterAwarded) {
          setAwardedBooster(data.boosterAwarded)
          toast.success(
            `${data.boosterAwarded.tier} Booster awarded! Check your profile to spin it.`
          )
        }
      } catch (error: any) {
        console.error('Failed to claim booster:', error)
        // Silent fail - user can still see their attack result
      } finally {
        setIsClaiming(false)
      }
    }

    claimBooster()
  }, [showResultModal, account?.address])

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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-8 pb-4">
            <div className="mb-4 flex items-center">
              <Swords className="mr-2 h-5 w-5 fill-black text-black" />
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
            {awardedBooster && (
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

            <AnimatePresence mode="wait">
              {true ? (
                <motion.div
                  key="slot-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 flex w-full flex-col items-center"
                >
                  {awardedBooster ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full max-w-md rounded-xl border-2 border-black bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center"
                    >
                      <div className="mb-4 flex items-center justify-center gap-2">
                        <span className="text-4xl">
                          {BOOSTER_TIERS[awardedBooster.tier as keyof typeof BOOSTER_TIERS]
                            ?.color || '🎁'}
                        </span>
                        <div>
                          <h3 className="text-2xl font-bold text-black">
                            {awardedBooster.tier} Booster Awarded!
                          </h3>
                          <p className="text-lg text-gray-600">
                            {awardedBooster.multiplier}x Multiplier
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 rounded-lg bg-white/50 p-4">
                        <p className="text-sm text-gray-700">
                          Potential Reward:{' '}
                          <span className="font-bold text-[#F632F3]">
                            {BOOSTER_TIERS[
                              awardedBooster.tier as keyof typeof BOOSTER_TIERS
                            ]?.minReward.toLocaleString()}{' '}
                            -{' '}
                            {BOOSTER_TIERS[
                              awardedBooster.tier as keyof typeof BOOSTER_TIERS
                            ]?.maxReward.toLocaleString()}{' '}
                            SENTINEL
                          </span>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          Expires: {new Date(awardedBooster.expiresAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        href="/profile?tab=rewards"
                        className="inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
                      >
                        Go to Profile to Spin
                      </Link>
                    </motion.div>
                  ) : isClaiming ? (
                    <div className="text-center">
                      <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
                      <p className="text-gray-600">Claiming your booster...</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <p>No booster available at this time</p>
                    </div>
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

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Info,
  LinkIcon,
  TrendingUp,
  User,
  TrendingDown,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react'
import { formatAddress } from '@mysten/sui/utils'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'
import { useCurrentAccount } from '@mysten/dapp-kit'
import {
  DEFAULT_PROFILE_URL,
  MIST_PER_SUI,
  EXPLORER_BASE_URL,
  SLUSH_BASE_URL,
  WITHDRAWAL_LOCK_MS,
  SUI_SENTINEL_X_USERNAME,
} from '@/constants'
import { type AgentDetails } from '@/hooks/agents/useAllAgents'
import { type AgentEvents } from '@/hooks/useAgentEvents'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { DefenderProfile } from './DefenderProfile'
import { formatDuration, cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Button } from '@/components/ui'
import { PrizePoolChartModal } from '@/components/charts/PrizePoolChartModal'
import { SparklineChart } from '../ui/common/SparklineChart'
import { useAgentPrizePoolHistory } from '@/hooks/agents/useAgentPrizePoolHistory'
import { Dialog } from '@/components/Dialog'

interface AgentSidebarProps {
  agent: AgentDetails
  agentEvents: AgentEvents
}

export const AgentSidebar = ({ agent, agentEvents }: AgentSidebarProps) => {
  const [activeSince, setActiveSince] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const instructionsRef = useRef<HTMLParagraphElement>(null)
  const [pageUrl, setPageUrl] = useState('')
  const [deepLinkUrl, setDeepLinkUrl] = useState('')
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [tweetLink, setTweetLink] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const account = useCurrentAccount()
  const isOwner = account?.address === agent.owner

  const { data: prizePoolData, isLoading: isLoadingChart } = useAgentPrizePoolHistory(
    agent.agent_id
  )

  const { data: userProfilesMap, isLoading: isLoadingProfile } = useUserProfiles([agent.owner])
  const defenderProfile = userProfilesMap?.[agent.owner]

  useEffect(() => {
    const currentUrl = window.location.href
    setPageUrl(currentUrl)

    const encodedUrl = encodeURIComponent(currentUrl)
    setDeepLinkUrl(SLUSH_BASE_URL + encodedUrl)
  }, [])

  const isDrained = agentEvents.agentDefeated.length > 0
  const bountyWonEvent = isDrained ? agentEvents.agentDefeated[0] : null
  const bountyWonAmount = bountyWonEvent
    ? (Number(bountyWonEvent.parsedJson.amount_won) / MIST_PER_SUI).toFixed(2)
    : '0.00'
  const winnerAddress = bountyWonEvent ? bountyWonEvent.parsedJson.winner : null

  useEffect(() => {
    if (!agent.created_at || isDrained) return

    const createdTime = new Date(agent.created_at).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const diff = now - createdTime
      setActiveSince(formatDuration(diff))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [agent.created_at, isDrained])

  useEffect(() => {
    if (isDrained) {
      setTimeRemaining('Funds Withdrawn')
      return
    }
    if (!isOwner) {
      setTimeRemaining(null)
      return
    }

    const lastFunded = Number(agent.last_funded_timestamp)
    if (lastFunded === 0) {
      setTimeRemaining('Withdrawal Unlocked')
      return
    }

    const unlockTimestamp = lastFunded + WITHDRAWAL_LOCK_MS

    const updateTimer = () => {
      const now = Date.now()
      const diff = unlockTimestamp - now

      if (diff <= 0) {
        setTimeRemaining('Withdrawal Unlocked')
        return null // To stop the interval
      }

      const formatted = formatDuration(diff)
      setTimeRemaining(
        `${formatted.days}d ${formatted.hours}h ${formatted.minutes}m ${formatted.seconds}s`
      )
      return true // To keep interval running
    }

    if (!updateTimer()) {
      return // Stop if it's already unlocked
    }

    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [agent.last_funded_timestamp, isDrained, isOwner])

  useEffect(() => {
    if (instructionsRef.current) {
      const lineHeight = parseFloat(getComputedStyle(instructionsRef.current).lineHeight)
      const maxHeightForFourLines = lineHeight * 4
      if (instructionsRef.current.scrollHeight > maxHeightForFourLines) {
        setShouldTruncate(true)
      } else {
        setShouldTruncate(false)
      }
    }
  }, [agent.system_prompt])

  const breakAttempts = agentEvents.promptConsumed.length
  const totalParticipants = new Set(
    agentEvents.promptConsumed.map((event) => event.parsedJson.sender)
  ).size

  const handleCopyLink = () => {
    if (pageUrl) {
      navigator.clipboard.writeText(pageUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleShareClick = () => {
    const text = `I'm challenging ${agent.agent_name} on @${SUI_SENTINEL_X_USERNAME}! 🛡️\n\nThink you can break this AI agent and win the prize pool?\n\nTry it here:`
    const url = pageUrl || window.location.href
    const hashtags = 'SuiSentinel,AI,Web3,Sui'

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`

    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false)
    setIsSubmitted(false)
    setTweetLink('')
  }

  const handleVerifyTweet = async () => {
    if (!tweetLink.trim()) {
      toast.error('Please paste your tweet link first')
      return
    }

    if (!tweetLink.includes('twitter.com') && !tweetLink.includes('x.com')) {
      toast.error('Please enter a valid X (Twitter) URL')
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/rewards/verify-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: account?.address,
          tweet_url: tweetLink,
          agent_name: agent.agent_name,
          agent_id: agent.agent_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification request failed')
      }

      setIsSubmitted(true)
      setTweetLink('')
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit tweet for verification')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      <div className="w-full flex flex-col overflow-x-hidden overflow-y-scroll px-6 py-2 mr-4 h-screen md:h-[calc(100vh-127px)]">
        <div>
          <Link
            href="/attack"
            className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors py-3"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Sentinels
          </Link>
        </div>

        <div className="rounded-xl px-4 my-4 border border-gray-600/50 shadow-lg w-full text-xs sm:text-sm bg-gradient-to-r from-[#F7F3FC] to-[#FFFEFF] py-[10px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden grow-0 shrink-0 basis-auto">
              <Image
                src={agent.agent_profile || DEFAULT_PROFILE_URL}
                width={40}
                height={40}
                alt={agent.agent_name}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-xl font-medium">{agent.agent_name}</p>
              {agent.is_featured && (
                <Image
                  src="/icons/check-mark.svg"
                  width={20}
                  height={20}
                  alt="checkmark"
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-[#5E5E5E]  font-medium uppercase">Sentinel Object Id</h3>
            <Link
              href={`${EXPLORER_BASE_URL}/object/${agent.object_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block  hover:underline"
              title={agent.object_id}
            >
              {formatAddress(agent.object_id)}
            </Link>
          </div>

          {isDrained ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-[#5E5E5E]  font-medium uppercase flex items-center gap-1.5">
                Total Bounty Won
              </h3>
              <p className="inline-block text-2xl font-semibold">{bountyWonAmount} SUI</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-[#5E5E5E]  font-medium uppercase">Prize pool</h3>
                {!isLoadingChart && prizePoolData && prizePoolData.history.length > 0 && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      prizePoolData.change7d.percentage >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {prizePoolData.change7d.percentage >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {isFinite(prizePoolData.change7d.percentage)
                        ? `${prizePoolData.change7d.percentage.toFixed(1)}% (7d)`
                        : 'New'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between gap-4">
                <p className="inline-block text-2xl font-semibold">
                  {(Number(agent.balance) / MIST_PER_SUI).toFixed(2)} SUI
                </p>
                {isLoadingChart ? (
                  <div className="w-[100px] h-[30px] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div>
                    <SparklineChart data={prizePoolData?.history.map((p) => p.value) || []} />
                  </div>
                )}
              </div>
              {!isLoadingChart && prizePoolData && prizePoolData.history.length > 0 && (
                <Button
                  onClick={() => setIsChartModalOpen(true)}
                  className="w-full bg-transparent border border-[#558EB4]/50 text-[#558EB4] hover:bg-[#558EB4]/20 hover:text-black transition-colors duration-300 font-semibold text-sm mt-2"
                  size="sm"
                >
                  See Growth Chart
                </Button>
              )}
              {!isLoadingChart && (!prizePoolData || prizePoolData.history.length === 0) && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  No prize pool history available.
                </p>
              )}
            </div>
          )}
          {isDrained && winnerAddress && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[#5E5E5E]  font-medium uppercase flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Winner
              </h3>
              <Link
                href={`/u/${winnerAddress}`}
                className="inline-block  hover:underline"
                title={winnerAddress}
              >
                {formatAddress(winnerAddress)}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-[#5E5E5E]  font-medium uppercase">Message Price</h3>
            <p className="inline-block text-2xl font-semibold">
              {(Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(4)} SUI
            </p>
          </div>

          {!isDrained && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <h3 className="text-black/70 text-sm font-semibold uppercase">Active Since</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      asChild
                      className="cursor-help"
                    >
                      <Info
                        width={12}
                        height={12}
                        className="text-black/60"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Format: Days, Hours, Minutes, Seconds</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="inline-block text-2xl font-semibold">
                {activeSince.days}
                <span className="text-lg text-black/60">D</span>{' '}
                {String(activeSince.hours).padStart(2, '0')}
                <span className="text-lg text-black/60">H</span>{' '}
                {String(activeSince.minutes).padStart(2, '0')}
                <span className="text-lg text-black/60">M</span>{' '}
                {String(activeSince.seconds).padStart(2, '0')}
                <span className="text-lg text-black/60">S</span>
              </p>
            </div>
          )}

          {isOwner && !isDrained && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[#5E5E5E] font-medium uppercase">Withdrawal Lock</h3>
              {timeRemaining ? (
                <p
                  className={cn(
                    'inline-block text-xl font-semibold',
                    timeRemaining === 'Withdrawal Unlocked' ? 'text-green-600' : 'text-yellow-700'
                  )}
                >
                  {timeRemaining}
                </p>
              ) : (
                <div className="h-7 bg-gray-200 rounded w-40 animate-pulse"></div>
              )}
            </div>
          )}
        </div>
        <div className="border-t border-t-black/20"></div>

        <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
          <div className="flex flex-col gap-2">
            <h3 className="text-[#5E5E5E]  font-medium uppercase">Instructions</h3>
            <p
              ref={instructionsRef}
              className={cn(
                'text-xs font-medium blackspace-pre-wrap transition-all duration-300',
                !isExpanded && shouldTruncate && 'line-clamp-4'
              )}
            >
              {agent.system_prompt}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-400 hover:underline self-start"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 py-4">
          <div className="border-t border-t-black/20"></div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#5E5E5E]  font-medium uppercase">Total Participants</h3>
              <p className="inline-block text-2xl font-semibold text-center">{totalParticipants}</p>
            </div>
            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-[#5E5E5E]  font-medium uppercase">Break Attempts</h3>
              <p className="inline-block text-2xl font-semibold">{breakAttempts}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCopyLink}
          className="w-full bg-transparent border border-[#558EB4] text-[#558EB4] hover:bg-[#558EB4]/20 transition-colors duration-300 font-semibold flex items-center gap-2 mt-4"
        >
          Share {agent.agent_name} Link
          <LinkIcon className="w-4 h-4" />
        </Button>

        <div className="mt-6 pt-6 border-t border-black/20">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base text-black leading-tight">Earn SENTINEL Rewards</h3>
          </div>

          <p className="text-[#5E5E5E] text-base mb-4 leading-relaxed">
            Share your Sentinel on X and get real SENTINEL every time you share.
          </p>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn btn-black w-full h-[42px] flex items-center justify-center gap-2 text-base font-medium transition-transform active:scale-[0.98]"
          >
            Share on X & Earn SENTINEL
          </button>
        </div>

        <DefenderProfile
          ownerAddress={agent.owner}
          profile={defenderProfile}
          isLoading={isLoadingProfile}
        />

        <div className="mt-auto pt-6 border-t border-black/20">
          <h3 className="text-black/80 text-sm font-semibold text-center mb-4">
            Scan this QR Code if you want to try to attack this agent using slush mobile wallet
          </h3>
          <div className="rounded-xl p-4 border border-gray-200 flex justify-center">
            {deepLinkUrl ? (
              <QRCodeSVG
                value={deepLinkUrl}
                size={128}
                bgColor="#ffffff00"
                fgColor="#000000"
                level="L"
                includeMargin={true}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-300 rounded-full animate-spin border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PrizePoolChartModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        data={prizePoolData?.history || []}
        agentName={agent.agent_name}
      />

      <Dialog
        open={isShareModalOpen}
        onClose={handleCloseShareModal}
      >
        <div className="bg-white rounded-2xl w-full text-black">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/dollar_coin.png"
                width={24}
                height={24}
                alt="dollar coin"
              />
              <h2 className="text-xl font-bold">Share on X & Earn SENTINEL</h2>
            </div>
            <button
              onClick={handleCloseShareModal}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black mb-2">Submission Received!</h3>
                <p className="text-gray-600 max-w-xs mx-auto">
                  Once verified SENTINEL Points will be reflected in your profile.
                </p>
              </div>
              <button
                onClick={handleCloseShareModal}
                className="btn btn-black w-full mt-4"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <p className="text-sm mb-1">Step 1</p>
                <p className="font-medium mb-3">Share about Sentinel on X and earn SENTINEL rewards.</p>
                <button
                  onClick={handleShareClick}
                  className="btn btn-white w-full sm:w-auto h-[36px] flex items-center gap-2 px-4 !border-black"
                >
                  <Image
                    src="/icons/share.png"
                    width={24}
                    height={24}
                    alt="share"
                  />
                  Share on X
                </button>
              </div>

              <div className="border-t border-[#9A9A9A]"></div>

              <div className="relative">
                <p className="text-sm mb-1">Step 2</p>
                <p className="font-medium text-base mb-3">Paste Your Tweet Link for Verification</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={tweetLink}
                    onChange={(e) => setTweetLink(e.target.value)}
                    placeholder="https://x.com/username/status/..."
                    className="flex-1 bg-white border border-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    onClick={handleVerifyTweet}
                    disabled={isVerifying}
                    className="btn btn-black h-[36px] px-6 text-base font-normal whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Tweet'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}

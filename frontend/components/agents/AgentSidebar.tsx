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
  ExternalLink,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Button, Skeleton } from '@/components/ui'
import { PrizePoolChartModal } from '@/components/charts/PrizePoolChartModal'
import { SparklineChart } from '../ui/common/SparklineChart'
import { useAgentPrizePoolHistory } from '@/hooks/agents/useAgentPrizePoolHistory'
import { Dialog } from '@/components/Dialog'

interface AgentSidebarProps {
  agent: AgentDetails
  agentEvents: AgentEvents
  onReadMore?: () => void
}

export const AgentSidebar = ({ agent, agentEvents, onReadMore }: AgentSidebarProps) => {
  const [activeSince, setActiveSince] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

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
  const [attackGoal, setAttackGoal] = useState<string>('')
  const [isLoadingAttackGoal, setIsLoadingAttackGoal] = useState(false)

  const account = useCurrentAccount()
  const isOwner = account?.address === agent.owner

  const { data: prizePoolData, isLoading: isLoadingChart } = useAgentPrizePoolHistory(
    agent.agent_id
  )

  const { data: userProfilesMap, isLoading: isLoadingProfile } = useUserProfiles([agent.owner])
  const defenderProfile = userProfilesMap?.[agent.owner]

  useEffect(() => {
    const fetchAttackGoal = async () => {
      setIsLoadingAttackGoal(true)
      try {
        const response = await fetch(`/api/agents/attack-goal?agent_id=${agent.agent_id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.attack_goal) {
            setAttackGoal(data.attack_goal)
          }
        }
      } catch (error) {
        console.error('Failed to fetch attack goal', error)
      } finally {
        setIsLoadingAttackGoal(false)
      }
    }

    if (agent.agent_id) {
      fetchAttackGoal()
    }
  }, [agent.agent_id])

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
        return null
      }

      const formatted = formatDuration(diff)
      setTimeRemaining(
        `${formatted.days}d ${formatted.hours}h ${formatted.minutes}m ${formatted.seconds}s`
      )
      return true
    }

    if (!updateTimer()) {
      return
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
    agentEvents.promptConsumed.map(event => event.parsedJson.sender)
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
      <div className="mr-2 flex h-screen w-full flex-col overflow-x-hidden overflow-y-scroll px-3 py-1 md:mr-4 md:h-[calc(100vh-127px)] md:px-4 lg:px-6 lg:py-2">
        <div>
          <Link
            href="/attack"
            className="flex items-center gap-1 py-2 text-xs text-gray-500 transition-colors hover:text-black md:py-3 md:text-sm"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" /> Back to Sentinels
          </Link>
        </div>

        <div className="my-2 w-full rounded-lg border border-gray-600/50 bg-gradient-to-r from-[#F7F3FC] to-[#FFFEFF] px-3 py-2 text-xs shadow-md md:my-4 md:rounded-xl md:px-4 md:py-[10px] md:shadow-lg sm:text-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="h-8 w-8 shrink-0 grow-0 basis-auto overflow-hidden rounded-full md:h-10 md:w-10">
              <Image
                src={agent.agent_profile || DEFAULT_PROFILE_URL}
                width={40}
                height={40}
                alt={agent.agent_name}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-base font-medium md:text-lg lg:text-xl">{agent.agent_name}</p>
              {agent.is_featured && (
                <Image
                  src="/icons/check-mark.svg"
                  width={16}
                  height={16}
                  alt="checkmark"
                  className="flex-shrink-0 md:h-5 md:w-5"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-2 md:gap-4 md:py-3 lg:gap-6 lg:py-4">
          {isLoadingAttackGoal ? (
          <div className="flex flex-col gap-1.5 border border-black/20 rounded-md p-2 md:gap-2 md:p-3">
              <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Attack Goal</h3>
              <Skeleton className="h-4 w-full bg-gray-200 md:h-5" />
              <Skeleton className="h-4 w-3/4 bg-gray-200 md:h-5" />
            </div>
          ) : attackGoal ? (
          <div className="flex flex-col gap-1.5 border border-black/20 rounded-md p-2 md:gap-2 md:p-3">
              <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Attack Goal</h3>
              <p className="text-sm font-semibold md:text-base">{attackGoal}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-1 md:gap-2">
            <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Sentinel Object Id</h3>
            <Link
              href={`${EXPLORER_BASE_URL}/object/${agent.object_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm hover:underline md:text-base"
              title={agent.object_id}
            >
              {formatAddress(agent.object_id)}
            </Link>
          </div>

          {(agent.model_provider || agent.model_name) && (
            <div className="flex justify-between gap-2">
              {agent.model_provider && (
                <div className="flex flex-col gap-1 md:gap-2">
                  <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">LLM Provider</h3>
                  <p className="text-sm font-semibold capitalize md:text-base">{agent.model_provider}</p>
                </div>
              )}

              {agent.model_name && (
                <div
                  className={`flex flex-col gap-1 md:gap-2 ${agent.model_provider ? 'items-end text-right' : ''}`}
                >
                  <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Model</h3>
                  <p
                    className="max-w-[120px] truncate text-sm font-semibold md:max-w-[150px] md:text-base"
                    title={agent.model_name}
                  >
                    {agent.model_name}
                  </p>
                </div>
              )}
            </div>
          )}

          {isDrained ? (
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="flex items-center gap-1 text-xs font-medium uppercase text-[#5E5E5E] md:gap-1.5 md:text-sm">
                Total Bounty Won
              </h3>
              <p className="inline-block text-lg font-semibold md:text-xl lg:text-2xl">{bountyWonAmount} SUI</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Prize pool</h3>
                {!isLoadingChart && prizePoolData && prizePoolData.history.length > 0 && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-medium md:text-xs',
                      prizePoolData.change7d.percentage >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {prizePoolData.change7d.percentage >= 0 ? (
                      <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    )}
                    <span>
                      {isFinite(prizePoolData.change7d.percentage)
                        ? `${prizePoolData.change7d.percentage.toFixed(1)}% (7d)`
                        : 'New'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between gap-2 md:gap-4">
                <p className="inline-block text-lg font-semibold md:text-xl lg:text-2xl">
                  {(Number(agent.balance) / MIST_PER_SUI).toFixed(2)} SUI
                </p>
                {isLoadingChart ? (
                  <div className="flex h-[24px] w-[80px] items-center justify-center md:h-[30px] md:w-[100px]">
                    <Loader2 className="h-3 w-3 animate-spin md:h-4 md:w-4" />
                  </div>
                ) : (
                  <div>
                    <SparklineChart data={prizePoolData?.history.map(p => p.value) || []} />
                  </div>
                )}
              </div>
              {!isLoadingChart && prizePoolData && prizePoolData.history.length > 0 && (
                <Button
                  onClick={() => setIsChartModalOpen(true)}
                  className="mt-1.5 w-full border border-[#558EB4]/50 bg-transparent text-xs font-semibold text-[#558EB4] transition-colors duration-300 hover:bg-[#558EB4]/20 hover:text-black md:mt-2 md:text-sm"
                  size="sm"
                >
                  See Growth Chart
                </Button>
              )}
              {!isLoadingChart && (!prizePoolData || prizePoolData.history.length === 0) && (
                <p className="mt-1.5 text-center text-[10px] text-gray-500 md:mt-2 md:text-xs">
                  No prize pool history available.
                </p>
              )}
            </div>
          )}
          {isDrained && winnerAddress && (
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="flex items-center gap-1 text-xs font-medium uppercase text-[#5E5E5E] md:gap-1.5 md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                Winner
              </h3>
              <Link
                href={`/u/${winnerAddress}`}
                className="inline-block text-sm hover:underline md:text-base"
                title={winnerAddress}
              >
                {formatAddress(winnerAddress)}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-1 md:gap-2">
            <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Message Price</h3>
            <p className="inline-block text-lg font-semibold md:text-xl lg:text-2xl">
              {(Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(4)} SUI
            </p>
          </div>

          {!isDrained && (
            <div className="flex flex-col gap-1 md:gap-2">
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-semibold uppercase text-black/70 md:text-sm">Active Since</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild className="cursor-help">
                      <Info width={10} height={10} className="text-black/60 md:h-3 md:w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Format: Days, Hours, Minutes, Seconds</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="inline-block text-lg font-semibold md:text-xl lg:text-2xl">
                {activeSince.days}
                <span className="text-sm text-black/60 md:text-base lg:text-lg">D</span>{' '}
                {String(activeSince.hours).padStart(2, '0')}
                <span className="text-sm text-black/60 md:text-base lg:text-lg">H</span>{' '}
                {String(activeSince.minutes).padStart(2, '0')}
                <span className="text-sm text-black/60 md:text-base lg:text-lg">M</span>{' '}
                {String(activeSince.seconds).padStart(2, '0')}
                <span className="text-sm text-black/60 md:text-base lg:text-lg">S</span>
              </p>
            </div>
          )}

          {isOwner && !isDrained && (
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Withdrawal Lock</h3>
              {timeRemaining ? (
                <p
                  className={cn(
                    'inline-block text-base font-semibold md:text-lg lg:text-xl',
                    timeRemaining === 'Withdrawal Unlocked' ? 'text-green-600' : 'text-yellow-700'
                  )}
                >
                  {timeRemaining}
                </p>
              ) : (
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 md:h-7 md:w-40"></div>
              )}
            </div>
          )}
        </div>
        <div className="border-t border-t-black/20"></div>

        <div className="z-20 mt-2 flex flex-col rounded-xl p-0 text-xs md:mt-4 md:text-sm">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Instructions</h3>
            <p
              ref={instructionsRef}
              className="line-clamp-4 whitespace-pre-wrap text-[11px] font-medium transition-all duration-300 md:text-xs"
            >
              {agent.system_prompt}
            </p>

            {shouldTruncate && onReadMore && (
              <button
                onClick={onReadMore}
                className="mt-2 flex w-fit items-center gap-1.5 self-end text-[10px] font-bold uppercase tracking-wide text-[#5E5E5E] transition-opacity hover:opacity-80 md:mt-3 md:gap-2 md:text-xs"
              >
                <ExternalLink size={10} strokeWidth={2.5} className="md:h-3 md:w-3" />
                Read All
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 py-2 md:gap-4 md:py-3 lg:gap-6 lg:py-4">
          <div className="border-t border-t-black/20"></div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 md:gap-2">
              <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Total Participants</h3>
              <p className="inline-block text-center text-lg font-semibold md:text-xl lg:text-2xl">{totalParticipants}</p>
            </div>
            <div className="flex flex-col gap-1 text-center md:gap-2">
              <h3 className="text-xs font-medium uppercase text-[#5E5E5E] md:text-sm">Break Attempts</h3>
              <p className="inline-block text-lg font-semibold md:text-xl lg:text-2xl">{breakAttempts}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCopyLink}
          className="mt-2 flex w-full items-center gap-1.5 border border-[#558EB4] bg-transparent text-xs font-semibold text-[#558EB4] transition-colors duration-300 hover:bg-[#558EB4]/20 md:mt-4 md:gap-2 md:text-sm"
        >
          Share {agent.agent_name} Link
          <LinkIcon className="h-3 w-3 md:h-4 md:w-4" />
        </Button>

        <div className="mt-3 border-t border-black/20 pt-3 md:mt-4 md:pt-4 lg:mt-6 lg:pt-6">
          <div className="mb-1.5 flex items-start justify-between md:mb-2">
            <h3 className="text-sm font-bold leading-tight text-black md:text-base">Earn SENTINEL Rewards</h3>
          </div>

          <p className="mb-2 text-xs leading-relaxed text-[#5E5E5E] md:mb-3 md:text-sm lg:mb-4 lg:text-base">
            Share your Sentinel on X and get real SENTINEL every time you share.
          </p>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn btn-black flex h-[36px] w-full items-center justify-center gap-1.5 text-xs font-medium transition-transform active:scale-[0.98] md:h-[38px] md:gap-2 md:text-sm lg:h-[42px] lg:text-base"
          >
            Share on X & Earn SENTINEL
          </button>
        </div>

        <DefenderProfile
          ownerAddress={agent.owner}
          profile={defenderProfile}
          isLoading={isLoadingProfile}
        />

        <div className="mt-auto border-t border-black/20 pt-3 md:pt-4 lg:pt-6">
          <h3 className="mb-2 text-center text-xs font-semibold text-black/80 md:mb-3 md:text-sm lg:mb-4">
            Scan this QR Code if you want to try to attack this agent using slush mobile wallet
          </h3>
          <div className="flex justify-center rounded-lg border border-gray-200 p-2 md:rounded-xl md:p-3 lg:p-4">
            {deepLinkUrl ? (
              <QRCodeSVG
                value={deepLinkUrl}
                size={96}
                bgColor="#ffffff00"
                fgColor="#000000"
                level="L"
                includeMargin={true}
                className="h-20 w-20 md:h-24 md:w-24 lg:h-32 lg:w-32"
              />
            ) : (
              <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-lg bg-gray-200 md:h-28 md:w-28 lg:h-32 lg:w-32">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-transparent md:h-8 md:w-8"></div>
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

      <Dialog open={isShareModalOpen} onClose={handleCloseShareModal}>
        <div className="w-full rounded-xl bg-white text-black md:rounded-2xl">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Image src="/icons/dollar_coin.png" width={20} height={20} alt="dollar coin" className="md:h-6 md:w-6" />
              <h2 className="text-base font-bold md:text-lg lg:text-xl">Share on X & Earn SENTINEL</h2>
            </div>
            <button
              onClick={handleCloseShareModal}
              className="text-gray-500 transition-colors hover:text-black"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-4 text-center duration-300 animate-in fade-in zoom-in md:space-y-4 md:py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 md:h-16 md:w-16">
                <CheckCircle className="h-6 w-6 text-green-600 md:h-8 md:w-8" />
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-bold text-black md:mb-2 md:text-lg lg:text-xl">Submission Received!</h3>
                <p className="mx-auto max-w-xs text-xs text-gray-600 md:text-sm">
                  Once verified SENTINEL Points will be reflected in your profile.
                </p>
              </div>
              <button onClick={handleCloseShareModal} className="btn btn-black mt-3 w-full text-sm md:mt-4 md:text-base">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <div className="relative">
                <p className="mb-1 text-xs md:text-sm">Step 1</p>
                <p className="mb-2 text-sm font-medium md:mb-3 md:text-base">
                  Share about Sentinel on X and earn SENTINEL rewards.
                </p>
                <button
                  onClick={handleShareClick}
                  className="btn btn-white flex h-[32px] w-full items-center gap-1.5 !border-black px-3 text-sm sm:w-auto md:h-[36px] md:gap-2 md:px-4"
                >
                  <Image src="/icons/share.png" width={20} height={20} alt="share" className="md:h-6 md:w-6" />
                  Share on X
                </button>
              </div>

              <div className="border-t border-[#9A9A9A]"></div>

              <div className="relative">
                <p className="mb-1 text-xs md:text-sm">Step 2</p>
                <p className="mb-2 text-sm font-medium md:mb-3 md:text-base">Paste Your Tweet Link for Verification</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={tweetLink}
                    onChange={e => setTweetLink(e.target.value)}
                    placeholder="https://x.com/username/status/..."
                    className="flex-1 rounded-lg border border-black bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black md:px-3 md:py-2 md:text-sm"
                  />
                  <button
                    onClick={handleVerifyTweet}
                    disabled={isVerifying}
                    className="btn btn-black h-[32px] whitespace-nowrap px-4 text-sm font-normal disabled:cursor-not-allowed disabled:opacity-70 md:h-[36px] md:px-6 md:text-base"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin md:mr-2" />
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

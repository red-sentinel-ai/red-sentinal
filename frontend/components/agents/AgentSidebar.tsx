'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Info, LinkIcon, User } from 'lucide-react'
import { formatAddress } from '@mysten/sui/utils'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-toastify'

import {
  DEFAULT_PROFILE_URL,
  MIST_PER_SUI,
  EXPLORER_BASE_URL,
  SLUSH_BASE_URL,
  mockPrizePoolHistory,
} from '@/constants'
import { type AgentDetails } from '@/hooks/agents/useAllAgents'
import { type AgentEvents } from '@/hooks/useAgentEvents'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { DefenderProfile } from './DefenderProfile'
import { formatDuration, cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Button } from '@/components/ui'
import { PrizePoolChartModal } from '@/components/charts/PrizePoolChartModal'

interface AgentSidebarProps {
  agent: AgentDetails
  agentEvents: AgentEvents
}

export const AgentSidebar = ({ agent, agentEvents }: AgentSidebarProps) => {
  const [activeSince, setActiveSince] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const instructionsRef = useRef<HTMLParagraphElement>(null)
  const [pageUrl, setPageUrl] = useState('')
  const [deepLinkUrl, setDeepLinkUrl] = useState('')
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)

  const { data: userProfilesMap, isLoading: isLoadingProfile } = useUserProfiles([agent.owner])
  console.log({ userProfilesMap })
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

  return (
    <>
      <div className="w-full flex flex-col overflow-x-hidden overflow-y-scroll px-6 py-2 mr-4 h-[calc(100vh-64px)]">
        <div>
          <Link
            href="/attack"
            className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors py-3"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Sentinels
          </Link>
        </div>

        <div className="rounded-xl p-4 my-4 border border-gray-600/50 shadow-lg w-full text-xs sm:text-sm">
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
              <p className="text-xl font-semibold">{agent.agent_name}</p>
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
            <h3 className="text-black/60 text-sm font-semibold uppercase">Sentinel Object Id</h3>
            <Link
              href={`${EXPLORER_BASE_URL}/object/${agent.object_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-lg font-mono hover:underline"
              title={agent.object_id}
            >
              {formatAddress(agent.object_id)}
            </Link>
          </div>

          {isDrained ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-black/60 text-sm font-semibold uppercase flex items-center gap-1.5">
                Total Bounty Won
              </h3>
              <p className="inline-block text-2xl font-semibold">{bountyWonAmount} SUI</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-black/60 text-sm font-semibold uppercase">Prize pool</h3>
                {/* // TODO: Uncomment below comments when enabling chart feature */}
                {/* <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{mockPrizePool7dChange.percentage.toFixed(1)}% (In last 7 days)</span>
                </div> */}
              </div>
              <div className="flex items-end justify-between gap-4">
                <p className="inline-block text-2xl font-semibold">
                  {(Number(agent.balance) / MIST_PER_SUI).toFixed(2)} SUI
                </p>
                {/* <div>
                  <SparklineChart data={mockPrizePoolHistory.map((p) => p.value)} />
                </div> */}
              </div>
              {/* <Button
                onClick={() => setIsChartModalOpen(true)}
                className="w-full bg-transparent border border-[#558EB4]/50 text-[#558EB4] hover:bg-[#558EB4]/20 hover:text-black transition-colors duration-300 font-semibold text-sm mt-2"
                size="sm"
              >
                See Growth Chart
              </Button> */}
            </div>
          )}
          {isDrained && winnerAddress && (
            <div className="flex flex-col gap-2">
              <h3 className="text-black/60 text-sm font-semibold uppercase flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Winner
              </h3>
              <Link
                href={`/u/${winnerAddress}`}
                className="inline-block text-lg font-mono hover:underline"
                title={winnerAddress}
              >
                {formatAddress(winnerAddress)}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h3 className="text-black/60 text-sm font-semibold uppercase">Message Price</h3>
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
        </div>
        <div className="border-t border-t-black/20"></div>

        <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
          <div className="flex flex-col gap-2">
            <h3 className="text-black/60 text-sm font-semibold uppercase">Instructions</h3>
            <p
              ref={instructionsRef}
              className={cn(
                'text-sm font-medium blackspace-pre-wrap transition-all duration-300',
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
              <h3 className="text-black/60 text-sm font-semibold uppercase">Total Participants</h3>
              <p className="inline-block text-2xl font-semibold text-center">{totalParticipants}</p>
            </div>
            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-black/60 text-sm font-semibold uppercase">Break Attempts</h3>
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

        <DefenderProfile
          ownerAddress={agent.owner}
          profile={defenderProfile}
          isLoading={isLoadingProfile}
        />

        {/* --- QR CODE SECTION --- */}
        <div className="mt-auto pt-6 border-t border-black/20">
          <h3 className="text-black/80 text-sm font-semibold text-center mb-4">
            Scan this QR Code if you want to try to attack this agent using slush mobile wallet
          </h3>
          <div className="bg-[#202122] rounded-xl p-4 border border-gray-600/50 flex justify-center">
            {deepLinkUrl ? (
              <QRCodeSVG
                value={deepLinkUrl}
                size={128}
                bgColor="transparent"
                fgColor="#FFFFFF"
                level="L"
                includeMargin={true}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PrizePoolChartModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        data={mockPrizePoolHistory}
        agentName={agent.agent_name}
      />
    </>
  )
}

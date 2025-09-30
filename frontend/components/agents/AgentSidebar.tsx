'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Info } from 'lucide-react'

import { DEFAULT_PROFILE_URL, MIST_PER_SUI } from '@/constants'
import { type AgentDetails } from '@/hooks/agents/useAllAgents'
import { type AgentEvents } from '@/hooks/useAgentEvents'
import { formatDuration, cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AgentSidebarProps {
  agent: AgentDetails
  agentEvents: AgentEvents
}

export const AgentSidebar = ({ agent, agentEvents }: AgentSidebarProps) => {
  const [activeSince, setActiveSince] = useState('0:00:00:00')
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const instructionsRef = useRef<HTMLParagraphElement>(null)

  const isDrained = agentEvents.agentDefeated.length > 0
  const bountyWonEvent = isDrained ? agentEvents.agentDefeated[0] : null
  const bountyWonAmount = bountyWonEvent
    ? (Number(bountyWonEvent.parsedJson.amount_won) / MIST_PER_SUI).toFixed(2)
    : '0.00'

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

  return (
    <div className="w-full bg-[#101112] flex-col overflow-x-hidden overflow-y-scroll px-6 py-2 mr-4 h-[calc(100vh-64px)]">
      <div>
        <Link
          href="/attack"
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors py-3"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Sentinels
        </Link>
      </div>

      <div className="bg-[#202122] rounded-xl p-4 my-4 border border-gray-600/50 shadow-lg w-full text-xs sm:text-sm">
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
        {isDrained ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-white/60 text-sm font-semibold uppercase flex items-center gap-1.5">
              Bounty Won
            </h3>
            <p className="inline-block text-2xl font-semibold">{bountyWonAmount} SUI</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h3 className="text-white/60 text-sm font-semibold uppercase">Prize pool</h3>
            <p className="inline-block text-2xl font-semibold">
              {(Number(agent.balance) / MIST_PER_SUI).toFixed(2)} SUI
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Sentinel ID</h3>
          <p className="inline-block text-2xl font-semibold">{agent.agent_id}</p>
        </div>

        {!isDrained && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <h3 className="text-white/70 text-sm font-semibold uppercase">Active Time</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    asChild
                    className="cursor-help"
                  >
                    <Info
                      width={12}
                      height={12}
                      className="text-white/60"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border border-gray-700 text-white">
                    <p>Format: D:H:M:S (Days:Hours:Minutes:Seconds)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="inline-block text-2xl font-semibold">{activeSince}</p>
          </div>
        )}
      </div>
      <div className="border-t border-t-white/20"></div>

      <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Instructions</h3>
          <p
            ref={instructionsRef}
            className={cn(
              'text-sm font-medium whitespace-pre-wrap transition-all duration-300',
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

      <div className="flex flex-col gap-6 py-4 mt-auto">
        <div className="border-t border-t-white/20"></div>
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Message Price</h3>
          <p className="inline-block text-2xl font-semibold">
            {(Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(4)} SUI
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Break Attempts</h3>
          <p className="inline-block text-2xl font-semibold">{breakAttempts}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Total Participants</h3>
          <p className="inline-block text-2xl font-semibold">{totalParticipants}</p>
        </div>
      </div>
    </div>
  )
}

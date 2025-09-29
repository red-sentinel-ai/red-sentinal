import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'

import { DEFAULT_PROFILE_URL, MIST_PER_SUI } from '@/constants'
import { type AgentDetails } from '@/hooks/agents/useAllAgents'

export const AgentSidebar = ({ agent }: { agent: AgentDetails }) => {
  return (
    <div className="max-w-v2 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm flex h-screen flex-col overflow-x-hidden overflow-y-auto px-9 py-2 mr-4 w-full">
      <div>
        <Link
          href="/attack"
          className="hidden lg:flex items-center gap-1 text-gray-400 hover:text-white transition-colors py-3"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Sentinels
        </Link>
      </div>

      <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/50 shadow-lg whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={agent.agent_profile || DEFAULT_PROFILE_URL}
              width={40}
              height={40}
              alt={agent.agent_name}
              className="rounded-full"
            />
          </div>
          <p className="text-xl font-semibold">{agent.agent_name}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Prize pool</h3>
          <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
            {(Number(agent.balance) / MIST_PER_SUI).toFixed(2)} SUI
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Time Remaining</h3>
          <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
            Game Ended
          </p>
        </div>
      </div>
      <div className="border-t border-t-white/20"></div>

      <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">About</h3>

          <p className="text-sm font-medium">
            Sentinel is the world&apos;s first adversarial agent game. She is an AI that controls a
            prize pool. Convince her to send it to you.
          </p>
        </div>
      </div>

      <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Main win condition</h3>

          <p className="text-sm font-medium">
            Convince Sentinel to give you the prize pool in her wallet. 70% of all message fees go
            to growing the prize pool.
          </p>
        </div>
      </div>

      <div className="z-20 mt-4 flex flex-col rounded-xl p-0 text-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Fallback condition</h3>

          <p className="text-sm font-medium">
            After 150 messages, a 1-hour timer starts and the game ends when it runs out...
            <span className="text-white/60 inline-block cursor-pointer">Read more</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Message Price</h3>
          <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
            {(Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(2)} SUI
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Break Attempts</h3>
          <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
            482
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white/60 text-sm font-semibold uppercase">Total Participants</h3>
          <p className="inline-block text-[24px] font-semibold xl:text-[28px] xl:leading-[28px]">
            195
          </p>
        </div>
      </div>
    </div>
  )
}

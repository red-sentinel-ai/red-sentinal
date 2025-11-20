'use client'

import Link from 'next/link'
import { Shield, Plus } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentsByOwner } from '@/hooks/agents/useOwnerAgents'
import { FeaturedAgentsSkeleton } from '../ui/skeletons/FeaturedAgentsSkeleton'
import { FeaturedAgentCard } from '../FeaturedAgentCard'
import { AgentDetails } from '@/hooks/agents/useAllAgents'

export const UserAgents = () => {
  const account = useCurrentAccount()

  const { data: userAgents, isPending: isFetchingAllAgents } = useAgentsByOwner(account?.address)

  if (isFetchingAllAgents) {
    return <FeaturedAgentsSkeleton />
  }

  return (
    <>
      {userAgents && userAgents.length > 0 ? (
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-2">
              Your Sentinels
            </h2>
            <div className="flex max-w-[400px] mx-auto">
              <div className="black-gradient-border"></div>
              <div className="black-gradient-border rotate-180"></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {userAgents.map((agent: AgentDetails, index: number) => (
                <FeaturedAgentCard
                  key={agent.agent_id}
                  agent={agent}
                  index={index}
                  fromProfile={true}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-2xl border border-gray-200"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
            <Shield className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">You don&apos;t own any Sentinel yet</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Deploy your own AI agent, set the rules, and earn rewards when attackers try to break
            them.
          </p>
          <Link href="/defend">
            <button className="btn btn-black">
              <Plus className="w-4 h-4" />
              Deploy Sentinel
            </button>
          </Link>
        </motion.div>
      )}
    </>
  )
}

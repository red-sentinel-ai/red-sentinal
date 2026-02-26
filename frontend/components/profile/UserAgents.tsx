'use client'

import Link from 'next/link'
import { Shield, Plus } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentsByOwner } from '@/hooks/agents/useOwnerAgents'
import { FeaturedAgentsSkeleton } from '../ui/skeletons/FeaturedAgentsSkeleton'
import { FeaturedAgentCard } from '../FeaturedAgentCard'

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
            <h2 className="mb-2 text-center text-2xl font-bold text-black md:text-3xl">
              Your Sentinels
            </h2>
            <div className="mx-auto flex max-w-[400px]">
              <div className="black-gradient-border"></div>
              <div className="black-gradient-border rotate-180"></div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {userAgents.map((agent, index) => (
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
          className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-16 text-center"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
            <Shield className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-black">You don&apos;t own any Sentinel yet</h3>
          <p className="mb-8 max-w-md text-gray-500">
            Deploy your own AI agent, set the rules, and earn rewards when attackers try to break
            them.
          </p>
          <Link href="/defend">
            <button className="btn btn-black">
              <Plus className="h-4 w-4" />
              Deploy Sentinel
            </button>
          </Link>
        </motion.div>
      )}
    </>
  )
}

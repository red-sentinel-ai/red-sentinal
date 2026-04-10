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
            <h2 className="jp-text-heading mb-2 text-center text-2xl font-bold md:text-3xl"
              style={{ color: 'var(--jp-black-color)' }}
            >
              Your Sentinels
            </h2>
            <div className="mx-auto flex max-w-[400px]">
              <div className="h-[1px] flex-1" style={{ background: 'linear-gradient(to right, transparent, var(--jp-dark-pink))' }}></div>
              <div className="h-[1px] flex-1" style={{ background: 'linear-gradient(to left, transparent, var(--jp-dark-pink))' }}></div>
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
          className="jp-card flex flex-col items-center justify-center rounded-2xl border px-4 py-16 text-center"
          style={{ backgroundColor: 'rgba(251, 231, 231, 0.5)', backdropFilter: 'blur(8px)', borderColor: 'var(--jp-dark-pink)' }}
        >
          <div className="jp-image-picker mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--jp-light-pink)' }}>
            <Shield className="h-10 w-10" style={{ color: 'var(--jp-orange-color)' }} />
          </div>
          <h3 className="mb-2 text-xl font-bold" style={{ color: 'var(--jp-black-color)' }}>You don&apos;t own any Sentinel yet</h3>
          <p className="mb-8 max-w-md" style={{ color: 'var(--jp-gray-color)' }}>
            Deploy your own AI agent, set the rules, and earn rewards when attackers try to break
            them.
          </p>
          <Link href="/defend">
            <button className="jp-btn-primary rounded-xl px-6 py-2 font-medium">
              <Plus className="mr-2 inline h-4 w-4" />
              Deploy Sentinel
            </button>
          </Link>
        </motion.div>
      )}
    </>
  )
}

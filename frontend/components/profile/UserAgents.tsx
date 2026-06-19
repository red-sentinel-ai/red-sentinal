'use client'

import Link from 'next/link'
import { Shield, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentsByOwner } from '@/hooks/agents/useOwnerAgents'
import { FeaturedAgentsSkeleton } from '../ui/skeletons/FeaturedAgentsSkeleton'
import { FeaturedAgentCard } from '../FeaturedAgentCard'

interface UserAgentsProps {
  address?: string
  isOwner: boolean
}

export const UserAgents = ({ address, isOwner }: UserAgentsProps) => {
  const { data: userAgents, isPending: isFetchingAgents } = useAgentsByOwner(address)

  if (isFetchingAgents) {
    return <FeaturedAgentsSkeleton />
  }

  if (userAgents && userAgents.length > 0) {
    return (
      <div className="mb-16">
        <div className="mb-4">
          <h2 className="text-base font-medium text-[var(--color-text-primary)]">
            {isOwner ? 'Your Sentinels' : 'Sentinels'}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
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
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-4 py-16 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <Shield className="h-5 w-5 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="mb-1.5 text-sm font-medium text-[var(--color-text-primary)]">No Sentinels yet</h3>
      {isOwner ? (
        <>
          <p className="mb-5 max-w-md text-xs text-[var(--color-text-muted)]">
            Deploy your own AI agent, set the rules, and earn rewards when attackers try to break
            them.
          </p>
          <Link href="/defend">
            <button className="btn bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]">
              <Plus className="h-4 w-4" />
              Deploy Sentinel
            </button>
          </Link>
        </>
      ) : (
        <p className="max-w-md text-xs text-[var(--color-text-muted)]">
          This operator has not deployed any Sentinels yet.
        </p>
      )}
    </motion.div>
  )
}

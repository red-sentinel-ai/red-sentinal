'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Shield, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentsByOwner } from '@/hooks/agents/useOwnerAgents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'
import { FeaturedAgentsSkeleton } from '../ui/skeletons/FeaturedAgentsSkeleton'
import { ProfileSentinelCard, type ClaimFeesTarget } from './ProfileSentinelCard'
import { ClaimFeesModal } from '../agents/ClaimFeesModal'

interface UserAgentsProps {
  address?: string
  isOwner: boolean
}

export const UserAgents = ({ address, isOwner }: UserAgentsProps) => {
  const { data: userAgents, isPending: isFetchingAgents } = useAgentsByOwner(address)
  const { openModal: openFundModal, Modal: FundModal } = useFundAgentModal()
  const { openModal: openWithdrawModal, Modal: WithdrawModal } = useWithdrawAgentModal()
  const { openModal: openFeatureModal, Modal: FeatureModal } = useFeatureAgentModal()
  const [claimFeesTarget, setClaimFeesTarget] = useState<ClaimFeesTarget | null>(null)

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
              <ProfileSentinelCard
                key={agent.agent_id}
                agent={agent}
                index={index}
                fromProfile={true}
                onFund={openFundModal}
                onWithdraw={openWithdrawModal}
                onFeature={openFeatureModal}
                onClaimFees={setClaimFeesTarget}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <FundModal />
        <WithdrawModal />
        <FeatureModal />
        <ClaimFeesModal
          open={!!claimFeesTarget}
          onClose={() => setClaimFeesTarget(null)}
          agentId={claimFeesTarget?.agentId ?? ''}
          agentObjectId={claimFeesTarget?.agentObjectId ?? ''}
          accumulatedFees={claimFeesTarget?.accumulatedFees ?? 0}
          coinType={claimFeesTarget?.coinType}
          chain={claimFeesTarget?.chain}
        />
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

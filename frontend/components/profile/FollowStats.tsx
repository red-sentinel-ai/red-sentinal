'use client'

import { useState } from 'react'
import { useFollowCounts } from '@/hooks/social/useFollowCounts'
import { FollowListModal } from './FollowListModal'

interface FollowStatsProps {
  /** Target user id (uuid) or username. */
  identifier: string
  className?: string
}

/**
 * Follower / following counts for a profile. Each count is clickable and opens
 * the tabbed connections modal on the matching tab.
 */
export function FollowStats({ identifier, className }: FollowStatsProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'followers' | 'following'>('followers')
  const { data } = useFollowCounts(identifier)

  const openOn = (next: 'followers' | 'following') => {
    setTab(next)
    setOpen(true)
  }

  return (
    <>
      <div className={className}>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => openOn('followers')}
            className="group flex flex-col gap-0.5 text-left"
          >
            <span className="font-mono text-xl font-bold leading-none text-[var(--color-text-primary)]">
              {data?.followers ?? 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-secondary)]">
              Followers
            </span>
          </button>

          <button
            type="button"
            onClick={() => openOn('following')}
            className="group flex flex-col gap-0.5 text-left"
          >
            <span className="font-mono text-xl font-bold leading-none text-[var(--color-text-primary)]">
              {data?.following ?? 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-secondary)]">
              Following
            </span>
          </button>
        </div>
      </div>

      <FollowListModal
        identifier={identifier}
        open={open}
        onClose={() => setOpen(false)}
        initialTab={tab}
      />
    </>
  )
}

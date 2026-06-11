'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useFollowCounts } from '@/hooks/social/useFollowCounts'
import { useFollowMutation, useUnfollowMutation } from '@/hooks/social/useFollowMutation'

interface FollowButtonProps {
  /** The user being followed (ss_users.id). */
  targetUserId: string
  /** Seed the follow state instead of fetching it (used in list rows). */
  seeded?: boolean
  initialIsFollowing?: boolean
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Follow / Unfollow toggle. Hidden when logged out or viewing your own profile.
 * In the profile header it self-fetches the viewer relationship; inside lists it
 * is `seeded` with the row's `is_following` to avoid one request per row.
 */
export function FollowButton({
  targetUserId,
  seeded = false,
  initialIsFollowing = false,
  size = 'default',
  className,
}: FollowButtonProps) {
  const { user } = useAuth()
  const viewerId = user?.id
  const canInteract = Boolean(viewerId) && viewerId !== targetUserId

  const { data: counts } = useFollowCounts(targetUserId, {
    enabled: !seeded && canInteract,
  })

  const follow = useFollowMutation()
  const unfollow = useUnfollowMutation()
  const [optimistic, setOptimistic] = useState<boolean | null>(null)

  const serverIsFollowing = seeded
    ? initialIsFollowing
    : Boolean(counts?.viewer_is_following)
  const isFollowing = optimistic !== null ? optimistic : serverIsFollowing
  const isPending = follow.isPending || unfollow.isPending

  if (!canInteract) return null

  const handleClick = () => {
    const next = !isFollowing
    setOptimistic(next)
    const mutation = next ? follow : unfollow
    // Keep the optimistic value as the source of truth — it converges with the
    // server (counts are invalidated on success). Only revert if the call fails.
    mutation.mutate(targetUserId, {
      onError: () => setOptimistic(null),
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'group inline-flex items-center justify-center gap-2 whitespace-nowrap border font-bold uppercase tracking-[2px] transition-colors disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-[9px]' : 'px-5 py-2 text-[11px]',
        isFollowing
          ? 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-error)] hover:text-[var(--color-error)]'
          : 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90',
        className
      )}
    >
      {isPending ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      ) : isFollowing ? (
        <>
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        'Follow'
      )}
    </button>
  )
}

'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSentinelFollow } from '@/hooks/agents/useSentinelFollow'

interface SentinelFollowButtonProps {
  agentId: string
  chain: string
  network: string
  className?: string
}

/**
 * Follow / unfollow a sentinel. Following subscribes you to its notifications.
 * Hidden when logged out.
 */
export function SentinelFollowButton({ agentId, chain, network, className }: SentinelFollowButtonProps) {
  const { canFollow, isFollowing, isPending, toggle } = useSentinelFollow({ agentId, chain, network })

  if (!canFollow) return null

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        'group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap border px-4 py-2 text-[11px] font-bold uppercase tracking-[2px] transition-colors disabled:opacity-50',
        isFollowing
          ? 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-error)] hover:text-[var(--color-error)]'
          : 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-bg-base)] hover:opacity-90',
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <Bell className="h-3.5 w-3.5 group-hover:hidden" />
          <BellOff className="hidden h-3.5 w-3.5 group-hover:inline" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        <>
          <Bell className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </button>
  )
}

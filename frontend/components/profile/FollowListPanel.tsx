'use client'

import { Loader2 } from 'lucide-react'
import { useFollowers, useFollowing } from '@/hooks/social/useFollowers'
import { FollowListRow } from './FollowListRow'

interface FollowListPanelProps {
  /** Target user id (uuid) or username. */
  identifier: string
  direction: 'followers' | 'following'
  onNavigate?: () => void
}

/**
 * Infinite-scrolling list of followers or following for a user. Only the active
 * tab's panel is mounted (radix unmounts inactive tabs), so the inactive hook is
 * disabled via an undefined identifier.
 */
export function FollowListPanel({ identifier, direction, onNavigate }: FollowListPanelProps) {
  const followersQuery = useFollowers(direction === 'followers' ? identifier : undefined)
  const followingQuery = useFollowing(direction === 'following' ? identifier : undefined)
  const query = direction === 'followers' ? followersQuery : followingQuery

  const users = query.data?.pages.flatMap(page => page.users) ?? []

  if (query.isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-[var(--color-text-muted)]">
        {direction === 'followers'
          ? 'No followers yet.'
          : 'Not following anyone yet.'}
      </div>
    )
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {users.map(user => (
          <FollowListRow key={user.user_id} user={user} onNavigate={onNavigate} />
        ))}
      </div>

      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="mt-2 flex w-full items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-50"
        >
          {query.isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Load more
        </button>
      )}
    </div>
  )
}

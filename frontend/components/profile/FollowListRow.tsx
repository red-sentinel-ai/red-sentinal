'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import type { FollowListUser } from '@/lib/auth-api'
import { FollowButton } from './FollowButton'

interface FollowListRowProps {
  user: FollowListUser
  onNavigate?: () => void
}

/**
 * A single row in the followers / following list: avatar + name linking to the
 * user's public profile, with an inline Follow button for follow-back.
 */
export function FollowListRow({ user, onNavigate }: FollowListRowProps) {
  const fallbackWallet = user.wallet_addresses[0]
  const handle = user.username || fallbackWallet
  const primaryName =
    user.display_name || user.username || (fallbackWallet ? truncateAddress(fallbackWallet) : 'Operator')

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Link
        href={handle ? `/u/${handle}` : '#'}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[var(--color-border-subtle)]">
          {user.avatar_url ? (
            <Image src={user.avatar_url} alt={primaryName} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-subtle)]">
              <User className="h-5 w-5 text-[var(--color-text-faint)]" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">
            {primaryName}
          </p>
          {user.username && (
            <p className="truncate text-xs text-[var(--color-text-muted)]">@{user.username}</p>
          )}
        </div>
      </Link>

      <FollowButton
        targetUserId={user.user_id}
        seeded
        initialIsFollowing={user.is_following}
        size="sm"
      />
    </div>
  )
}

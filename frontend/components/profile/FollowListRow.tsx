'use client'

import Image from 'next/image'
import Link from 'next/link'
import { truncateAddress, generateAvatarUrl } from '@/lib/utils'
import type { FollowListUser } from '@/lib/auth-api'
import { UserFollowButton } from './UserFollowButton'

interface FollowListRowProps {
  user: FollowListUser
  onNavigate?: () => void
}

export function FollowListRow({ user, onNavigate }: FollowListRowProps) {
  const fallbackWallet = user.wallet_addresses[0]
  const handle = user.username || fallbackWallet
  const primaryName =
    user.display_name || user.username || (fallbackWallet ? truncateAddress(fallbackWallet) : 'Operator')
  const avatarUrl = user.avatar_url || generateAvatarUrl(fallbackWallet || user.user_id)

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Link
        href={handle ? `/u/${handle}` : '#'}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[var(--color-border-subtle)]">
          <Image src={avatarUrl} alt={primaryName} fill className="object-cover" />
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

      <UserFollowButton
        targetUserId={user.user_id}
        seeded
        initialIsFollowing={user.is_following}
        size="sm"
      />
    </div>
  )
}

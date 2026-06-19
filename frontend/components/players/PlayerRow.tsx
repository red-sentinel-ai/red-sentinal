'use client'

import Image from 'next/image'
import Link from 'next/link'

import { truncateAddress, generateAvatarUrl } from '@/lib/utils'
import { FollowButton } from '@/components/profile/FollowButton'
import type { PlayerEntry } from '@/hooks/players/usePlayerDirectory'
import { PLAYER_STAT_COLUMNS } from './playerColumns'

interface PlayerRowProps {
  player: PlayerEntry
  onFollowToggle: (userId: string, nowFollowing: boolean) => void
}

export function PlayerRow({ player, onFollowToggle }: PlayerRowProps) {
  const fallbackWallet = player.wallet_address || ''
  const handle = player.username || fallbackWallet
  const primaryName =
    player.display_name ||
    player.username ||
    (fallbackWallet ? truncateAddress(fallbackWallet) : 'Operator')
  const avatarUrl =
    player.avatar_url || generateAvatarUrl(fallbackWallet || player.user_id)
  const profileHref = handle ? `/u/${handle}` : '#'

  return (
    <div className="player-directory-grid border-b border-[var(--color-border-subtle)] px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)]">
      <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums">
        {player.rank}
      </span>

      <Link href={profileHref} className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[var(--color-border-subtle)]">
          <Image src={avatarUrl} alt={primaryName} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">
            {primaryName}
          </p>
          {player.username && (
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              @{player.username}
            </p>
          )}
          <p className="mt-1 truncate text-[11px] text-[var(--color-text-muted)] md:hidden">
            {PLAYER_STAT_COLUMNS.map(col => `${col.value(player)} ${col.label}`).join(' · ')}
          </p>
        </div>
      </Link>

      {PLAYER_STAT_COLUMNS.map(col => (
        <span
          key={col.key}
          className="hidden text-sm font-bold text-[var(--color-text-secondary)] tabular-nums md:block"
        >
          {col.value(player)}
        </span>
      ))}

      <div className="flex justify-end">
        <FollowButton
          targetUserId={player.user_id}
          seeded
          initialIsFollowing={player.is_following}
          size="sm"
          onToggle={nowFollowing => onFollowToggle(player.user_id, nowFollowing)}
        />
      </div>
    </div>
  )
}

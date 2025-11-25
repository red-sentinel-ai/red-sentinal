'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, Wallet } from 'lucide-react'
import { formatAddress } from '@mysten/sui/utils'
import type { LeaderboardEntry } from '@/types/Rewards'
import { EXPLORER_BASE_URL } from '@/constants'

const buildTwitterLink = (username: string): string => {
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  return `https://twitter.com/${cleanUsername}`
}

const buildDiscordLink = (userId: string): string => {
  return `https://discord.com/users/${userId}`
}

interface UserDisplayProps {
  entry: LeaderboardEntry
}

export const UserDisplay = ({ entry }: UserDisplayProps) => {
  const hasTwitter = entry.twitter_username && entry.twitter_user_id
  const hasDiscord = entry.discord_username && entry.discord_user_id
  const avatar = entry.avatar_url || entry.twitter_avatar || entry.discord_avatar
  const primaryWallet = entry.wallet_addresses?.[0]

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <Link
        href={entry.username ? `/u/${entry.username}` : '#'}
        className={!entry.username ? 'pointer-events-none' : ''}
      >
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 bg-gray-100 border border-gray-200">
          {avatar ? (
            <Image
              src={avatar}
              alt={entry.username || 'User Avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 min-w-0">
        {entry.username ? (
          <Link
            href={`/u/${entry.username}`}
            className="text-sm sm:text-base font-semibold text-black truncate hover:underline"
          >
            {entry.username}
          </Link>
        ) : (
          <p className="text-sm sm:text-base font-medium text-gray-600 truncate">
            User #{entry.user_id?.slice(-6)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {primaryWallet && (
            <Link
              href={`${EXPLORER_BASE_URL}/address/${primaryWallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-black transition-colors hover:underline flex-shrink-0"
            >
              <Wallet className="w-3 h-3 opacity-70" />
              <span className="font-mono">{formatAddress(primaryWallet)}</span>
            </Link>
          )}
          {hasTwitter && (
            <a
              href={buildTwitterLink(entry.twitter_username!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-black transition-colors flex-shrink-0"
            >
              <Image
                src="/icons/x_black.png"
                width={12}
                height={12}
                alt="X (Twitter)"
                className="opacity-70"
              />
              <span className="truncate">@{entry.twitter_username}</span>
            </a>
          )}
          {hasDiscord && (
            <a
              href={buildDiscordLink(entry.discord_user_id!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-black transition-colors flex-shrink-0"
            >
              <Image
                src="/icons/discord_black.svg"
                width={12}
                height={12}
                alt="Discord"
                className="opacity-70"
              />
              <span className="truncate">{entry.discord_username}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

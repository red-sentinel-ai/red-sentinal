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
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <Link
        href={entry.username ? `/u/${entry.username}` : '#'}
        className={!entry.username ? 'pointer-events-none' : ''}
      >
        <div className="relative h-8 w-8 flex-shrink-0 rounded-full border border-gray-200 bg-gray-100 sm:h-10 sm:w-10">
          {avatar ? (
            <Image
              src={avatar}
              alt={entry.username || 'User Avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-col gap-1">
        {entry.username ? (
          <Link
            href={`/u/${entry.username}`}
            className="truncate text-sm font-semibold text-black hover:underline sm:text-base"
          >
            {entry.username}
          </Link>
        ) : (
          <p className="truncate text-sm font-medium text-gray-600 sm:text-base">
            User #{entry.user_id?.slice(-6)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {primaryWallet && (
            <Link
              href={`${EXPLORER_BASE_URL}/address/${primaryWallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-shrink-0 items-center gap-1.5 transition-colors hover:text-black hover:underline"
            >
              <Wallet className="h-3 w-3 opacity-70" />
              <span className="font-mono">{formatAddress(primaryWallet)}</span>
            </Link>
          )}
          {hasTwitter && (
            <a
              href={buildTwitterLink(entry.twitter_username!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-shrink-0 items-center gap-1.5 transition-colors hover:text-black"
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
              className="flex flex-shrink-0 items-center gap-1.5 transition-colors hover:text-black"
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

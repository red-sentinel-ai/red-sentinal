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
        <div className="relative w-10 h-10 rounded-full flex-shrink-0 bg-gray-800">
          {avatar ? (
            <Image
              src={avatar}
              alt={entry.username || 'User Avatar'}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1 min-w-0">
        {entry.username ? (
          <Link
            href={`/u/${entry.username}`}
            className="font-semibold text-white truncate hover:underline"
          >
            {entry.username}
          </Link>
        ) : (
          <p className="font-medium text-[#B5B5B5] truncate">User #{entry.user_id?.slice(-6)}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {primaryWallet && (
            <Link
              href={`${EXPLORER_BASE_URL}/address/${primaryWallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors hover:underline"
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
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Image
                src="/icons/x.png"
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
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Image
                src="/icons/discord.svg"
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

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/ravenRewards'

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

  return (
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className="flex flex-col gap-3 min-w-0">
        {hasTwitter && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Image
                src="/icons/x.png"
                width={14}
                height={14}
                alt="twitter"
                className="opacity-90"
              />
            </div>
            <Link
              target="_blank"
              className="flex gap-2 items-center text-blue-300 hover:text-blue-200 underline hover:no-underline transition-colors font-medium"
              href={buildTwitterLink(entry.twitter_username!)}
            >
              <span className="truncate">@{entry.twitter_username}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-70" />
            </Link>
          </div>
        )}
        {hasDiscord && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
              <Image
                src="/icons/discord.svg"
                width={14}
                height={14}
                alt="discord"
                className="opacity-90"
              />
            </div>
            <Link
              target="_blank"
              className="flex gap-2 items-center text-purple-300 hover:text-purple-200 underline hover:no-underline transition-colors font-medium"
              href={buildDiscordLink(entry.discord_user_id!)}
            >
              <span className="truncate">{entry.discord_username}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-70" />
            </Link>
          </div>
        )}
        {!hasTwitter && !hasDiscord && entry.username && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 flex items-center justify-center flex-shrink-0">
              <Star className="h-3 w-3 text-gray-400" />
            </div>
            <span className="font-semibold text-white truncate">{entry.username}</span>
          </div>
        )}
        {!hasTwitter && !hasDiscord && !entry.username && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-400">#</span>
            </div>
            <span className="font-medium text-gray-400 truncate">
              User #{entry.user_id.slice(-6)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

import Image from 'next/image'
import { ExternalLink, Star } from 'lucide-react'
import { LeaderboardEntry } from '@/types/ravenRewards'

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
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="flex flex-col gap-1 min-w-0">
        {hasTwitter && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
              <Image
                src="/icons/x.png"
                width={12}
                height={12}
                alt="twitter"
                className="opacity-80"
              />
            </div>

            <button
              className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={() => window.open(buildTwitterLink(entry.twitter_username!), '_blank')}
            >
              <span className="truncate">@{entry.twitter_username}</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-60" />
            </button>
          </div>
        )}

        {hasDiscord && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
              <Image
                src="/icons/discord.svg"
                width={12}
                height={12}
                alt="discord"
                className="opacity-80"
              />
            </div>
            <button
              className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={() => window.open(buildDiscordLink(entry.discord_user_id!), '_blank')}
            >
              <span className="truncate">{entry.discord_username}</span>
              <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-60" />
            </button>
          </div>
        )}

        {!hasTwitter && !hasDiscord && entry.username && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center flex-shrink-0">
              <Star className="h-3 w-3 text-gray-400" />
            </div>
            <span className="font-semibold text-white truncate">{entry.username}</span>
          </div>
        )}

        {!hasTwitter && !hasDiscord && !entry.username && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-500">#</span>
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

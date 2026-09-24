import type { InfiniteData } from '@tanstack/react-query'
import type {
  PlayerDirectoryResponse,
  PlayerEntry,
} from '@/hooks/players/usePlayerDirectory'

type DirectoryData = InfiniteData<PlayerDirectoryResponse> | undefined

function togglePlayerFollow(player: PlayerEntry, nowFollowing: boolean): PlayerEntry {
  const alreadyInState = player.is_following === nowFollowing
  if (alreadyInState) return player

  return {
    ...player,
    is_following: nowFollowing,
    followers: Math.max(0, player.followers + (nowFollowing ? 1 : -1)),
  }
}

export function applyFollowToggle(
  data: DirectoryData,
  userId: string,
  nowFollowing: boolean
): DirectoryData {
  if (!data) return data

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      players: page.players.map(player =>
        player.user_id === userId ? togglePlayerFollow(player, nowFollowing) : player
      ),
    })),
  }
}

'use client'

import { useCallback, useMemo, useState } from 'react'
import { Search, Loader2, Users } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'

import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import {
  usePlayerDirectory,
  PLAYER_DIRECTORY_QUERY_KEY,
  type PlayerDirectoryResponse,
} from '@/hooks/players/usePlayerDirectory'
import { PlayerRow } from './PlayerRow'
import { PLAYER_STAT_COLUMNS } from './playerColumns'
import { applyFollowToggle } from './playerDirectoryCache'

export function PlayerDirectory() {
  const { user } = useAuth()
  const viewerId = user?.id
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search] = useDebounce(searchInput.trim(), 350)

  const handleFollowToggle = useCallback(
    (userId: string, nowFollowing: boolean) => {
      queryClient.setQueriesData<InfiniteData<PlayerDirectoryResponse>>(
        { queryKey: [PLAYER_DIRECTORY_QUERY_KEY] },
        old => applyFollowToggle(old, userId, nowFollowing)
      )
    },
    [queryClient]
  )

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePlayerDirectory(viewerId, search)

  const total = data?.pages[0]?.total ?? 0
  const currentPlayer = data?.pages[0]?.currentPlayer

  const players = useMemo(() => data?.pages.flatMap(page => page.players) ?? [], [data])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <h1 className="page-heading">Operators</h1>
        <p className="page-subheading mt-2">
          Every operator on Red Sentinel, their attacks, bounties won, sentinels launched, and
          social reach. Follow the players you want to track.
        </p>
      </header>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          value={searchInput}
          onChange={event => setSearchInput(event.target.value)}
          placeholder="Search by name, username or social handle…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
        <div className="player-directory-grid border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-3">
          <span />
          <span className="industrial-label">Player</span>
          <span className="industrial-label hidden md:block">Tier</span>
          {PLAYER_STAT_COLUMNS.map(col => (
            <span key={col.key} className="industrial-label hidden md:block">
              {col.label}
            </span>
          ))}
          <span />
        </div>

        {currentPlayer && (
          <PlayerRow player={currentPlayer} isCurrentUser onFollowToggle={handleFollowToggle} />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[var(--color-text-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading players…</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
            Couldn&apos;t load the player directory. Please try again.
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--color-text-muted)]">
            <Users className="h-6 w-6" />
            <span className="text-sm">
              {search ? `No players match “${search}”.` : 'No players yet.'}
            </span>
          </div>
        ) : (
          players.map(player => (
            <PlayerRow key={player.user_id} player={player} onFollowToggle={handleFollowToggle} />
          ))
        )}
      </div>

      {!isLoading && players.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="industrial-label">
            Showing {players.length} of {total} players
          </p>
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="button-ghost-terminal flex items-center gap-2 rounded-md px-6 py-2 disabled:opacity-50"
            >
              {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

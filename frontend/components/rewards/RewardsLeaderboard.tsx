'use client'

import { useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { Trophy, Medal, Crown, TrendingUp, Star, Zap, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRewardsLeaderboard } from '@/hooks/rewards/useRewardsLeaderboard'
import { UserDisplay } from './LeaderboardUserDisplay'
import { Input } from '../ui/input'

interface RewardsLeaderboardProps {
  pointsSymbol: string
}

export function RewardsLeaderboard({ pointsSymbol }: RewardsLeaderboardProps) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const debouncedSearchUpdate = useRef(
    debounce((value: string) => {
      setDebouncedSearch(value)
    }, 500)
  ).current

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useRewardsLeaderboard(
    20,
    debouncedSearch
  )

  const entries = data?.pages.flatMap((page) => page.leaderboard) || []

  useEffect(() => {
    debouncedSearchUpdate(searchInput)
    return () => {
      debouncedSearchUpdate.cancel()
    }
  }, [searchInput, debouncedSearchUpdate])

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return

    const currentLoadMoreRef = loadMoreRef.current
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    if (currentLoadMoreRef) {
      observer.current.observe(currentLoadMoreRef)
    }

    return () => {
      if (currentLoadMoreRef && observer.current) {
        observer.current.unobserve(currentLoadMoreRef)
      }
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
      <Card className="bg-black/30 border-gray-800">
        <CardHeader className="flex-row justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">RP Points Leaderboard</CardTitle>
              <p className="text-gray-400">Top performers in the Raven House ecosystem</p>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Search by Discord or X username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="mt-4 max-w-md"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-24 rounded-lg"
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center mx-auto mb-6">
                  {debouncedSearch ? (
                    <Search className="h-12 w-12 text-gray-400" />
                  ) : (
                    <TrendingUp className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">
                  {debouncedSearch ? 'No Search Results' : 'No Rankings Yet'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  {debouncedSearch
                    ? 'No users found matching your search criteria. Try a different username.'
                    : 'Be the first to complete missions and claim your spot at the top of the leaderboard!'}
                </p>
                {!debouncedSearch && (
                  <div className="mt-6">
                    <span className="bg-primary/10 text-primary border-primary/30">
                      <Zap className="h-3 w-3 mr-1" />
                      Start earning points today
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {entries.map((entry, index) => {
                  const isCurrentUser = false // TODO: Implement current user check
                  const isTopThree = index < 3
                  const tierConfig = getTierConfig(entry.tier || 'bronze')

                  return (
                    <div
                      key={entry.user_id}
                      className={`relative group transition-all duration-300 ${
                        isCurrentUser ? 'ring-2 ring-primary/50' : ''
                      }`}
                    >
                      {isTopThree && (
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${getRankGradient(
                            index
                          )} rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity`}
                        ></div>
                      )}
                      <div
                        className={`relative flex items-center gap-4 p-5 rounded-xl transition-all duration-300 border ${
                          isCurrentUser
                            ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/20'
                            : isTopThree
                            ? 'bg-black/40 border-gray-700/50 hover:border-gray-600/50'
                            : 'bg-black/20 border-gray-800/50 hover:bg-black/30 hover:border-gray-700/50'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <UserDisplay entry={entry} />
                          {isCurrentUser && (
                            <span className="mt-2 bg-primary/20 text-primary border-primary/30">
                              <Crown className="h-3 w-3 mr-1" />
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end mb-1">
                              <Zap className="h-4 w-4 text-primary" />
                              <span className="text-xl font-bold text-white">
                                {entry.total_points?.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-400 font-medium">
                                {pointsSymbol}
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <div
                              className={`px-4 py-2 rounded-full text-sm font-bold text-white ${tierConfig.gradient} shadow-lg min-w-20 text-center`}
                            >
                              {(entry.tier || 'Bronze').charAt(0).toUpperCase() +
                                (entry.tier || 'bronze').slice(1)}
                            </div>
                            {isTopThree && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                                  <Star className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isFetchingNextPage && (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-24 rounded-lg"
                      />
                    ))}
                  </div>
                )}
                {hasNextPage && (
                  <div
                    ref={loadMoreRef}
                    className="h-10"
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return (
        <div className="relative">
          <Crown className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="relative">
          <Trophy className="h-7 w-7 text-gray-300 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
        </div>
      )
    case 2:
      return (
        <div className="relative">
          <Medal className="h-7 w-7 text-orange-400 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 border border-gray-600/20 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-300">#{index + 1}</span>
        </div>
      )
  }
}

const getRankGradient = (index: number) => {
  switch (index) {
    case 0:
      return 'from-yellow-500/30 to-orange-500/30'
    case 1:
      return 'from-gray-400/30 to-gray-500/30'
    case 2:
      return 'from-orange-500/30 to-red-500/30'
    default:
      return 'from-gray-700/20 to-gray-800/20'
  }
}

const getTierConfig = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'platinum':
      return {
        gradient: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
      }
    case 'gold':
      return {
        gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
      }
    case 'silver':
      return {
        gradient: 'bg-gradient-to-r from-gray-400 to-gray-600',
        textColor: 'text-gray-300',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
      }
    default:
      return {
        gradient: 'bg-gradient-to-r from-amber-600 to-amber-800',
        textColor: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
      }
  }
}

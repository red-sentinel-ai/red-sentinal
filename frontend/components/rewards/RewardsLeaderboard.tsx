'use client'

import { useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { Trophy, Medal, Crown, TrendingUp, Star, Zap, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '../ui/input'
import { useRewardsLeaderboard } from '@/hooks/rewards/useRewardsLeaderboard'
import { UserDisplay } from './LeaderboardUserDisplay'

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
    <div className="min-h-body pb-12 pt-20">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl shadow-2xl">
              <CardHeader className="flex-row justify-between items-start p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white uppercase font-bold">
                      RP Points Leaderboard
                    </CardTitle>
                    <p className="text-gray-300 text-lg">Top performers in the Sui Sentinel</p>
                  </div>
                </div>
                <div className="mt-4 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Search by Discord or X username..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-[#1a1a1a] backdrop-blur-lg border border-[#444] rounded-xl text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 h-12 px-4 text-base"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-28 rounded-xl bg-[#333]/50"
                        />
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <motion.div
                      className="text-center py-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center mx-auto mb-8">
                        {debouncedSearch ? (
                          <Search className="h-16 w-16 text-gray-400" />
                        ) : (
                          <TrendingUp className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4 uppercase">
                        {debouncedSearch ? 'No Search Results' : 'No Rankings Yet'}
                      </h3>
                      <p className="text-gray-300 max-w-md mx-auto leading-relaxed text-lg">
                        {debouncedSearch
                          ? 'No users found matching your search criteria. Try a different username.'
                          : 'Be the first to complete missions and claim your spot at the top of the leaderboard!'}
                      </p>
                      {!debouncedSearch && (
                        <div className="mt-8">
                          <span className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-cyan-300 border border-blue-500/50 px-6 py-3 rounded-full text-base flex items-center gap-2 w-fit mx-auto font-semibold shadow-lg shadow-blue-500/20">
                            <Zap className="h-4 w-4" />
                            Start earning points today
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      {entries.map((entry, index) => {
                        const isCurrentUser = false // TODO: Implement current user check
                        const isTopThree = index < 3
                        const tierConfig = getTierConfig(entry.tier || 'bronze')

                        return (
                          <motion.div
                            key={entry.user_id}
                            className={`relative group transition-all duration-300 ${
                              isCurrentUser ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <div
                              className={`relative flex items-center gap-6 p-6 rounded-xl transition-all duration-300 border ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                  : isTopThree
                                  ? 'bg-[#12121266] backdrop-blur-lg border-[#444] hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10'
                                  : 'bg-[#12121266] backdrop-blur-lg border-[#444] hover:border-gray-500/50'
                              }`}
                            >
                              <div className="flex-shrink-0 w-16 flex justify-center">
                                {getRankIcon(index)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <UserDisplay entry={entry} />
                                {isCurrentUser && (
                                  <span className="mt-3 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-cyan-300 border border-blue-500/50 px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit font-semibold">
                                    <Crown className="h-3 w-3" />
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-2 justify-end mb-2">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                    <span className="text-2xl font-bold text-white">
                                      {entry.total_points?.toLocaleString()}
                                    </span>
                                    <span className="text-base text-gray-300 font-semibold">
                                      {pointsSymbol}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div
                                    className={`px-6 py-3 rounded-full text-base font-bold text-white ${tierConfig.gradient} min-w-24 text-center border ${tierConfig.borderColor} shadow-lg ${tierConfig.shadowColor}`}
                                  >
                                    {(entry.tier || 'Bronze').charAt(0).toUpperCase() +
                                      (entry.tier || 'bronze').slice(1)}
                                  </div>
                                  {isTopThree && (
                                    <div className="absolute -top-2 -right-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                        <Star className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                      {isFetchingNextPage && (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton
                              key={i}
                              className="h-28 rounded-xl bg-[#333]/50"
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return (
        <div className="relative">
          <Crown className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="relative">
          <Trophy className="h-10 w-10 text-gray-300 drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/30">
            <span className="text-xs font-bold text-white">2</span>
          </div>
        </div>
      )
    case 2:
      return (
        <div className="relative">
          <Medal className="h-10 w-10 text-orange-400 drop-shadow-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-xs font-bold text-white">3</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600/30 to-gray-700/30 border border-gray-500/50 flex items-center justify-center shadow-lg">
          <span className="text-base font-bold text-gray-300">#{index + 1}</span>
        </div>
      )
  }
}

const getTierConfig = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'platinum':
      return {
        gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600',
        textColor: 'text-purple-300',
        bgColor: 'bg-purple-600/20',
        borderColor: 'border-purple-500/50',
        shadowColor: 'shadow-purple-500/20',
      }
    case 'gold':
      return {
        gradient: 'bg-gradient-to-r from-yellow-600 to-amber-600',
        textColor: 'text-yellow-300',
        bgColor: 'bg-yellow-600/20',
        borderColor: 'border-yellow-500/50',
        shadowColor: 'shadow-yellow-500/20',
      }
    case 'silver':
      return {
        gradient: 'bg-gradient-to-r from-gray-500 to-slate-600',
        textColor: 'text-gray-300',
        bgColor: 'bg-gray-500/20',
        borderColor: 'border-gray-500/50',
        shadowColor: 'shadow-gray-500/20',
      }
    default:
      return {
        gradient: 'bg-gradient-to-r from-orange-600 to-red-600',
        textColor: 'text-orange-300',
        bgColor: 'bg-orange-600/20',
        borderColor: 'border-orange-500/50',
        shadowColor: 'shadow-orange-500/20',
      }
  }
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { Trophy, Medal, Crown, TrendingUp, Star, Zap, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Skeleton, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-50/50 backdrop-blur-lg border border-gray-200 rounded-2xl">
              <CardHeader className="flex-row justify-between items-start">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Trophy className="h-6 w-6 text-black" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl text-black uppercase">
                      SNTL Points Leaderboard
                    </CardTitle>
                    <p className="text-gray-500">Top performers in the Sui Sentinel</p>
                  </div>
                </div>
                <div className="mt-4 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Search by Discord or X username..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:border-black transition-colors"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-24 rounded-lg bg-gray-200"
                        />
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <motion.div
                      className="text-center py-16"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6">
                        {debouncedSearch ? (
                          <Search className="h-12 w-12 text-gray-400" />
                        ) : (
                          <TrendingUp className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-black mb-3 uppercase">
                        {debouncedSearch ? 'No Search Results' : 'No Rankings Yet'}
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        {debouncedSearch
                          ? 'No users found matching your search criteria. Try a different username.'
                          : 'Be the first to complete missions and claim your spot at the top of the leaderboard!'}
                      </p>
                      {!debouncedSearch && (
                        <div className="mt-6">
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit mx-auto">
                            <Zap className="h-3 w-3" />
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
                            className={`relative group transition-all duration-300 rounded-xl ${
                              isCurrentUser ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                          >
                            <div
                              className={`relative flex items-center gap-4 p-5 rounded-xl transition-all duration-300 border ${
                                isCurrentUser
                                  ? 'bg-blue-50 border-blue-200'
                                  : isTopThree
                                  ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                  : 'bg-white border-gray-200 hover:bg-gray-50/50 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex-shrink-0 w-12 flex justify-center">
                                {getRankIcon(index)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <UserDisplay entry={entry} />
                                {isCurrentUser && (
                                  <span className="mt-2 bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                                    <Crown className="h-3 w-3" />
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-1 justify-end mb-1">
                                    <Zap className="h-4 w-4 text-black" />
                                    <span className="text-xl font-bold text-black">
                                      {entry.total_points?.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                      {pointsSymbol}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div
                                    className={`px-4 py-2 rounded-full text-sm font-bold min-w-20 text-center border ${tierConfig.bgClass} ${tierConfig.textClass} ${tierConfig.borderClass}`}
                                  >
                                    {(entry.tier || 'Bronze').charAt(0).toUpperCase() +
                                      (entry.tier || 'bronze').slice(1)}
                                  </div>
                                  {isTopThree && (
                                    <div className="absolute -top-1 -right-1">
                                      <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                                        <Star className="h-3 w-3 text-white" />
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
                              className="h-24 rounded-lg bg-gray-200"
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
          <Crown className="h-8 w-8 text-yellow-500" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-white">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="relative">
          <Trophy className="h-7 w-7 text-gray-500" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center border-2 border-white">
            <span className="text-xs font-bold text-white">2</span>
          </div>
        </div>
      )
    case 2:
      return (
        <div className="relative">
          <Medal className="h-7 w-7 text-yellow-700" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-700 flex items-center justify-center border-2 border-white">
            <span className="text-xs font-bold text-white">3</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
        </div>
      )
  }
}

const getTierConfig = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'platinum':
      return {
        bgClass: 'bg-gray-800',
        textClass: 'text-white',
        borderClass: 'border-gray-900',
      }
    case 'gold':
      return {
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800',
        borderClass: 'border-yellow-200',
      }
    case 'silver':
      return {
        bgClass: 'bg-gray-200',
        textClass: 'text-gray-800',
        borderClass: 'border-gray-300',
      }
    default: // Bronze
      return {
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800',
        borderClass: 'border-yellow-200',
      }
  }
}

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

  const entries = data?.pages.flatMap(page => page.leaderboard) || []

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
      entries => {
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
      <div className="container mx-auto md:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-2xl border border-gray-200 bg-gray-50/50 backdrop-blur-lg">
              <CardHeader className="flex-col items-start justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Trophy className="h-6 w-6 text-black" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-lg uppercase text-black sm:text-2xl">
                      SENTINEL Points Leaderboard
                    </CardTitle>
                    <p className="text-gray-500">Top performers in the Sui Sentinel</p>
                  </div>
                </div>
                <div className="mt-4 w-full max-w-md sm:mt-0">
                  <Input
                    type="text"
                    placeholder="Search by Discord or X username..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white text-black transition-colors placeholder:text-gray-400 focus:border-black"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-24 rounded-lg bg-gray-200" />
                      ))}
                    </div>
                  ) : entries.length === 0 ? (
                    <motion.div
                      className="py-16 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                        {debouncedSearch ? (
                          <Search className="h-12 w-12 text-gray-400" />
                        ) : (
                          <TrendingUp className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold uppercase text-black">
                        {debouncedSearch ? 'No Search Results' : 'No Rankings Yet'}
                      </h3>
                      <p className="mx-auto max-w-md leading-relaxed text-gray-600">
                        {debouncedSearch
                          ? 'No users found matching your search criteria. Try a different username.'
                          : 'Be the first to complete missions and claim your spot at the top of the leaderboard!'}
                      </p>
                      {!debouncedSearch && (
                        <div className="mt-6">
                          <span className="mx-auto flex w-fit items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-sm text-blue-800">
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
                            className={`group relative rounded-xl transition-all duration-300 ${
                              isCurrentUser ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                          >
                            <div
                              className={`relative flex flex-col justify-between gap-1 rounded-xl border p-3 transition-all duration-300 sm:flex-row sm:items-center md:gap-4 md:p-4 ${
                                isCurrentUser
                                  ? 'border-blue-200 bg-blue-50'
                                  : isTopThree
                                    ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                              }`}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-4">
                                <div className="flex w-10 flex-shrink-0 justify-center sm:w-12">
                                  {getRankIcon(index)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <UserDisplay entry={entry} />
                                  {isCurrentUser && (
                                    <span className="mt-2 flex w-fit items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                      <Crown className="h-3 w-3" />
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex w-full flex-shrink-0 items-center justify-between gap-3 sm:w-auto sm:flex-col sm:justify-normal sm:gap-2 sm:pl-14 md:flex-row md:gap-4 md:pl-0">
                                <div className="text-left sm:text-right">
                                  <div className="mb-0 flex items-center justify-start gap-1 sm:mb-1 sm:justify-end">
                                    <Zap className="h-4 w-4 text-black" />
                                    <span className="text-lg font-bold text-black sm:text-xl">
                                      {entry.total_points?.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 sm:text-sm">
                                      {pointsSymbol}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div
                                    className={`min-w-20 rounded-full border px-3 py-2 text-center text-xs font-bold sm:px-4 sm:text-sm ${tierConfig.bgClass} ${tierConfig.textClass} ${tierConfig.borderClass}`}
                                  >
                                    {(entry.tier || 'Bronze').charAt(0).toUpperCase() +
                                      (entry.tier || 'bronze').slice(1)}
                                  </div>
                                  {isTopThree && (
                                    <div className="absolute -right-1 -top-1">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
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
                          {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-24 rounded-lg bg-gray-200" />
                          ))}
                        </div>
                      )}
                      {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
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
          <Crown className="h-7 w-7 text-yellow-500 sm:h-8 sm:w-8" />
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-yellow-500">
            <span className="text-[10px] font-bold text-white sm:text-xs">1</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="relative">
          <Trophy className="h-6 w-6 text-gray-500 sm:h-7 sm:w-7" />
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gray-500">
            <span className="text-[10px] font-bold text-white sm:text-xs">2</span>
          </div>
        </div>
      )
    case 2:
      return (
        <div className="relative">
          <Medal className="h-6 w-6 text-yellow-700 sm:h-7 sm:w-7" />
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-yellow-700">
            <span className="text-[10px] font-bold text-white sm:text-xs">3</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 sm:h-10 sm:w-10">
          <span className="text-xs font-bold text-gray-600 sm:text-sm">#{index + 1}</span>
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

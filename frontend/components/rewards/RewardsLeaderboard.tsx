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
            <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
              <CardHeader className="flex-row justify-between items-start">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Trophy className="h-6 w-6 text-[#8F564E]" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl text-[#B8B8B8] uppercase">
                      SNTL Points Leaderboard
                    </CardTitle>
                    <p className="text-[#B5B5B5]">Top performers in the Sui Sentinel</p>
                  </div>
                </div>
                <div className="mt-4 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Search by Discord or X username..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-lg text-white placeholder:text-[#B5B5B5] focus:border-[#558EB4] transition-colors"
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
                          className="h-24 rounded-lg bg-[#383838]/30"
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
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#383838]/20 to-[#383838]/30 flex items-center justify-center mx-auto mb-6">
                        {debouncedSearch ? (
                          <Search className="h-12 w-12 text-[#B5B5B5]" />
                        ) : (
                          <TrendingUp className="h-12 w-12 text-[#B5B5B5]" />
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-[#B8B8B8] mb-3 uppercase">
                        {debouncedSearch ? 'No Search Results' : 'No Rankings Yet'}
                      </h3>
                      <p className="text-[#B5B5B5] max-w-md mx-auto leading-relaxed">
                        {debouncedSearch
                          ? 'No users found matching your search criteria. Try a different username.'
                          : 'Be the first to complete missions and claim your spot at the top of the leaderboard!'}
                      </p>
                      {!debouncedSearch && (
                        <div className="mt-6">
                          <span className="bg-[#558EB4]/20 text-[#558EB4] border border-[#558EB4]/30 px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit mx-auto">
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
                            className={`relative group transition-all duration-300 ${
                              isCurrentUser ? 'ring-2 ring-[#558EB4]/50' : ''
                            }`}
                          >
                            <div
                              className={`relative flex items-center gap-4 p-5 rounded-xl transition-all duration-300 border ${
                                isCurrentUser
                                  ? 'bg-[#558EB4]/10 border-[#558EB4]/40'
                                  : isTopThree
                                  ? 'bg-[#12121266] backdrop-blur-lg border-[#383838] hover:border-[#558EB4]/30'
                                  : 'bg-[#12121266] backdrop-blur-lg border-[#383838] hover:bg-[#12121266] hover:border-[#383838]'
                              }`}
                            >
                              <div className="flex-shrink-0 w-12 flex justify-center">
                                {getRankIcon(index)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <UserDisplay entry={entry} />
                                {isCurrentUser && (
                                  <span className="mt-2 bg-[#558EB4]/20 text-[#558EB4] border border-[#558EB4]/30 px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit">
                                    <Crown className="h-3 w-3" />
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-1 justify-end mb-1">
                                    <Zap className="h-4 w-4 text-[#558EB4]" />
                                    <span className="text-xl font-bold text-white">
                                      {entry.total_points?.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-[#B5B5B5] font-medium">
                                      {pointsSymbol}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div
                                    className={`px-4 py-2 rounded-full text-sm font-bold text-white ${tierConfig.gradient} min-w-20 text-center border border-[#383838]`}
                                  >
                                    {(entry.tier || 'Bronze').charAt(0).toUpperCase() +
                                      (entry.tier || 'bronze').slice(1)}
                                  </div>
                                  {isTopThree && (
                                    <div className="absolute -top-1 -right-1">
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#8F564E] to-[#E53922] flex items-center justify-center">
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
                              className="h-24 rounded-lg bg-[#383838]/30"
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
          <Crown className="h-8 w-8 text-[#8F564E] drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-[#8F564E] to-[#E53922] flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </div>
      )
    case 1:
      return (
        <div className="relative">
          <Trophy className="h-7 w-7 text-[#B5B5B5] drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-[#B5B5B5] to-[#383838] flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
        </div>
      )
    case 2:
      return (
        <div className="relative">
          <Medal className="h-7 w-7 text-[#8F564E] drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-[#8F564E] to-[#E53922] flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#383838]/30 to-[#383838]/50 border border-[#383838] flex items-center justify-center">
          <span className="text-sm font-bold text-[#B5B5B5]">#{index + 1}</span>
        </div>
      )
  }
}

const getTierConfig = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'platinum':
      return {
        gradient: 'bg-gradient-to-r from-[#8F564E] to-[#E53922]',
        textColor: 'text-[#8F564E]',
        bgColor: 'bg-[#8F564E]/10',
        borderColor: 'border-[#8F564E]/30',
      }
    case 'gold':
      return {
        gradient: 'bg-gradient-to-r from-[#8F564E] to-[#E53922]',
        textColor: 'text-[#8F564E]',
        bgColor: 'bg-[#8F564E]/10',
        borderColor: 'border-[#8F564E]/30',
      }
    case 'silver':
      return {
        gradient: 'bg-gradient-to-r from-[#B5B5B5] to-[#383838]',
        textColor: 'text-[#B5B5B5]',
        bgColor: 'bg-[#B5B5B5]/10',
        borderColor: 'border-[#B5B5B5]/30',
      }
    default:
      return {
        gradient: 'bg-gradient-to-r from-[#8F564E] to-[#E53922]',
        textColor: 'text-[#8F564E]',
        bgColor: 'bg-[#8F564E]/10',
        borderColor: 'border-[#8F564E]/30',
      }
  }
}

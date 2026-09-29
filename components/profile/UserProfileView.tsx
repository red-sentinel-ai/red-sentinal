'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Folder, Activity, Gift, Database, Coins } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useActiveChain } from '@/context/ActiveChainContext'
import { BoosterRewards } from '@/components/rewards/BoosterRewards'
import { UserAgents } from './UserAgents'
import { UserActivity } from './UserActivity'
import { UserWalrusRecords } from './UserWalrusRecords'
import { UserCredits } from './UserCredits'
import { ProfileSocialConnections } from './ProfileSocialConnections'
import { ProfileHeader } from './ProfileHeader'
import { ProfileStatsBar } from './ProfileStatsBar'
import { resolveWalletForChain } from './profile-utils'
import type { ProfileViewData } from '@/types/Profile'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
  WALRUS: 'walrus',
  REWARDS: 'rewards',
  CREDITS: 'credits',
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

interface UserProfileViewProps {
  profile: ProfileViewData
}

export function UserProfileView({ profile }: UserProfileViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { address: connectedAddress } = useConnectedAddress()
  const { activeChain } = useActiveChain()

  const isOwner = useMemo(() => {
    if (!connectedAddress) return false
    const connected = connectedAddress.toLowerCase()
    return profile.wallets.some(wallet => wallet.address.toLowerCase() === connected)
  }, [connectedAddress, profile.wallets])

  const primaryWallet = profile.wallets[0]?.address
  const activeChainWallet = useMemo(
    () => resolveWalletForChain(profile.wallets, activeChain),
    [profile.wallets, activeChain]
  )

  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && Object.values(PROFILE_TABS).includes(tabParam as ProfileTabValue)) {
      setActiveTab(tabParam as ProfileTabValue)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProfileTabValue)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative bg-[var(--color-bg-base)]">
      <div className="relative mx-auto min-h-screen max-w-[1400px] px-4 pb-12 pt-24 md:px-12">
        <ProfileHeader profile={profile} isOwner={isOwner} primaryWallet={primaryWallet} />

        <ProfileStatsBar walletAddress={activeChainWallet} />

        {isOwner && <ProfileSocialConnections />}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <nav className="scrollbar-hide mb-8 flex items-center gap-6 overflow-x-auto border-b border-[var(--color-border-subtle)] md:gap-10">
            <TabsList className="flex h-auto gap-0 bg-transparent p-0">
              <TabsTrigger value={PROFILE_TABS.AGENTS} className="profile-tab-trigger">
                <Folder className="h-4 w-4" />
                Sentinels
              </TabsTrigger>
              <TabsTrigger value={PROFILE_TABS.ACTIVITY} className="profile-tab-trigger">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value={PROFILE_TABS.WALRUS} className="profile-tab-trigger">
                  <Database className="h-4 w-4" />
                  Walrus
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger value={PROFILE_TABS.REWARDS} className="profile-tab-trigger">
                  <Gift className="h-4 w-4" />
                  My Rewards
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger value={PROFILE_TABS.CREDITS} className="profile-tab-trigger">
                  <Coins className="h-4 w-4" />
                  Credits
                </TabsTrigger>
              )}
            </TabsList>
          </nav>

          <div>
            <TabsContent value={PROFILE_TABS.AGENTS}>
              <UserAgents address={activeChainWallet} chain={activeChain} isOwner={isOwner} />
            </TabsContent>
            <TabsContent value={PROFILE_TABS.ACTIVITY}>
              <UserActivity address={activeChainWallet} isOwner={isOwner} />
            </TabsContent>
            {isOwner && (
              <TabsContent value={PROFILE_TABS.WALRUS}>
                <UserWalrusRecords />
              </TabsContent>
            )}
            {isOwner && (
              <TabsContent value={PROFILE_TABS.REWARDS}>
                <BoosterRewards />
              </TabsContent>
            )}
            {isOwner && (
              <TabsContent value={PROFILE_TABS.CREDITS}>
                <UserCredits />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Folder, Activity, Loader2, Camera, Gift, BarChart3, Copy, Check } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { UserStats } from '@/components/profile/UserStats'
import { BoosterRewards } from '@/components/rewards/BoosterRewards'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { ProfileSocialConnections } from '@/components/profile/ProfileSocialConnections'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import { useUserProfileStats } from '@/hooks/profile/useUserProfileStats'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants/asset_paths'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { SENTINEL_TOKEN_DECIMALS, SENTINEL_TOKEN_EXPLORER_URL, SUI_CONFIG } from '@/constants'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
  STATS: 'stats',
  REWARDS: 'rewards',
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { address: connectedAddress, chain: activeChain } = useConnectedAddress()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()
  const { data: userStats, isLoading: isLoadingStats } = useUserProfileStats()
  const { formattedBalance: sentinelBalance } = useTokenBalance(
    SUI_CONFIG.SENTINEL_COIN_TYPE,
    SENTINEL_TOKEN_DECIMALS
  )

  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar({
    onSuccess: () => setIsImagePickerOpen(false),
  })

  // Initialize tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && Object.values(PROFILE_TABS).includes(tabParam as ProfileTabValue)) {
      setActiveTab(tabParam as ProfileTabValue)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProfileTabValue)
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/profile?${params.toString()}`, { scroll: false })
  }

  const handleImageSelect = (img: { url: string; isCustom: boolean; file?: File | null }) => {
    setIsImagePickerOpen(false)
    const formData = new FormData()
    if (img.isCustom && img.file) {
      formData.append('image', img.file)
    } else {
      formData.append('image_url', img.url)
    }
    updateAvatar(formData)
  }

  const handleCopyAddress = async () => {
    if (!connectedAddress) return
    await navigator.clipboard.writeText(connectedAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!connectedAddress) {
    return (
      <ConnectPrompt
        title="Join the Red Team"
        subtitle="Connect your wallet to track your attacks, manage Sentinels, and claim rewards"
        theme="defender"
      />
    )
  }

  const isSolana = activeChain === 'solana'

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-[var(--color-bg-base)]">
        <div className="min-h-screen relative mx-auto max-w-[1400px] px-4 pt-24 pb-12 md:px-12">
          {/* Header Section */}
          <section className="flex flex-col md:flex-row items-start gap-6 md:gap-10 mb-8 py-6">
            {/* Square Avatar */}
            <div className="relative shrink-0">
              <div
                className="group relative h-28 w-28 cursor-pointer overflow-hidden border border-[var(--color-border-strong)] p-0.5 md:h-32 md:w-32"
                onClick={() => setIsImagePickerOpen(true)}
              >
                {isUpdatingAvatar ? (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-surface)]/70">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-primary)]" />
                  </div>
                ) : profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="User Avatar"
                    fill
                    className="object-cover grayscale brightness-90 transition-all duration-700 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-subtle)]">
                    <User className="h-12 w-12 text-[var(--color-text-muted)]" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-text-primary)]/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-[var(--color-bg-surface)]" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Name and Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-mono text-3xl md:text-4xl font-bold uppercase tracking-wide leading-none text-[var(--color-text-primary)]">
                    {profile?.display_name || profile?.username || 'Operator'}
                  </h1>
                  {profile?.rewards_tier && (
                    <div className="border border-[var(--color-border-default)] px-3 py-1 bg-[var(--color-bg-surface)]">
                      <span className="text-[9px] font-bold uppercase tracking-[2px] text-[var(--color-text-secondary)]">
                        {profile.rewards_tier}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="button-ghost-terminal px-5 py-2"
                  >
                    Edit
                  </button>
                  {profile?.username && (
                    <Link href={`/u/${profile.username}`}>
                      <button className="button-ghost-terminal px-5 py-2 opacity-60 hover:opacity-100">
                        View Public
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-6 md:gap-10">
                {/* Wallet Address */}
                <div className="flex flex-col gap-0.5">
                  <span className="industrial-label">Wallet Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wide text-[var(--color-text-primary)]">
                      {truncateAddress(connectedAddress)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-[var(--color-text-muted)] opacity-40 hover:opacity-100 transition-opacity"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-[var(--color-success)]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Token Balance */}
                {!isSolana && (
                  <div className="flex flex-col gap-0.5">
                    <span className="industrial-label">Sentinel Balance</span>
                    <Link
                      href={SENTINEL_TOKEN_EXPLORER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/icons/dollar_coin.png"
                        width={16}
                        height={16}
                        alt="coin"
                        className="flex-shrink-0"
                      />
                      <span className="text-xs font-bold tracking-wide text-[var(--color-text-primary)]">
                        {sentinelBalance}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Core Stats Bar */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10 border border-[var(--color-border-strong)] divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-strong)]">
            <div className="p-6 md:p-8 flex flex-col gap-1">
              <span className="industrial-label">Total Bounty Extracted</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl md:text-4xl font-bold tracking-wide text-[var(--color-text-primary)]">
                  {formatCurrency(userStats?.totalBountyWonUsd ?? 0)}
                </span>
              )}
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-1">
              <span className="industrial-label">Total Break Attempts</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl md:text-4xl font-bold tracking-wide text-[var(--color-text-primary)]">
                  {formatNumber(userStats?.totalAttacks ?? 0)}
                </span>
              )}
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-1">
              <span className="industrial-label">Defenses Logged</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl md:text-4xl font-bold tracking-wide text-[var(--color-text-primary)]">
                  {formatNumber(userStats?.totalAttacksSurvived ?? 0)}
                </span>
              )}
            </div>
          </section>

          {/* Social Connections */}
          <ProfileSocialConnections />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <nav className="flex items-center gap-6 md:gap-10 border-b border-[var(--color-border-subtle)] mb-8 overflow-x-auto scrollbar-hide">
              <TabsList className="flex gap-0 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value={PROFILE_TABS.AGENTS}
                  className="flex items-center gap-2 pb-4 px-2 text-[11px] font-bold uppercase tracking-[2px] whitespace-nowrap rounded-none border-b-2 border-transparent text-[var(--color-text-muted)] transition-colors data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:bg-transparent hover:text-[var(--color-text-secondary)]"
                >
                  <Folder className="h-4 w-4" />
                  Sentinels
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.ACTIVITY}
                  className="flex items-center gap-2 pb-4 px-2 text-[11px] font-bold uppercase tracking-[2px] whitespace-nowrap rounded-none border-b-2 border-transparent text-[var(--color-text-muted)] transition-colors data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:bg-transparent hover:text-[var(--color-text-secondary)]"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.STATS}
                  className="flex items-center gap-2 pb-4 px-2 text-[11px] font-bold uppercase tracking-[2px] whitespace-nowrap rounded-none border-b-2 border-transparent text-[var(--color-text-muted)] transition-colors data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:bg-transparent hover:text-[var(--color-text-secondary)]"
                >
                  <BarChart3 className="h-4 w-4" />
                  Stats
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.REWARDS}
                  className="flex items-center gap-2 pb-4 px-2 text-[11px] font-bold uppercase tracking-[2px] whitespace-nowrap rounded-none border-b-2 border-transparent text-[var(--color-text-muted)] transition-colors data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:bg-transparent hover:text-[var(--color-text-secondary)]"
                >
                  <Gift className="h-4 w-4" />
                  My Rewards
                </TabsTrigger>
              </TabsList>
            </nav>

            <div>
              <TabsContent value={PROFILE_TABS.AGENTS}>
                <UserAgents />
              </TabsContent>

              <TabsContent value={PROFILE_TABS.ACTIVITY}>
                <UserActivity />
              </TabsContent>

              <TabsContent value={PROFILE_TABS.STATS}>
                <div className="max-w-5xl">
                  <UserStats />
                </div>
              </TabsContent>

              <TabsContent value={PROFILE_TABS.REWARDS}>
                <BoosterRewards />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />

      <ImagePickerSheet
        open={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleImageSelect}
        title="Select Profile Image"
        subtitle="Choose a new avatar from our collection or upload your own."
        imageArray={USER_IMAGES}
        gifArray={SENTINEL_GIFS}
        disableGifs={true}
      />
    </>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}

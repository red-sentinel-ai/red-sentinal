'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Folder, Activity, Loader2, Camera, Gift, Copy, Check } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { BoosterRewards } from '@/components/rewards/BoosterRewards'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { FollowStats } from '@/components/profile/FollowStats'
import { ProfileSocialConnections } from '@/components/profile/ProfileSocialConnections'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import { useUserProfileStats } from '@/hooks/profile/useUserProfileStats'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants/asset_paths'
import { DEFAULT_PROFILE_URL } from '@/constants'

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

  const { address: connectedAddress } = useConnectedAddress()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()
  const { data: userStats, isLoading: isLoadingStats } = useUserProfileStats()

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

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
      </div>
    )
  }

  return (
    <>
      <div className="relative bg-[var(--color-bg-base)]">
        <div className="relative mx-auto min-h-screen max-w-[1400px] px-4 pb-12 pt-24 md:px-12">
          {/* Header Section */}
          <section className="mb-8 flex flex-col items-start gap-6 py-6 md:flex-row md:gap-10">
            {/* Square Avatar */}
            <div className="relative shrink-0">
              <div
                className="group relative h-28 w-28 cursor-pointer overflow-hidden border border-[var(--color-border-strong)] p-0.5 md:h-32 md:w-32"
                onClick={() => setIsImagePickerOpen(true)}
              >
                {isUpdatingAvatar ? (
                  <div className="bg-[var(--color-bg-surface)]/70 flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-primary)]" />
                  </div>
                ) : (
                  <Image
                    src={profile?.avatar_url || DEFAULT_PROFILE_URL}
                    alt="User Avatar"
                    fill
                    className="object-cover brightness-90 transition-all duration-700"
                  />
                )}
                <div className="bg-[var(--color-text-primary)]/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-8 w-8 text-[var(--color-bg-surface)]" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-1 flex-col gap-4">
              {/* Name and Actions Row */}
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-mono text-3xl font-bold uppercase leading-none tracking-wide text-[var(--color-text-primary)] md:text-4xl">
                    {profile?.display_name || profile?.username || 'Operator'}
                  </h1>
                  {profile?.rewards_tier && (
                    <div className="border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-1">
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
                      className="text-[var(--color-text-muted)] opacity-40 transition-opacity hover:opacity-100"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-[var(--color-success)]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {profile?.id && <FollowStats identifier={profile.id} />}
              </div>
            </div>
          </section>

          {/* Core Stats Bar */}
          <section className="mb-10 grid grid-cols-1 gap-0 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex flex-col gap-1 p-6 md:p-8">
              <span className="industrial-label">Total Bounty Extracted</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl font-bold tracking-wide text-[var(--color-text-primary)] md:text-4xl">
                  {formatCurrency(userStats?.totalBountyUsd ?? 0)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-6 md:p-8">
              <span className="industrial-label">Total Break Attempts</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl font-bold tracking-wide text-[var(--color-text-primary)] md:text-4xl">
                  {formatNumber(userStats?.totalAttacks ?? 0)}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-6 md:p-8">
              <span className="industrial-label">Defenses Logged</span>
              {isLoadingStats ? (
                <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
              ) : (
                <span className="font-mono text-3xl font-bold tracking-wide text-[var(--color-text-primary)] md:text-4xl">
                  {formatNumber(userStats?.totalAttacksSurvived ?? 0)}
                </span>
              )}
            </div>
          </section>

          {/* Social Connections */}
          <ProfileSocialConnections />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <nav className="scrollbar-hide mb-8 flex items-center gap-6 overflow-x-auto border-b border-[var(--color-border-subtle)] md:gap-10">
              <TabsList className="flex h-auto gap-0 bg-transparent p-0">
                <TabsTrigger
                  value={PROFILE_TABS.AGENTS}
                  className="flex items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent px-2 pb-4 text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)]"
                >
                  <Folder className="h-4 w-4" />
                  Sentinels
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.ACTIVITY}
                  className="flex items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent px-2 pb-4 text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)]"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value={PROFILE_TABS.REWARDS}
                  className="flex items-center gap-2 whitespace-nowrap rounded-none border-b-2 border-transparent px-2 pb-4 text-[11px] font-bold uppercase tracking-[2px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] data-[state=active]:border-[var(--color-text-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)]"
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
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Folder, Activity, Loader2, Camera, Gift, BarChart3 } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { UserStats } from '@/components/profile/UserStats'
import { BoosterRewards } from '@/components/rewards/BoosterRewards'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { SocialConnectionsSectionWrapper } from '@/components/profile/SocialConnectionsSectionWrapper'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
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

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  const { address: connectedAddress, chain: activeChain } = useConnectedAddress()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()
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
        <div className="min-h-screen relative mx-auto max-w-[1440px] pb-12">
          <div
            className="mb-6 flex min-h-[300px] w-full flex-col items-start gap-4 bg-cover bg-bottom bg-no-repeat px-4 pb-8 pt-4 sm:min-h-[376px] sm:items-end sm:pb-20 md:flex-row md:px-12"
            style={{ backgroundImage: 'url("/img/footer-bg.png")' }}
          >
            <div
              className="group relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-[var(--color-border-subtle)] md:h-44 md:w-44"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {isUpdatingAvatar ? (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-surface)]/70">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-gold-primary)]" />
                </div>
              ) : profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="User Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-subtle)]">
                  <User className="h-12 w-12 text-[var(--color-text-muted)]" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-text-primary)]/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-8 w-8 text-[var(--color-bg-surface)]" />
              </div>
            </div>

            <div className="order-3 min-w-0 flex-1 pt-2 md:order-2">
              <h1 className="font-display truncate text-2xl font-semibold text-[var(--color-text-primary)] leading-snug sm:text-3xl">
                {profile?.display_name || 'Your Profile'}
              </h1>
              <p className="font-body mb-3 mt-1 font-medium text-[var(--color-text-secondary)]">@{profile?.username}</p>

              {!isSolana && (
                <Link
                  href={SENTINEL_TOKEN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-5 flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl bg-[var(--color-bg-surface)] px-3 py-1 shadow-[var(--shadow-card)] transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/icons/dollar_coin.png"
                    width={24}
                    height={24}
                    alt="coin"
                    className="flex-shrink-0"
                  />
                  <span className="font-body text-sm font-medium text-[var(--color-text-primary)] sm:text-base">
                    Sentinel Balance:{` `}
                    <span className="text-[var(--color-gold-primary)] underline">{sentinelBalance} SENTINEL</span>
                  </span>
                </Link>
              )}

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="font-body btn btn-outline h-[50px] font-medium text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]"
              >
                Edit Profile
              </button>
            </div>
            <div className="order-2 flex w-full flex-wrap items-center justify-start gap-2 pt-2 sm:ml-auto sm:w-auto sm:justify-end md:order-3 md:pt-0">
              <Link
                className="font-body btn h-[50px] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] text-sm sm:text-base"
                href="/defend"
              >
                Launch Sentinel
              </Link>

              <Link
                className="font-body btn btn-outline text-sm sm:text-base text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]"
                href="/attack"
              >
                Attack Sentinel
              </Link>

              {profile?.username && (
                <Link href={`/u/${profile.username}`}>
                  <button className="font-body btn btn-outline h-[30px] text-xs sm:text-sm text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)]">
                    View Profile as Public
                  </button>
                </Link>
              )}
            </div>
          </div>
          <div className="mb-6">
            <SocialConnectionsSectionWrapper />
          </div>

          <div className="px-4 md:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="flex w-full justify-start gap-0 bg-transparent lg:w-auto">
                <TabsTrigger
                  value={PROFILE_TABS.AGENTS}
                  className="font-body flex items-center gap-2 rounded-none text-sm text-[var(--color-text-secondary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)] sm:text-lg"
                >
                  <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Sentinels</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.ACTIVITY}
                  className="font-body flex items-center gap-2 rounded-none text-sm text-[var(--color-text-secondary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)] sm:text-lg"
                >
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Activity</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.STATS}
                  className="font-body flex items-center gap-2 rounded-none text-sm text-[var(--color-text-secondary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)] sm:text-lg"
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Stats</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.REWARDS}
                  className="font-body flex items-center gap-2 rounded-none text-sm text-[var(--color-text-secondary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-text-primary)] sm:text-lg"
                >
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">My Rewards</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
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

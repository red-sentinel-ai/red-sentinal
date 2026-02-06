'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Folder, Activity, Loader2, Camera, Gift, BarChart3 } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { UserStats } from '@/components/profile/UserStats'
import { RewardsHistory } from '@/components/profile/RewardsHistory'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { SocialConnectionsSectionWrapper } from '@/components/profile/SocialConnectionsSectionWrapper'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants'
import { useSentinelBalance } from '@/hooks/rewards/useSentinelBalance'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
  STATS: 'stats',
  REWARDS: 'rewards',
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  const account = useCurrentAccount()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()
  const { formattedBalance: sentinelBalance } = useSentinelBalance()

  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar({
    onSuccess: () => setIsImagePickerOpen(false),
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProfileTabValue)
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

  if (!account?.address) {
    return (
      <ConnectPrompt
        title="Welcome User"
        subtitle="Connect your wallet to see your activities"
        theme="defender"
      />
    )
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-body flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="min-h-body relative mx-auto max-w-[1440px] pb-12">
          <div
            className="mb-6 flex min-h-[300px] w-full flex-col items-start gap-4 bg-cover bg-bottom bg-no-repeat px-4 pb-8 pt-4 sm:min-h-[376px] sm:items-end sm:pb-20 md:flex-row md:px-12"
            style={{ backgroundImage: 'url("/img/footer-bg.png")' }}
          >
            <div
              className="group relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-full md:h-44 md:w-44"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {isUpdatingAvatar ? (
                <div className="flex h-full w-full items-center justify-center bg-white/70">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              ) : profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="User Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-2">
              <h1 className="truncate text-2xl font-medium leading-snug sm:text-[32px]">
                {profile?.display_name || 'Your Profile'}
              </h1>
              <p className="mb-3 mt-1 font-medium text-[#5E5E5E]">@{profile?.username}</p>

              <div className="mb-5 flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl bg-white px-2 py-1">
                <Image
                  src="/icons/dollar_coin.png"
                  width={24}
                  height={24}
                  alt="coin"
                  className="flex-shrink-0"
                />
                <span className="text-sm font-medium sm:text-base">
                  Sentinel Balance:{' '}
                  <span className="text-[#F632F3]">{sentinelBalance} SENTINEL</span>
                </span>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-outline h-[50px] font-medium"
              >
                Edit Profile
              </button>
            </div>
            <div className="flex w-full flex-wrap items-center justify-start gap-2 pt-2 sm:ml-auto sm:w-auto sm:justify-end">
              <Link className="btn btn-black text-sm sm:text-base" href="/defend">
                Launch Sentinel
              </Link>

              <Link className="btn btn-outline text-sm sm:text-base" href="/attack">
                Attack Sentinel
              </Link>

              {profile?.username && (
                <Link href={`/u/${profile.username}`}>
                  <button className="btn btn-outline h-[30px] text-xs sm:text-sm">
                    View Profile as Public
                  </button>
                </Link>
              )}
            </div>
          </div>
          <div className="mb-12">
            <SocialConnectionsSectionWrapper />
          </div>

          <div className="px-4 md:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 gap-2 lg:flex lg:w-auto lg:justify-start">
                <TabsTrigger
                  value={PROFILE_TABS.AGENTS}
                  className="flex items-center gap-2 text-sm sm:text-lg md:text-xl"
                >
                  <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Sentinels</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.ACTIVITY}
                  className="flex items-center gap-2 text-sm sm:text-lg md:text-xl"
                >
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Activity</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.STATS}
                  className="flex items-center gap-2 text-sm sm:text-lg md:text-xl"
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Stats</span>
                </TabsTrigger>

                <TabsTrigger
                  value={PROFILE_TABS.REWARDS}
                  className="flex items-center gap-2 text-sm sm:text-lg md:text-xl"
                >
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Rewards</span>
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
                  <div className="max-w-5xl">
                    <RewardsHistory />
                  </div>
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

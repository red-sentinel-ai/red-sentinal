'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Folder, Activity, Loader2, Camera, Gift } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { RewardsHistory } from '@/components/profile/RewardsHistory' 
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { SocialConnectionsSectionWrapper } from '@/components/profile/SocialConnectionsSectionWrapper'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
  REWARDS: 'rewards', 
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const account = useCurrentAccount()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()

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
        <div className="max-w-[1440px] mx-auto pb-12 pt-24 min-h-body relative">
          <div
            className="flex flex-col sm:flex-row items-end gap-4 min-h-[376px] bg-cover bg-bottom bg-no-repeat px-4 md:px-12 pt-4 pb-20 mb-6 w-full"
            style={{ backgroundImage: 'url("/img/footer-bg.png")' }}
          >
            <div
              className="relative w-20 h-20 md:w-44 md:h-44 rounded-full overflow-hidden cursor-pointer group flex-shrink-0"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {isUpdatingAvatar ? (
                <div className="w-full h-full flex items-center justify-center bg-white/70">
                  <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <h1 className="text-2xl sm:text-[32px] truncate font-medium leading-snug">
                {profile?.display_name || 'Your Profile'}
              </h1>
              <p className="text-[#5E5E5E] mt-1 font-medium mb-6">@{profile?.username}</p>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-outline h-[50px] font-medium"
              >
                Edit Profile
              </button>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto pt-2">
              <Link
                className="btn btn-black"
                href="/defend"
              >
                Launch Sentinel
              </Link>

              <Link
                className="btn btn-outline"
                href="/attack"
              >
                Attack Sentinel
              </Link>

              {profile?.username && (
                <Link
                  href={`/u/${profile.username}`}
                  className=""
                >
                  <button className="btn btn-outline h-[30px]">View Profile as Public</button>
                </Link>
              )}
            </div>
          </div>
          <div className="mb-12">
            <SocialConnectionsSectionWrapper />
          </div>

          <div className="px-4 md:px-8">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:flex lg:justify-start gap-2">
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

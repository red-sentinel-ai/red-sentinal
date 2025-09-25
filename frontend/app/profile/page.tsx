'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Folder, Activity, Loader2, Edit } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { SocialConnectionsSectionWrapper } from '@/components/profile/SocialConnectionsSectionWrapper'
import { useUserProfile } from '@/hooks/profile/useUserProfile'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const account = useCurrentAccount()
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()

  const handleTabChange = (value: string) => {
    setActiveTab(value as ProfileTabValue)
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
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 pb-12 pt-24 min-h-body">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold truncate">
                  {profile?.display_name || 'Your Profile'}
                </h1>
                <p className="text-gray-400 mt-1">@{profile?.username}</p>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                {profile?.username && (
                  <Link
                    href={`/u/${profile.username}`}
                    className="border border-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-shrink-0"
                  >
                    View Public
                  </Link>
                )}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-shrink-0 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <SocialConnectionsSectionWrapper />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:flex lg:justify-start">
              <TabsTrigger
                value={PROFILE_TABS.AGENTS}
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                <span>Your Sentinels</span>
              </TabsTrigger>
              <TabsTrigger
                value={PROFILE_TABS.ACTIVITY}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                <span>Activity</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value={PROFILE_TABS.AGENTS}
              className="mt-6"
            >
              <UserAgents />
            </TabsContent>
            <TabsContent
              value={PROFILE_TABS.ACTIVITY}
              className="mt-6"
            >
              <UserActivity />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  )
}

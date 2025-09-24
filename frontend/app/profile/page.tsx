'use client'

import { useState } from 'react'
import { User, Folder, Activity } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserActivity } from '@/components/profile/UserActivity'
import { UserAgents } from '@/components/profile/UserAgents'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { SocialConnectionsSectionWrapper } from '@/components/profile/SocialConnectionsSectionWrapper'

const PROFILE_TABS = {
  AGENTS: 'agents',
  ACTIVITY: 'activity',
} as const

type ProfileTabValue = (typeof PROFILE_TABS)[keyof typeof PROFILE_TABS]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTabValue>(PROFILE_TABS.AGENTS)
  const account = useCurrentAccount()
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
  return (
    <div className="container mx-auto px-4 pb-12 pt-24 min-h-body">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-foreground/20 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">Your Profile</h1>
              <p className="text-gray-400 mt-1">{account?.address}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <SocialConnectionsSectionWrapper />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:flex lg:justify-start">
            <TabsTrigger
              value={PROFILE_TABS.AGENTS}
              className="flex items-center gap-2"
            >
              <Folder className="h-4 w-4" />
              <span className="hidden sm:inline">Your Sentinels</span>
              <span className="sm:hidden">Agents</span>
            </TabsTrigger>

            <TabsTrigger
              value={PROFILE_TABS.ACTIVITY}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Trading Activity</h2>
              <p className="text-gray-400">
                Track your NFT transactions and marketplace activities
              </p>
            </div>

            <UserActivity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

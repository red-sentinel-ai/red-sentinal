'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { ConnectPrompt } from '@/components/ConnectPrompt'
import { UserProfileView } from '@/components/profile/UserProfileView'
import type { ProfileViewData } from '@/types/Profile'
import { useUserProfile } from '@/hooks/profile/useUserProfile'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
      <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
    </div>
  )
}

function OwnProfile() {
  const { address: connectedAddress } = useConnectedAddress()
  const { data: profile, isLoading } = useUserProfile()

  if (!connectedAddress) {
    return (
      <ConnectPrompt
        title="Join the Red Team"
        subtitle="Connect your wallet to track your attacks, manage Sentinels, and claim rewards"
        theme="defender"
      />
    )
  }

  if (isLoading || !profile) {
    return <FullScreenLoader />
  }

  const profileData: ProfileViewData = {
    userId: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    rewardsTier: profile.rewards_tier,
    walletAddresses: [connectedAddress],
  }

  return <UserProfileView profile={profileData} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <OwnProfile />
    </Suspense>
  )
}

'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { ConnectPrompt } from '@/components/ConnectPrompt'
import { UserProfileView } from '@/components/profile/UserProfileView'
import type { ProfileViewData } from '@/types/Profile'
import { useAuth } from '@/context/AuthContext'
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
  const { user, isLoading } = useAuth()

  if (!connectedAddress) {
    return (
      <ConnectPrompt
        title="Join the Red Team"
        subtitle="Connect your wallet to track your attacks, manage Sentinels, and claim rewards"
        theme="defender"
      />
    )
  }

  if (isLoading || !user) {
    return <FullScreenLoader />
  }

  const profileData: ProfileViewData = {
    userId: user.id,
    username: user.username ?? '',
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    rewardsTier: user.rewards_tier,
    wallets: user.wallets.map(wallet => ({
      address: wallet.wallet_address,
      chainType: wallet.chain_type,
      chainId: wallet.chain_id,
      isPrimary: wallet.is_primary,
    })),
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

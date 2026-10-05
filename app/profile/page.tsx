'use client'

import { Suspense } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'

import { ConnectPrompt } from '@/components/ConnectPrompt'
import { UserProfileView } from '@/components/profile/UserProfileView'
import { useAuth, useIsWalletLinked } from '@/context/AuthContext'
import { useWalletAuth } from '@/hooks/auth/useWalletAuth'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { truncateAddress } from '@/lib/utils'
import type { ProfileViewData } from '@/types/Profile'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
      <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
    </div>
  )
}

/**
 * Shown when the connected wallet is not linked to the authenticated account
 * (e.g. the user switched wallets and dismissed the signature prompt). Renders
 * instead of the account's profile so stale wallet data is never displayed.
 */
function UnverifiedWalletPrompt({ address }: { address: string }) {
  const { authenticate, isAuthenticating } = useWalletAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-[var(--color-gold-primary)]" />
      <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-[var(--color-text-primary)]">
        Verify your wallet
      </h1>
      <p className="max-w-md text-sm text-[var(--color-text-muted)]">
        You are connected with{' '}
        <span className="font-mono text-[var(--color-text-primary)]">{truncateAddress(address)}</span>,
        but this wallet is not linked to your profile yet. Sign a message to verify ownership and
        load the profile for this wallet.
      </p>
      <button
        onClick={() => authenticate()}
        disabled={isAuthenticating}
        className="button-ghost-terminal flex items-center gap-2 px-6 py-2"
      >
        {isAuthenticating && <Loader2 className="h-4 w-4 animate-spin" />}
        {isAuthenticating ? 'Waiting for signature…' : 'Verify Wallet'}
      </button>
    </div>
  )
}

function OwnProfile() {
  const { address: connectedAddress } = useConnectedAddress()
  const { user, isLoading } = useAuth()
  const isWalletLinked = useIsWalletLinked(connectedAddress)

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

  // Connected wallet isn't part of this account — never fall back to rendering
  // another wallet's profile. Prompt for the ownership signature instead.
  if (!isWalletLinked) {
    return <UnverifiedWalletPrompt address={connectedAddress} />
  }

  const profileData: ProfileViewData = {
    userId: user.id,
    username: user.username ?? '',
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
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

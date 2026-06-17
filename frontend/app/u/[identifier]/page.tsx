import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { supabaseServiceClient } from '@/db/config/server'
import { UserProfileView } from '@/components/profile/UserProfileView'
import type { ProfileViewData } from '@/types/Profile'

async function resolveProfile(identifier: string): Promise<ProfileViewData | null> {
  const isWalletAddress = identifier.startsWith('0x') && identifier.length > 60

  let userId: string | null = null

  if (isWalletAddress) {
    const { data: walletConnection, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .eq('wallet_address', identifier)
      .single()

    if (walletError || !walletConnection) {
      console.error('Wallet lookup error:', walletError?.message)
      return null
    }
    userId = walletConnection.user_id
  } else {
    const { data: userByUsername, error: usernameError } = await supabaseServiceClient
      .from('ss_users')
      .select('id')
      .eq('username', identifier)
      .single()

    if (usernameError || !userByUsername) {
      console.error('Username lookup error:', usernameError?.message)
      return null
    }
    userId = userByUsername.id
  }

  const { data: user, error: userError } = await supabaseServiceClient
    .from('ss_users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    console.error('User lookup error:', userError?.message)
    return null
  }

  const { data: walletConnections } = await supabaseServiceClient
    .from('ss_wallet_connections')
    .select('wallet_address')
    .eq('user_id', userId)

  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    rewardsTier: user.rewards_tier,
    walletAddresses: walletConnections?.map(w => w.wallet_address) ?? [],
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params
  const profile = await resolveProfile(identifier)

  if (!profile) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
        </div>
      }
    >
      <UserProfileView profile={profile} />
    </Suspense>
  )
}

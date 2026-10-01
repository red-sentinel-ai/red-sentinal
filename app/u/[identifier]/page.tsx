import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { supabaseServiceClient } from '@/db/config/server'
import { UserProfileView } from '@/components/profile/UserProfileView'
import type { ConnectedWallet, ProfileViewData } from '@/types/Profile'

async function resolveProfile(identifier: string): Promise<ProfileViewData | null> {
  // EVM addresses are 0x + 40 hex chars; Sui addresses are 0x + 64 hex chars
  const isWalletAddress = /^0x([0-9a-fA-F]{40}|[0-9a-fA-F]{64})$/.test(identifier)

  let userId: string | null = null

  if (isWalletAddress) {
    const { data: walletConnection, error: walletError } = await supabaseServiceClient
      .from('ss_wallet_connections')
      .select('user_id')
      .ilike('wallet_address', identifier)
      .order('connected_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (walletError) {
      console.error('Wallet lookup error:', walletError.message)
      return null
    }
    if (walletConnection) {
      userId = walletConnection.user_id
    }
  }

  if (!userId) {
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
    .select('wallet_address, chain_type, chain_id, is_primary')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('connected_at', { ascending: true })

  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    wallets:
      walletConnections?.map(connection => ({
        address: connection.wallet_address,
        chainType: connection.chain_type as ConnectedWallet['chainType'],
        chainId: connection.chain_id,
        isPrimary: connection.is_primary ?? false,
      })) ?? [],
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

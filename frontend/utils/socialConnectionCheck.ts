import { supabaseServiceClient } from '@/db/config/server'

export interface SocialConnectionStatus {
  wallet_address: string
  isEmailConnected: boolean
  isTelegramConnected: boolean
  hasAnyConnection: boolean
}

export async function checkSocialConnections(rawWalletAddress: string): Promise<SocialConnectionStatus> {
  const walletAddress = rawWalletAddress.toLowerCase()

  // ilike + limit(1) — handles multiple rows from pre-normalization mixed-case duplicates
  const { data: walletConnections } = await supabaseServiceClient
    .from('ss_wallet_connections')
    .select('user_id')
    .ilike('wallet_address', walletAddress)
    .limit(1)

  const walletConnection = walletConnections?.[0] ?? null

  if (!walletConnection) {
    return {
      wallet_address: walletAddress,
      isEmailConnected: false,
      isTelegramConnected: false,
      hasAnyConnection: false,
    }
  }

  const { data: connections } = await supabaseServiceClient
    .from('ss_social_connections')
    .select('platform')
    .eq('user_id', walletConnection.user_id)

  const platforms = connections?.map(conn => conn.platform) || []
  const isEmailConnected = platforms.includes('email')
  const isTelegramConnected = platforms.includes('telegram')

  return {
    wallet_address: walletAddress,
    isEmailConnected,
    isTelegramConnected,
    hasAnyConnection: isEmailConnected || isTelegramConnected,
  }
}

import { supabaseServiceClient } from '@/db/config/server'

export interface SocialConnectionStatus {
  wallet_address: string
  isGoogleConnected: boolean
  isTelegramConnected: boolean
  hasAnyConnection: boolean
}

/**
 * Check social connections for a wallet address
 */
export async function checkSocialConnections(
  walletAddress: string
): Promise<SocialConnectionStatus> {
  const { data: user } = await supabaseServiceClient
    .from('ss_users')
    .select('id')
    .contains('wallet_addresses', [walletAddress])
    .single()

  if (!user) {
    return {
      wallet_address: walletAddress,
      isGoogleConnected: false,
      isTelegramConnected: false,
      hasAnyConnection: false,
    }
  }

  const { data: connections } = await supabaseServiceClient
    .from('ss_social_connections')
    .select('platform')
    .eq('user_id', user.id)

  const platforms = connections?.map(conn => conn.platform) || []
  const isGoogleConnected = platforms.includes('google')
  const isTelegramConnected = platforms.includes('telegram')
  const hasAnyConnection = isGoogleConnected || isTelegramConnected

  return {
    wallet_address: walletAddress,
    isGoogleConnected,
    isTelegramConnected,
    hasAnyConnection,
  }
}

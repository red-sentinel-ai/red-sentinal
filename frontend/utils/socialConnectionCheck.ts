import { supabaseServiceClient } from '@/db/config/server'

export interface SocialConnectionStatus {
  wallet_address: string
  isXConnected: boolean
  isDiscordConnected: boolean
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
      isXConnected: false,
      isDiscordConnected: false,
      hasAnyConnection: false,
    }
  }

  // Get social connections for this user
  const { data: connections } = await supabaseServiceClient
    .from('ss_social_connections')
    .select('platform')
    .eq('user_id', user.id)

  const platforms = connections?.map((conn) => conn.platform) || []
  const isXConnected = platforms.includes('twitter')
  const isDiscordConnected = platforms.includes('discord')
  const hasAnyConnection = isXConnected || isDiscordConnected

  return {
    wallet_address: walletAddress,
    isXConnected,
    isDiscordConnected,
    hasAnyConnection,
  }
}

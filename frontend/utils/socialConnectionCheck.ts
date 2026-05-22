import { supabaseServiceClient } from '@/db/config/server'

export interface SocialConnectionStatus {
  wallet_address: string
  isEmailConnected: boolean
  isTelegramConnected: boolean
  hasAnyConnection: boolean
}

export async function checkSocialConnections(walletAddress: string): Promise<SocialConnectionStatus> {
  // Find user by wallet address in ss_wallet_connections
  const { data: walletConnection } = await supabaseServiceClient
    .from('ss_wallet_connections')
    .select('user_id')
    .eq('wallet_address', walletAddress)
    .single()

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

import { supabaseServiceClient } from '@/db/config/server'

export interface SocialConnectionStatus {
  wallet_address: string
  isEmailConnected: boolean
  isTelegramConnected: boolean
  hasAnyConnection: boolean
}

export async function checkSocialConnections(walletAddress: string): Promise<SocialConnectionStatus> {
  const { data: user } = await supabaseServiceClient
    .from('ss_users')
    .select('id')
    .contains('wallet_addresses', [walletAddress])
    .single()

  if (!user) {
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
    .eq('user_id', user.id)

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

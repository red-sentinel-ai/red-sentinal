
import { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import TwitterProvider from 'next-auth/providers/twitter'
import { supabaseServiceClient } from '@/db/config/server'
import { cookies } from 'next/headers'

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    TwitterProvider({
      // For OAuth 1.0a, use "API Key" and "API Key Secret" from Twitter Portal
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      // version: '2.0' is removed to default to OAuth 1.0a
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account, profile }) {
      try {
        if (account && profile) {
          const cookieStore = await cookies()
          const walletAddress = cookieStore.get('pending_wallet_address')?.value

          if (walletAddress) {
            await saveSocialConnection(walletAddress, account.provider, profile)
            cookieStore.delete('pending_wallet_address')
          }
        }
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return true
      }
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.connectedProviders = token.connectedProviders || []

        if (!token.connectedProviders.includes(account.provider)) {
          token.connectedProviders.push(account.provider)
        }

        const providerKey = `${account.provider}Data`
        token[providerKey] = {
          id: getPlatformUserId(profile, account.provider),
          username: getUsername(profile, account.provider),
          avatar: getAvatarUrl(profile, account.provider),
          connectedAt: new Date().toISOString(),
        }
      }
      return token
    },

    async session({ session, token }) {
      session.connectedProviders = (token.connectedProviders as string[]) || []
      session.walletAddress = token.walletAddress
      session.hasTwitter = session.connectedProviders.includes('twitter')
      session.hasDiscord = session.connectedProviders.includes('discord')

      if (token.twitterData) session.twitterData = token.twitterData
      if (token.discordData) session.discordData = token.discordData

      return session
    },
  },
  pages: {
    error: '/profile?error=social-auth',
  },
}

/**
 * Updated Helpers for OAuth 1.0a Compatibility
 */
function getPlatformUserId(profile: any, provider: string): string {
  if (provider === 'twitter') {
    // 1.0a uses id_str; 2.0 uses data.id
    return profile.id_str || profile.id?.toString() || profile.data?.id || ''
  } else if (provider === 'discord') {
    return profile.id || profile.sub || ''
  }
  return profile.id || profile.sub || ''
}

function getUsername(profile: any, provider: string): string {
  if (provider === 'twitter') {
    // 1.0a uses screen_name; 2.0 uses data.username
    return profile.screen_name || profile.data?.username || profile.name || 'Unknown'
  } else if (provider === 'discord') {
    return profile.username || profile.name || 'Unknown'
  }
  return 'Unknown'
}

function getAvatarUrl(profile: any, provider: string): string | null {
  if (provider === 'twitter') {
    // 1.0a uses profile_image_url_https; 2.0 uses data.profile_image_url
    return profile.profile_image_url_https || profile.profile_image_url || profile.data?.profile_image_url || null
  } else if (provider === 'discord') {
    return profile.image || profile.avatar_url || null
  }
  return null
}

async function saveSocialConnection(walletAddress: string, provider: string, profile: any) {
  try {
    const platformUserId = getPlatformUserId(profile, provider)
    const platformUsername = getUsername(profile, provider)
    const platformAvatarUrl = getAvatarUrl(profile, provider)

    if (!platformUserId) return

    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id, avatar_url')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (userError || !user) return

    await supabaseServiceClient.from('ss_social_connections').upsert(
      {
        user_id: user.id,
        platform: provider,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        platform_avatar_url: platformAvatarUrl,
      },
      { onConflict: 'user_id,platform' }
    )
  } catch (error) {
    console.error('Error in saveSocialConnection:', error)
  }
}

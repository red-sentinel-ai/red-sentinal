 
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
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
      authorization: {
        url: 'https://twitter.com/i/oauth2/authorize',
        params: {
          scope: 'users.read tweet.read offline.access',
        },
      },
      userinfo: {
        url: 'https://api.twitter.com/2/users/me',
        params: {
          'user.fields': 'id,username',
        },
        async request({ tokens }) {
          // Retry logic for 503 errors
          const maxRetries = 3
          let lastError: Error | null = null

          for (let i = 0; i < maxRetries; i++) {
            try {
              const response = await fetch(
                'https://api.twitter.com/2/users/me?user.fields=id,username',
                {
                  headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                  },
                }
              )

              if (response.ok) {
                return await response.json()
              }

              // If 503, wait and retry
              if (response.status === 503 && i < maxRetries - 1) {
                console.log(`Twitter userinfo 503 error, retry ${i + 1}/${maxRetries}`)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)) // Exponential backoff
                continue
              }

              throw new Error(`Twitter API returned ${response.status}: ${response.statusText}`)
            } catch (error) {
              lastError = error as Error
              if (i < maxRetries - 1) {
                console.log(`Twitter userinfo request failed, retry ${i + 1}/${maxRetries}:`, error)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
              }
            }
          }

          // If all retries failed, throw the last error
          console.error('Twitter userinfo failed after all retries:', lastError)
          throw lastError || new Error('Twitter userinfo request failed')
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account, profile }) {
      try {
        console.log('SignIn callback triggered')
        console.log('Provider:', account?.provider)

        if (account && profile) {
          // Get wallet address from cookies
          const cookieStore = await cookies()
          const walletAddress = cookieStore.get('pending_wallet_address')?.value

          if (walletAddress) {
            await saveSocialConnection(walletAddress, account.provider, profile)
            // Clean up the cookie
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
      // New sign-in
      if (account && profile) {
        // Make sure connectedProviders always starts as array
        token.connectedProviders = token.connectedProviders || []

        // Add new provider if not already there
        if (!token.connectedProviders.includes(account.provider)) {
          token.connectedProviders.push(account.provider)
        }

        // Store provider-specific data
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
      // Pass all provider info to session
      session.connectedProviders = token.connectedProviders || []
      session.walletAddress = token.walletAddress
      session.hasTwitter = session.connectedProviders.includes('twitter')
      session.hasDiscord = session.connectedProviders.includes('discord')

      // Add provider-specific data
      if (token.twitterData) {
        session.twitterData = token.twitterData
      }
      if (token.discordData) {
        session.discordData = token.discordData
      }

      console.log('Session providers:', session.connectedProviders)

      return session
    },
  },
  pages: {
    error: '/profile?error=social-auth',
  },
}

function getPlatformUserId(profile: any, provider: string): string {
  if (provider === 'twitter') {
    return profile.data?.id || ''
  } else if (provider === 'discord') {
    return profile.id || profile.sub || ''
  }
  return profile.id || profile.sub || profile.data?.id || ''
}

// Helper functions
function getUsername(profile: any, provider: string): string {
  if (provider === 'twitter') {
    return profile.data?.username || profile.data?.name || 'Unknown'
  } else if (provider === 'discord') {
    return profile.username || profile.name || 'Unknown'
  }
  return 'Unknown'
}

function getAvatarUrl(profile: any, provider: string): string | null {
  if (provider === 'twitter') {
    return profile.data?.profile_image_url || null
  } else if (provider === 'discord') {
    return profile.image || profile.avatar_url || null
  }
  return null
}

async function saveSocialConnection(walletAddress: string, provider: string, profile: any) {
  try {
    const platformUserId: string = getPlatformUserId(profile, provider)
    const platformUsername: string = getUsername(profile, provider)
    const platformAvatarUrl: string | null = getAvatarUrl(profile, provider)

    if (!platformUserId) {
      console.error('Could not extract platform user ID from profile:', profile)
      return
    }

    const { data: user, error: userError } = await supabaseServiceClient
      .from('ss_users')
      .select('id, avatar_url')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (userError || !user) {
      console.error(
        `Auth Error: User profile for wallet ${walletAddress} not found. This should not happen if the get-or-create flow on wallet connect is working.`
      )
      return
    }

    const { error: upsertError } = await supabaseServiceClient.from('ss_social_connections').upsert(
      {
        user_id: user.id,
        platform: provider,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        platform_avatar_url: platformAvatarUrl,
      },
      {
        onConflict: 'user_id,platform',
      }
    )

    if (upsertError) {
      throw upsertError
    }

    console.log(`Successfully upserted ${provider} connection for user ${user.id}`)

    if (platformAvatarUrl && user.avatar_url && user.avatar_url.startsWith('data:image/svg+xml')) {
      await supabaseServiceClient
        .from('ss_users')
        .update({ avatar_url: platformAvatarUrl })
        .eq('id', user.id)

      console.log(`Updated avatar for user ${user.id} with ${provider} avatar.`)
    }
  } catch (error) {
    console.error('Error in saveSocialConnection:', error)
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const { data: existingSocialConnection } = await supabaseServiceClient
      .from('ss_social_connections')
      .select('user_id')
      .eq('platform', provider)
      .eq('platform_user_id', platformUserId)
      .single()

    const { data: sourceUser } = await supabaseServiceClient
      .from('ss_users')
      .select('*')
      .contains('wallet_addresses', [walletAddress])
      .single()

    if (existingSocialConnection && sourceUser) {
      const targetUserId = existingSocialConnection.user_id
      if (sourceUser.id !== targetUserId) {
        console.log(
          `Merging wallet ${walletAddress} into user ${targetUserId} and deleting temporary user ${sourceUser.id}`
        )
        const { error: deleteError } = await supabaseServiceClient
          .from('ss_users')
          .delete()
          .eq('id', sourceUser.id)
        if (deleteError) {
          console.error('Error deleting temporary user profile:', deleteError)
        }
        const { data: targetUser, error: findTargetError } = await supabaseServiceClient
          .from('ss_users')
          .select('wallet_addresses')
          .eq('id', targetUserId)
          .single()
        if (findTargetError || !targetUser) {
          console.error('Could not find the target user to merge into.')
          return
        }
        const updatedWallets = [...(targetUser.wallet_addresses || []), walletAddress]
        const { error: updateError } = await supabaseServiceClient
          .from('ss_users')
          .update({ wallet_addresses: updatedWallets })
          .eq('id', targetUserId)
        if (updateError) {
          console.error('Error merging wallet address:', updateError)
        }
      } else {
        console.log('Wallet address already belongs to the correct user. No action needed.')
      }
      return
    }

    if (sourceUser) {
      await supabaseServiceClient.from('ss_social_connections').insert({
        user_id: sourceUser.id,
        platform: provider,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        platform_avatar_url: platformAvatarUrl,
      })
      console.log(`New social connection added for existing user ${sourceUser.id}`)
      return
    }

    if (!sourceUser && !existingSocialConnection) {
      const { data: newUser, error: createUserError } = await supabaseServiceClient
        .from('ss_users')
        .insert({
          wallet_addresses: [walletAddress],
          username: platformUsername,
          display_name: platformUsername,
          avatar_url: platformAvatarUrl,
        })
        .select()
        .single()
      if (createUserError) {
        console.error('Error creating new user:', createUserError)
        return
      }
      await supabaseServiceClient.from('ss_social_connections').insert({
        user_id: newUser.id,
        platform: provider,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        platform_avatar_url: platformAvatarUrl,
      })
      console.log(`Created new user ${newUser.id} with social connection.`)
    }
  } catch (error) {
    console.error('Error in saveSocialConnection:', error)
  }
}

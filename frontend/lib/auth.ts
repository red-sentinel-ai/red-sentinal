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
    console.log('Saving social connection:', { walletAddress, provider, profile })

    // Handle different profile structures for different providers
    let platformUserId: string
    let platformUsername: string
    let platformAvatarUrl: string | null

    if (provider === 'twitter') {
      platformUserId = profile.data?.id
      platformUsername = profile.data?.username || profile.data?.name
      platformAvatarUrl = profile.data?.profile_image_url || null
    } else if (provider === 'discord') {
      platformUserId = profile.id || profile.sub
      platformUsername = profile.username || profile.name
      platformAvatarUrl = profile.image || profile.avatar_url || null
    } else {
      platformUserId = profile.id || profile.sub || profile.data?.id
      platformUsername =
        profile.username || profile.name || profile.data?.username || profile.data?.name
      platformAvatarUrl =
        profile.image || profile.avatar_url || profile.data?.profile_image_url || null
    }

    if (!platformUserId) {
      console.error('Could not extract platform user ID from profile:', profile)
      return
    }

    console.log('Extracted platform data:', { platformUserId, platformUsername, platformAvatarUrl })

    // Check if this social account already exists for ANY user
    const { data: existingSocialConnection } = await supabaseServiceClient
      .from('rh_social_connections')
      .select(
        `
        *,
        rh_users (*)
      `
      )
      .eq('platform', provider)
      .eq('platform_user_id', platformUserId)
      .single()

    if (existingSocialConnection?.rh_users) {
      console.log('Social account already exists, merging wallets')
      const existingUser = existingSocialConnection.rh_users as any
      const currentWallets: string[] = existingUser.wallet_addresses || []

      if (!currentWallets.includes(walletAddress)) {
        const { error: updateError } = await supabaseServiceClient
          .from('rh_users')
          .update({
            wallet_addresses: [...currentWallets, walletAddress],
          } as any)
          .eq('id', existingUser.id)

        if (updateError) {
          console.error('Error updating user wallets:', updateError)
        } else {
          console.log('Wallet added to existing user successfully')
        }
      } else {
        console.log('Wallet already associated with this user')
      }
      return
    }

    // Check if user exists by wallet
    const { data: existingUser } = await supabaseServiceClient
      .from('rh_users')
      .select('*')
      .contains('wallet_addresses', [walletAddress])
      .single()

    let finalUser = existingUser

    // Create user if doesn't exist
    if (!finalUser) {
      const { data: newUser, error: userError } = await supabaseServiceClient
        .from('rh_users')
        .insert({
          wallet_addresses: [walletAddress],
          username: platformUsername || `user_${Date.now()}`,
          avatar_url: platformAvatarUrl,
        } as any)
        .select()
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        return
      }
      finalUser = newUser
    }

    if (!finalUser) {
      console.error('Could not create or find user')
      return
    }

    // Create new social connection
    const { data: connection, error: connectionError } = await supabaseServiceClient
      .from('rh_social_connections')
      .insert({
        user_id: finalUser.id,
        platform: provider,
        platform_user_id: platformUserId,
        platform_username: platformUsername || 'Unknown',
        platform_avatar_url: platformAvatarUrl,
      })
      .select()
      .single()

    if (connectionError) {
      console.error('Error creating social connection:', connectionError)
    } else {
      console.log('Social connection created successfully:', connection)
    }
  } catch (error) {
    console.error('Error saving social connection:', error)
  }
}

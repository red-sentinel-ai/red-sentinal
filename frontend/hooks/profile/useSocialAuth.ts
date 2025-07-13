import { useSession } from 'next-auth/react'

export function useSocialAuth() {
  const { data: session, status } = useSession()

  return {
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasTwitter: session?.hasTwitter || false,
    hasDiscord: session?.hasDiscord || false,
    connectedProviders: session?.connectedProviders || [],
    walletAddress: session?.walletAddress,
    twitterData: session?.twitterData,
    discordData: session?.discordData,
  }
}

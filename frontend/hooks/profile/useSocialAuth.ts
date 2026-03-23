import { useSession } from 'next-auth/react'

export function useSocialAuth() {
  const { data: session, status } = useSession()

  return {
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasGoogle: session?.hasGoogle || false,
    connectedProviders: session?.connectedProviders || [],
    googleData: session?.googleData,
  }
}

import { useQuery } from '@tanstack/react-query'

type UserProfile = {
  username: string
  avatar_url: string | null
  wallet_addresses: string[]
}

export function useUserProfiles(walletAddresses: string[]) {
  return useQuery<Record<string, UserProfile>>({
    queryKey: ['userProfiles', [...walletAddresses].sort()],
    queryFn: async () => {
      const response = await fetch('/api/profile/get-by-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddresses }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profiles')
      }

      const profiles: UserProfile[] = await response.json()

      const profilesMap: Record<string, UserProfile> = {}
      for (const profile of profiles) {
        if (profile.wallet_addresses) {
          for (const address of profile.wallet_addresses) {
            profilesMap[address.toLowerCase()] = profile
          }
        }
      }
      return profilesMap
    },
    enabled: walletAddresses.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}

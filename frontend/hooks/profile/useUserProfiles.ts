import { useQuery } from '@tanstack/react-query'
import type { Tables } from '@/lib/database.types'

type UserProfile = Pick<Tables<'ss_users'>, 'username' | 'avatar_url' | 'wallet_addresses'>

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
            profilesMap[address] = profile
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

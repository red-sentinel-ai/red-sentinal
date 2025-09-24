import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'react-toastify'
import type { Tables } from '@/lib/database.types'

type UserProfile = Tables<'ss_users'>

export const USER_PROFILE_QUERY_KEY = 'userProfile'

export function useUserProfile() {
  const account = useCurrentAccount()
  const walletAddress = account?.address

  return useQuery<UserProfile | null>({
    queryKey: [USER_PROFILE_QUERY_KEY, walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null

      const response = await fetch('/api/profile/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        throw new Error('Failed to get or create profile')
      }
      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const account = useCurrentAccount()
  const walletAddress = account?.address

  return useMutation({
    mutationFn: async (payload: { username: string; displayName: string }) => {
      if (!walletAddress) throw new Error('Wallet not connected')

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
      return response.json()
    },
    onSuccess: (updatedProfile) => {
      toast.success('Profile updated successfully!')
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY, walletAddress], updatedProfile)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

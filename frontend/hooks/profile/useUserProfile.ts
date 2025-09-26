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

interface UseUpdateProfileOptions {
  onSuccess?: (data: UserProfile) => void
  onError?: (error: Error) => void
}

export function useUpdateProfile(options: UseUpdateProfileOptions = {}) {
  const queryClient = useQueryClient()
  const account = useCurrentAccount()
  const walletAddress = account?.address

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      formData.append('walletAddress', walletAddress)

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        body: formData,
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
      options.onSuccess?.(updatedProfile)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      options.onError?.(error)
    },
  })
}

export function useUpdateAvatar(options: UseUpdateProfileOptions = {}) {
  const queryClient = useQueryClient()
  const account = useCurrentAccount()
  const walletAddress = account?.address

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!walletAddress) throw new Error('Wallet not connected')
      formData.append('walletAddress', walletAddress)

      const response = await fetch('/api/profile/update-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update avatar')
      }
      return (await response.json()).data as UserProfile
    },
    onSuccess: (updatedProfile) => {
      toast.success('Profile picture updated!')
      queryClient.setQueryData([USER_PROFILE_QUERY_KEY, walletAddress], updatedProfile)
      options.onSuccess?.(updatedProfile)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      options.onError?.(error)
    },
  })
}

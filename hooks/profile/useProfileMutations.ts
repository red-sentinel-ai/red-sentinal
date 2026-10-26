import { useMutation } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import type { Tables } from '@/lib/database.types'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAuth } from '@/context/AuthContext'

type UpdatedProfile = Tables<{ schema: 'sentinel' }, 'ss_users'>

interface UseUpdateProfileOptions {
  onSuccess?: (data: UpdatedProfile) => void
  onError?: (error: Error) => void
}

export function useUpdateProfile(options: UseUpdateProfileOptions = {}) {
  const { address: walletAddress } = useConnectedAddress()
  const { refreshProfile } = useAuth()

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
    onSuccess: async updatedProfile => {
      toast.success('Profile updated successfully!')
      await refreshProfile()
      options.onSuccess?.(updatedProfile)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      options.onError?.(error)
    },
  })
}

export function useUpdateAvatar(options: UseUpdateProfileOptions = {}) {
  const { address: walletAddress } = useConnectedAddress()
  const { refreshProfile } = useAuth()

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
      return (await response.json()).data as UpdatedProfile
    },
    onSuccess: async updatedProfile => {
      toast.success('Profile picture updated!')
      await refreshProfile()
      options.onSuccess?.(updatedProfile)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      options.onError?.(error)
    },
  })
}

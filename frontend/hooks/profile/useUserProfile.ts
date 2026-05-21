import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Tables } from '@/lib/database.types'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAuth } from '@/context/AuthContext'

type UserProfile = Tables<{ schema: 'sentinel' }, 'ss_users'>

export const USER_PROFILE_QUERY_KEY = 'userProfile'

// Returns the authenticated user's profile from AuthContext.
// Profile creation/login now happens entirely through the backend
// /auth/wallet-connect flow (signature-verified), not get-or-create.
export function useUserProfile() {
  const { user, isLoading } = useAuth()
  const { address: walletAddress, chain } = useConnectedAddress()

  // Map the AuthContext UserProfile shape to the Supabase ss_users shape
  // that the rest of the app expects. Both have the same core fields.
  const data = user
    ? ({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        email: user.email,
        total_points: user.total_points,
        lifetime_points: user.lifetime_points,
        rewards_tier: user.rewards_tier,
        email_notifications: user.email_notifications,
        created_at: user.created_at,
      } as unknown as UserProfile)
    : null

  return {
    data,
    isLoading,
    // Expose query-compatible shape so callers don't need to change
    error: null,
    walletAddress,
    chain,
  }
}

interface UseUpdateProfileOptions {
  onSuccess?: (data: UserProfile) => void
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
      return (await response.json()).data as UserProfile
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

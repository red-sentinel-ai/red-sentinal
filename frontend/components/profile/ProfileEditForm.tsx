'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useUserProfile, useUpdateProfile } from '@/hooks/profile/useUserProfile'

interface ProfileEditFormProps {
  onSuccess?: () => void
}

export function ProfileEditForm({ onSuccess }: ProfileEditFormProps) {
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile()

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: () => {
      onSuccess?.()
    },
  })
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [debouncedUsername] = useDebounce(username, 500)

  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setDisplayName(profile.display_name || '')
    }
  }, [profile])

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername === profile?.username) {
        setIsAvailable(null)
        return
      }
      setIsChecking(true)
      const res = await fetch(
        `/api/profile/check-username?name=${debouncedUsername}&userId=${profile?.id}`
      )
      const data = await res.json()
      setIsAvailable(!data.exists)
      setIsChecking(false)
    }
    checkUsername()
  }, [debouncedUsername, profile?.username, profile?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isAvailable === false) return
    updateProfile({ username, displayName })
  }

  if (isLoadingProfile) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-64 w-full"></div>
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isChecking && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
            {isAvailable === true && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isAvailable === false && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          URL-friendly, lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <button
        type="submit"
        disabled={isUpdating || isChecking || isAvailable === false}
        className="w-full bg-white text-black rounded-full py-3 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isUpdating ? <Loader2 className="animate-spin" /> : 'Save Changes'}
      </button>
    </form>
  )
}

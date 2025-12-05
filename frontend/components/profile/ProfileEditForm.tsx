'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { CheckCircle, XCircle, Loader2, ArrowDownToLine } from 'lucide-react'
import { useUpdateProfile } from '@/hooks/profile/useUserProfile'
import type { Tables } from '@/lib/database.types'

type SelectedImage = {
  previewUrl: string
  file: File | null
  isCustom: boolean
  sourceUrl?: string
}

interface ProfileEditFormProps {
  onSuccess?: () => void
  profile: Tables<'ss_users'> | null
  selectedImage: SelectedImage | null
}

export function ProfileEditForm({ onSuccess, profile, selectedImage }: ProfileEditFormProps) {
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
    if (isAvailable === false || isUpdating || isChecking) return

    const formData = new FormData()
    formData.append('displayName', displayName)
    formData.append('username', username)

    if (selectedImage) {
      if (selectedImage.isCustom && selectedImage.file) {
        formData.append('imageFile', selectedImage.file)
      } else if (selectedImage.sourceUrl) {
        formData.append('imageUrl', selectedImage.sourceUrl)
      }
    }

    updateProfile(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="block text-base font-medium mb-2">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full bg-white border border-[#5E5E5E] p-3 rounded-xl"
        />
      </div>

      <div>
        <label className="block text-base font-medium mb-2">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="w-full bg-white border border-[#5E5E5E] p-3 rounded-xl pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isChecking && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
            {isAvailable === true && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isAvailable === false && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
        <p className="mt-2 text-sm text-[#5E5E5E]">
          URL-friendly, lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <button
        type="submit"
        disabled={isUpdating || isChecking || isAvailable === false}
        className="btn btn-black w-full !min-h-[50px]"
      >
        {isUpdating ? <Loader2 className="animate-spin" />  :  <ArrowDownToLine />}
        <span className='ms-2'>Save Changes</span>
      </button>
    </form>
  )
}

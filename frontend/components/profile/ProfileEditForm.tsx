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
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [debouncedUsername] = useDebounce(username, 500)

  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setDisplayName(profile.display_name || '')
      setEmail(profile.email || '')
      setEmailNotifications(profile.email_notifications ?? false)
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
    formData.append('email', email)
    formData.append('emailNotifications', String(emailNotifications))

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-base font-medium">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-[#5E5E5E] bg-white p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-base font-medium">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="w-full rounded-xl border border-[#5E5E5E] bg-white p-3 pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isChecking && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
            {isAvailable === true && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isAvailable === false && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
        <p className="mt-2 text-sm text-[#5E5E5E]">
          URL-friendly, lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-base font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#5E5E5E] bg-white p-3"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={e => setEmailNotifications(e.target.checked)}
          className="h-5 w-5 rounded border-[#5E5E5E] accent-black"
        />
        <span className="text-sm text-[#5E5E5E]">
          Receive emails when new sentinels are deployed
        </span>
      </label>

      <button
        type="submit"
        disabled={isUpdating || isChecking || isAvailable === false}
        className="btn btn-black !min-h-[50px] w-full"
      >
        {isUpdating ? <Loader2 className="animate-spin" /> : <ArrowDownToLine />}
        <span className="ms-2">Save Changes</span>
      </button>
    </form>
  )
}

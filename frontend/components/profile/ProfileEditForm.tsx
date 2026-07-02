'use client'
import { useState, useEffect } from 'react'
import { Loader2, ArrowDownToLine } from 'lucide-react'
import { useUpdateProfile } from '@/hooks/profile/useProfileMutations'
import type { UserProfile } from '@/lib/auth-api'

type SelectedImage = {
  previewUrl: string
  file: File | null
  isCustom: boolean
  sourceUrl?: string
}

interface ProfileEditFormProps {
  onSuccess?: () => void
  profile: UserProfile | null
  selectedImage: SelectedImage | null
}

export function ProfileEditForm({ onSuccess, profile, selectedImage }: ProfileEditFormProps) {
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: () => {
      onSuccess?.()
    },
  })
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isUpdating || !displayName.trim()) return

    const formData = new FormData()
    formData.append('displayName', displayName.trim())

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">Username</label>
        <input
          type="text"
          value={profile?.username ? `@${profile.username}` : ''}
          readOnly
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-text-muted)]"
        />
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Your username is permanent and can&apos;t be changed.
        </p>
      </div>

      <button
        type="submit"
        disabled={isUpdating || !displayName.trim()}
        className="btn btn-black h-8 w-full text-xs"
      >
        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
        <span className="ms-1.5">Save Changes</span>
      </button>
    </form>
  )
}

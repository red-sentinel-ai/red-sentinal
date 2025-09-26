'use client'

import { useState } from 'react'
import { X, User, Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Dialog } from '@/components/Dialog'
import { ProfileEditForm } from './ProfileEditForm'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import type { Tables } from '@/lib/database.types'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  profile: Tables<'ss_users'> | null
}

export function EditProfileModal({ open, onClose, profile }: EditProfileModalProps) {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar({
    onSuccess: () => setIsImagePickerOpen(false),
  })

  const handleImageSelect = (img: { url: string; isCustom: boolean; file?: File | null }) => {
    const formData = new FormData()
    if (img.isCustom && img.file) {
      formData.append('image', img.file)
    } else {
      formData.append('image_url', img.url)
    }
    updateAvatar(formData)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center">
            <div
              className="relative w-24 h-24 rounded-full border-2 border-gray-600 overflow-hidden cursor-pointer group"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {isUpdatingAvatar ? (
                <div className="w-full h-full flex items-center justify-center bg-black/70">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="User Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-foreground/20 flex items-center justify-center">
                  <User className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
            </div>
          </div>

          <ProfileEditForm onSuccess={onClose} />
        </div>
      </Dialog>

      <ImagePickerSheet
        open={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleImageSelect}
        title="Select Profile Image"
        subtitle="Choose a new avatar for your profile."
      />
    </>
  )
}

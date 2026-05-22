'use client'

import { useState } from 'react'
import { X, User, Camera } from 'lucide-react'
import Image from 'next/image'
import { Dialog } from '@/components/Dialog'
import { ProfileEditForm } from './ProfileEditForm'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import type { Tables } from '@/lib/database.types'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants/asset_paths'

type SelectedImage = {
  previewUrl: string
  file: File | null
  isCustom: boolean
  sourceUrl?: string
}

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  profile: Tables<{ schema: 'sentinel' }, 'ss_users'> | null
}

export function EditProfileModal({ open, onClose, profile }: EditProfileModalProps) {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)

  const handleImageSelect = (img: { url: string; isCustom: boolean; file?: File | null }) => {
    setSelectedImage({
      previewUrl: img.url,
      file: img.file || null,
      isCustom: img.isCustom,
      sourceUrl: img.isCustom ? undefined : img.url,
    })
    setIsImagePickerOpen(false)
  }

  const handleClose = () => {
    setSelectedImage(null)
    onClose()
  }

  const displayAvatarUrl = selectedImage?.previewUrl || profile?.avatar_url

  return (
    <>
      <Dialog open={open} onClose={handleClose} className="max-w-sm bg-[var(--color-bg-elevated)]/90">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Edit Profile</h2>
            <button onClick={handleClose} className="text-[var(--color-text-primary)]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center">
            <div
              className="group relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border border-[var(--color-border-default)]"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {displayAvatarUrl ? (
                <Image src={displayAvatarUrl} alt="User Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-subtle)]">
                  <User className="h-8 w-8 text-[var(--color-text-muted)]" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-text-primary)]/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-[var(--color-bg-surface)]" />
              </div>
            </div>
          </div>

          <ProfileEditForm
            onSuccess={handleClose}
            profile={profile}
            selectedImage={selectedImage}
          />
        </div>
      </Dialog>

      <ImagePickerSheet
        open={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectImage={handleImageSelect}
        title="Select Profile Image"
        subtitle="Your selection will be saved when you update your profile."
        imageArray={USER_IMAGES}
        gifArray={SENTINEL_GIFS}
        disableGifs={true}
      />
    </>
  )
}

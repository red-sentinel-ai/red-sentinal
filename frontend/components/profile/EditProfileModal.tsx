'use client'

import { useState } from 'react'
import { X, User, Camera } from 'lucide-react'
import Image from 'next/image'
import { Dialog } from '@/components/Dialog'
import { ProfileEditForm } from './ProfileEditForm'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import type { Tables } from '@/lib/database.types'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants'

type SelectedImage = {
  previewUrl: string
  file: File | null
  isCustom: boolean
  sourceUrl?: string
}

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  profile: Tables<'ss_users'> | null
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
      <Dialog
        open={open}
        onClose={handleClose}
        className="max-w-md bg-white/75"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button
              onClick={handleClose}
              className="text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center">
            <div
              className="relative w-24 h-24 rounded-full border-2 border-gray-600 overflow-hidden cursor-pointer group"
              onClick={() => setIsImagePickerOpen(true)}
            >
              {displayAvatarUrl ? (
                <Image
                  src={displayAvatarUrl}
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

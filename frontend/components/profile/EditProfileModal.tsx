'use client'

import { X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'
import { ProfileEditForm } from './ProfileEditForm'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ProfileEditForm onSuccess={onClose} />
      </div>
    </Dialog>
  )
}

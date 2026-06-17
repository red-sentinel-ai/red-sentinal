'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Copy, Check, Loader2 } from 'lucide-react'

import {
  cn,
  truncateAddress,
  detectChainFromAddress,
  generateAvatarUrl,
} from '@/lib/utils'
import { getExplorerAddressUrl } from '@/lib/explorer'
import { SENTINEL_GIFS, USER_IMAGES } from '@/constants/asset_paths'
import { useUserProfile, useUpdateAvatar } from '@/hooks/profile/useUserProfile'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { EditProfileModal } from './EditProfileModal'
import { FollowButton } from './FollowButton'
import { FollowStats } from './FollowStats'
import type { ProfileViewData } from '@/types/Profile'

interface ProfileHeaderProps {
  profile: ProfileViewData
  isOwner: boolean
  primaryWallet?: string
}

export function ProfileHeader({ profile, isOwner, primaryWallet }: ProfileHeaderProps) {
  const pathname = usePathname()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // The connected user's full profile — only used (and only correct) when the
  // viewer owns this profile, so EditProfileModal gets the editable ss_users row
  // and the avatar reflects edits live without waiting on the prop to refetch.
  const { data: authProfile } = useUserProfile()
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar({
    onSuccess: () => setIsImagePickerOpen(false),
  })

  const liveOwnerAvatar = isOwner ? authProfile?.avatar_url : null
  const generatedAvatar = generateAvatarUrl(primaryWallet || profile.userId)
  const avatarUrl = liveOwnerAvatar ?? profile.avatarUrl ?? generatedAvatar

  const displayName = profile.displayName || profile.username || 'Operator'
  const isOnPublicRoute = pathname?.startsWith('/u/')

  const handleImageSelect = (img: { url: string; isCustom: boolean; file?: File | null }) => {
    setIsImagePickerOpen(false)
    const formData = new FormData()
    if (img.isCustom && img.file) {
      formData.append('image', img.file)
    } else {
      formData.append('image_url', img.url)
    }
    updateAvatar(formData)
  }

  const handleCopyAddress = async () => {
    if (!primaryWallet) return
    await navigator.clipboard.writeText(primaryWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mb-8 flex flex-col items-start gap-6 py-6 md:flex-row md:gap-10">
      {/* Square Avatar — editable for the owner only */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'group relative h-28 w-28 overflow-hidden border border-[var(--color-border-strong)] p-0.5 md:h-32 md:w-32',
            isOwner && 'cursor-pointer'
          )}
          onClick={isOwner ? () => setIsImagePickerOpen(true) : undefined}
        >
          {isUpdatingAvatar ? (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-surface)]/70">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-primary)]" />
            </div>
          ) : (
            <Image
              src={avatarUrl}
              alt={`${displayName} avatar`}
              fill
              className="object-cover brightness-90 transition-all duration-700"
            />
          )}
          {isOwner && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-text-primary)]/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-8 w-8 text-[var(--color-bg-surface)]" />
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Name and Actions Row */}
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-bold uppercase leading-none tracking-wide text-[var(--color-text-primary)] md:text-4xl">
              {displayName}
            </h1>
            {profile.rewardsTier && (
              <div className="border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-1">
                <span className="text-[9px] font-bold uppercase tracking-[2px] text-[var(--color-text-secondary)]">
                  {profile.rewardsTier}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isOwner ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="button-ghost-terminal px-5 py-2"
                >
                  Edit
                </button>
                {profile.username && !isOnPublicRoute && (
                  <Link href={`/u/${profile.username}`}>
                    <button className="button-ghost-terminal px-5 py-2 opacity-60 hover:opacity-100">
                      View Public
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <FollowButton targetUserId={profile.userId} />
            )}
          </div>
        </div>

        {/* Meta Info Row */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          {primaryWallet && (
            <div className="flex flex-col gap-0.5">
              <span className="industrial-label">Wallet Address</span>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <span className="text-xs font-bold tracking-wide text-[var(--color-text-primary)]">
                      {truncateAddress(primaryWallet)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-[var(--color-text-muted)] opacity-40 transition-opacity hover:opacity-100"
                      aria-label="Copy wallet address"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-[var(--color-success)]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </>
                ) : (
                  <Link
                    href={getExplorerAddressUrl(
                      primaryWallet,
                      detectChainFromAddress(primaryWallet)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold tracking-wide text-[var(--color-info)] hover:underline"
                  >
                    {truncateAddress(primaryWallet)}
                  </Link>
                )}
              </div>
            </div>
          )}

          <FollowStats identifier={profile.userId} />
        </div>
      </div>

      {isOwner && (
        <>
          <EditProfileModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={authProfile}
          />
          <ImagePickerSheet
            open={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            onSelectImage={handleImageSelect}
            title="Select Profile Image"
            subtitle="Choose a new avatar from our collection or upload your own."
            imageArray={USER_IMAGES}
            gifArray={SENTINEL_GIFS}
            disableGifs={true}
          />
        </>
      )}
    </section>
  )
}

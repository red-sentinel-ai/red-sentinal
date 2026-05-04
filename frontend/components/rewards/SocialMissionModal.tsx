'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, CheckCircle, Loader2, Upload, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import type { RewardsMission } from '@/types/Rewards'
import {
  SUI_SENTINEL_CHECKOUT_URL,
  SUI_SENTINEL_TELEGRAM_URL,
  SUI_SENTINEL_X_URL,
  APP_NETWORK,
} from '@/constants'

interface SocialMissionModalProps {
  mission: RewardsMission | null
  isOpen: boolean
  onClose: () => void
  actionUrlOverride?: string
  actionLabelOverride?: string
  submissionContext?: { agent_path?: string }
}

const MISSION_CONFIG = {
  follow_x: {
    title: 'Follow Red Sentinel on X',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Follow @redsentinel_ai on X to earn Sentinel tokens.',
    actionLabel: 'Follow on X',
    actionUrl: SUI_SENTINEL_X_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: true,
    },
    contentLinkField: null,
    telegramField: null,
    submitHint: 'Enter your Twitter/X username so we can verify you followed us.',
  },
  retweet: {
    title: 'Retweet a Red Sentinel Post',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Retweet any post from @redsentinel_ai and paste the URL of your retweet.',
    actionLabel: 'Go to @redsentinel_ai',
    actionUrl: SUI_SENTINEL_X_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: false,
    },
    contentLinkField: {
      label: 'Your Retweet URL',
      placeholder: 'https://x.com/yourusername/status/...',
      required: true,
    },
    telegramField: null,
    submitHint:
      'Paste the URL of your retweet. Optionally add your username for faster verification.',
  },
  share_with_hashtag: {
    title: 'Share with #RedSentinel',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Post about Red Sentinel with #RedSentinel and paste the URL of your tweet.',
    actionLabel: 'Post on X',
    actionUrl: SUI_SENTINEL_CHECKOUT_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: false,
    },
    contentLinkField: {
      label: 'Your Tweet URL',
      placeholder: 'https://x.com/yourusername/status/...',
      required: true,
    },
    telegramField: null,
    submitHint: 'Paste the URL of your tweet containing #RedSentinel.',
  },
  join_telegram: {
    title: 'Join Red Sentinel Telegram',
    icon: '/icons/telegram_black.png',
    iconAlt: 'Telegram',
    instructions: 'Join our Telegram community and enter your Telegram username for verification.',
    actionLabel: 'Join Telegram',
    actionUrl: SUI_SENTINEL_TELEGRAM_URL,
    usernameField: null,
    contentLinkField: null,
    telegramField: {
      label: 'Your Telegram Username',
      placeholder: '@yourusername',
      required: true,
    },
    submitHint: 'Enter your Telegram username so we can verify you joined the group.',
  },
  share_content: {
    title: 'Share Red Sentinel Content',
    icon: '/icons/x_black.png',
    iconAlt: 'Share',
    instructions: 'Create content about Red Sentinel (article, video, thread, etc.) and share the link.',
    actionLabel: 'Create Content',
    actionUrl: SUI_SENTINEL_X_URL,
    usernameField: {
      label: 'Your Username (optional)',
      placeholder: '@yourusername',
      required: false,
    },
    contentLinkField: {
      label: 'Content Link',
      placeholder: 'https://... (tweet, article, video, etc.)',
      required: true,
    },
    telegramField: null,
    submitHint: 'Paste the link to your content about Red Sentinel (can be a tweet, article, video, etc.).',
  },
} as const

type MissionType = keyof typeof MISSION_CONFIG

export function SocialMissionModal({
  mission,
  isOpen,
  onClose,
  actionUrlOverride,
  actionLabelOverride,
  submissionContext,
}: SocialMissionModalProps) {
  const account = useCurrentAccount()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [twitterUsername, setTwitterUsername] = useState('')
  const [telegramUsername, setTelegramUsername] = useState('')
  const [contentLink, setContentLink] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const missionType = mission?.type as MissionType | undefined
  const config = missionType ? MISSION_CONFIG[missionType] : null

  const handleClose = () => {
    setTwitterUsername('')
    setTelegramUsername('')
    setContentLink('')
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setIsSubmitted(false)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be under 5MB')
      return
    }

    setScreenshotFile(file)
    const reader = new FileReader()
    reader.onload = () => setScreenshotPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile || !account?.address || !missionType) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', screenshotFile)
      formData.append('wallet_address', account.address)
      formData.append('mission_type', missionType)

      const res = await fetch('/api/rewards/upload-screenshot', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return data.url as string
    } catch (err) {
      console.error('Screenshot upload failed:', err)
      toast.error('Failed to upload screenshot')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first')
      return
    }
    if (!missionType || !config) return

    // Validation
    if (config.contentLinkField?.required && !contentLink.trim()) {
      toast.error('Please enter the content link')
      return
    }
    if (config.usernameField?.required && !twitterUsername.trim()) {
      toast.error('Please enter your username')
      return
    }
    if (config.telegramField?.required && !telegramUsername.trim()) {
      toast.error('Please enter your Telegram username')
      return
    }

    setIsSubmitting(true)
    try {
      let screenshotUrl: string | null = null
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot()
        if (!screenshotUrl) {
          setIsSubmitting(false)
          return
        }
      }

      const body: Record<string, string> = {
        wallet_address: account.address,
        mission_type: missionType,
        network: APP_NETWORK,
      }
      if (twitterUsername.trim()) body.username = twitterUsername.trim().replace(/^@/, '')
      if (telegramUsername.trim())
        body.telegram_username = telegramUsername.trim().replace(/^@/, '')
      if (contentLink.trim()) body.content_link = contentLink.trim()
      if (screenshotUrl) body.screenshot_url = screenshotUrl
      if (submissionContext?.agent_path) body.agent_path = submissionContext.agent_path

      const res = await fetch('/api/rewards/submit-social-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Submission error:', err)
      toast.error(err.message || 'Failed to submit mission')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mission || !config) return null

  return (
    <Dialog open={isOpen} onClose={handleClose} disableBackdropClick className="max-w-[600px]">
      <div className="w-full rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Image
              src={config.icon}
              width={20}
              height={20}
              alt={config.iconAlt}
              className="md:h-6 md:w-6"
            />
            <h2 className="text-base font-bold text-[var(--color-text-primary)] md:text-lg">{config.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-4 text-center duration-300 animate-in fade-in zoom-in md:space-y-4 md:py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-muted)] md:h-16 md:w-16">
              <CheckCircle className="h-6 w-6 text-[var(--color-success)] md:h-8 md:w-8" />
            </div>
            <div>
              <h3 className="mb-1.5 text-base font-bold text-[var(--color-text-primary)] md:mb-2 md:text-lg">
                Submission Received!
              </h3>
              <p className="mx-auto max-w-xs text-xs text-[var(--color-text-secondary)] md:text-sm">
                Our team will review your submission and send Sentinel tokens to your wallet once
                verified.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-black mt-3 w-full text-sm md:mt-4 md:text-base"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5">
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4">
              <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)] md:text-sm">Step 1</p>
              <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)] md:text-base">{config.instructions}</p>
              <a
                href={actionUrlOverride ?? config.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-black inline-flex h-[34px] items-center gap-1.5 px-4 text-sm md:h-[38px] md:gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {actionLabelOverride ?? config.actionLabel}
              </a>
            </div>

            <div className="border-t border-[var(--color-border-subtle)]" />

            <div>
              <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)] md:text-sm">Step 2</p>
              <p className="mb-3 text-sm font-medium text-[var(--color-text-primary)] md:text-base">Submit proof of completion</p>

              <div className="space-y-3">
                {config.telegramField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                      {config.telegramField.label}{' '}
                      {config.telegramField.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      value={telegramUsername}
                      onChange={e => setTelegramUsername(e.target.value)}
                      placeholder={config.telegramField.placeholder}
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] md:text-sm"
                    />
                  </div>
                )}

                {config.usernameField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                      {config.usernameField.label}{' '}
                      {config.usernameField.required ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">(optional)</span>
                      )}
                    </label>
                    <input
                      value={twitterUsername}
                      onChange={e => setTwitterUsername(e.target.value)}
                      placeholder={config.usernameField.placeholder}
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] md:text-sm"
                    />
                  </div>
                )}

                {config.contentLinkField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                      {config.contentLinkField.label}{' '}
                      {config.contentLinkField.required ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">(optional)</span>
                      )}
                    </label>
                    <input
                      value={contentLink}
                      onChange={e => setContentLink(e.target.value)}
                      placeholder={config.contentLinkField.placeholder}
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] md:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                    Screenshot{' '}
                    <span className="text-[var(--color-text-muted)]">(optional — helpful for mobile)</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors md:p-5 ${
                      screenshotPreview
                        ? 'border-[var(--color-gold-primary)] bg-[var(--color-bg-subtle)]'
                        : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    {screenshotPreview ? (
                      <div className="relative w-full">
                        <Image
                          src={screenshotPreview}
                          width={200}
                          height={200}
                          alt="Screenshot preview"
                          className="mx-auto max-h-32 rounded-md object-contain md:max-h-40"
                        />
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setScreenshotFile(null)
                            setScreenshotPreview(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="absolute right-0 top-0 rounded-full bg-[var(--color-bg-surface)] p-0.5 text-[var(--color-text-muted)] shadow hover:text-[var(--color-text-primary)]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-1.5 h-5 w-5 text-[var(--color-text-muted)] md:h-6 md:w-6" />
                        <p className="text-xs text-[var(--color-text-secondary)] md:text-sm">
                          Click to upload screenshot
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] md:text-xs">
                          PNG, JPG, GIF or WebP up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)] md:text-xs">{config.submitHint}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="btn btn-black flex w-full items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Submitting...'}
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}

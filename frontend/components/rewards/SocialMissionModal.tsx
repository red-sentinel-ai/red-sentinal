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
    title: 'Follow Sui Sentinel on X',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Follow @suisentinal on X to earn Sentinel tokens.',
    actionLabel: 'Follow on X',
    actionUrl: SUI_SENTINEL_X_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: true,
    },
    tweetUrlField: null,
    telegramField: null,
    submitHint: 'Enter your Twitter/X username so we can verify you followed us.',
  },
  retweet: {
    title: 'Retweet a Sui Sentinel Post',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Retweet any post from @suisentinal and paste the URL of your retweet.',
    actionLabel: 'Go to @suisentinal',
    actionUrl: SUI_SENTINEL_X_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: false,
    },
    tweetUrlField: {
      label: 'Your Retweet URL',
      placeholder: 'https://x.com/yourusername/status/...',
      required: true,
    },
    telegramField: null,
    submitHint:
      'Paste the URL of your retweet. Optionally add your username for faster verification.',
  },
  share_with_hashtag: {
    title: 'Share with #SuiSentinel',
    icon: '/icons/x_black.png',
    iconAlt: 'X',
    instructions: 'Post about Sui Sentinel with #SuiSentinel and paste the URL of your tweet.',
    actionLabel: 'Post on X',
    actionUrl: SUI_SENTINEL_CHECKOUT_URL,
    usernameField: {
      label: 'Your Twitter/X Username',
      placeholder: '@yourusername',
      required: false,
    },
    tweetUrlField: {
      label: 'Your Tweet URL',
      placeholder: 'https://x.com/yourusername/status/...',
      required: true,
    },
    telegramField: null,
    submitHint: 'Paste the URL of your tweet containing #SuiSentinel.',
  },
  join_telegram: {
    title: 'Join Sui Sentinel Telegram',
    icon: '/icons/telegram_black.png',
    iconAlt: 'Telegram',
    instructions: 'Join our Telegram community and enter your Telegram username for verification.',
    actionLabel: 'Join Telegram',
    actionUrl: SUI_SENTINEL_TELEGRAM_URL,
    usernameField: null,
    tweetUrlField: null,
    telegramField: {
      label: 'Your Telegram Username',
      placeholder: '@yourusername',
      required: true,
    },
    submitHint: 'Enter your Telegram username so we can verify you joined the group.',
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
  const [tweetUrl, setTweetUrl] = useState('')
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
    setTweetUrl('')
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
    if (config.tweetUrlField?.required && !tweetUrl.trim()) {
      toast.error('Please enter the tweet URL')
      return
    }
    if (
      config.tweetUrlField?.required &&
      !tweetUrl.includes('twitter.com') &&
      !tweetUrl.includes('x.com')
    ) {
      toast.error('Please enter a valid X (Twitter) URL')
      return
    }
    if (config.usernameField?.required && !twitterUsername.trim()) {
      toast.error('Please enter your Twitter/X username')
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
      if (twitterUsername.trim()) body.twitter_username = twitterUsername.trim().replace(/^@/, '')
      if (telegramUsername.trim())
        body.telegram_username = telegramUsername.trim().replace(/^@/, '')
      if (tweetUrl.trim()) body.tweet_url = tweetUrl.trim()
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
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="w-full rounded-xl bg-white text-black md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Image
              src={config.icon}
              width={20}
              height={20}
              alt={config.iconAlt}
              className="md:h-6 md:w-6"
            />
            <h2 className="text-base font-bold md:text-lg">{config.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 transition-colors hover:text-black"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-4 text-center duration-300 animate-in fade-in zoom-in md:space-y-4 md:py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 md:h-16 md:w-16">
              <CheckCircle className="h-6 w-6 text-green-600 md:h-8 md:w-8" />
            </div>
            <div>
              <h3 className="mb-1.5 text-base font-bold text-black md:mb-2 md:text-lg">
                Submission Received!
              </h3>
              <p className="mx-auto max-w-xs text-xs text-gray-600 md:text-sm">
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
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 md:text-sm">Step 1</p>
              <p className="mb-2 text-sm font-medium md:text-base">{config.instructions}</p>
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

            <div className="border-t border-gray-200" />

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 md:text-sm">Step 2</p>
              <p className="mb-3 text-sm font-medium md:text-base">Submit proof of completion</p>

              <div className="space-y-3">
                {config.telegramField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                      {config.telegramField.label}{' '}
                      {config.telegramField.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      value={telegramUsername}
                      onChange={e => setTelegramUsername(e.target.value)}
                      placeholder={config.telegramField.placeholder}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:text-sm"
                    />
                  </div>
                )}

                {config.usernameField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                      {config.usernameField.label}{' '}
                      {config.usernameField.required ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-gray-400">(optional)</span>
                      )}
                    </label>
                    <input
                      value={twitterUsername}
                      onChange={e => setTwitterUsername(e.target.value)}
                      placeholder={config.usernameField.placeholder}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:text-sm"
                    />
                  </div>
                )}

                {config.tweetUrlField && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                      {config.tweetUrlField.label}{' '}
                      {config.tweetUrlField.required ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-gray-400">(optional)</span>
                      )}
                    </label>
                    <input
                      value={tweetUrl}
                      onChange={e => setTweetUrl(e.target.value)}
                      placeholder={config.tweetUrlField.placeholder}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                    Screenshot{' '}
                    <span className="text-gray-400">(optional — helpful for mobile)</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors md:p-5 ${
                      screenshotPreview
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                          className="absolute right-0 top-0 rounded-full bg-white p-0.5 text-gray-500 shadow hover:text-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-1.5 h-5 w-5 text-gray-400 md:h-6 md:w-6" />
                        <p className="text-xs text-gray-500 md:text-sm">
                          Click to upload screenshot
                        </p>
                        <p className="text-[10px] text-gray-400 md:text-xs">
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

                <p className="text-[10px] text-gray-400 md:text-xs">{config.submitHint}</p>
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

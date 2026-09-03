'use client'

import { useState, useRef } from 'react'
import { X, CheckCircle, Loader2, Upload, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import type { EarnMission } from '@/types/Earn'
import { APP_NETWORK, BOOSTER_TIERS, MISSION_STEP1_CONFIG } from '@/constants'
import Image from 'next/image'

interface ContentSubmissionModalProps {
  mission: EarnMission | null
  isOpen: boolean
  onClose: () => void
}

export function ContentSubmissionModal({ mission, isOpen, onClose }: ContentSubmissionModalProps) {
  const account = useCurrentAccount()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [contentUrl, setContentUrl] = useState('')
  const [description, setDescription] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleClose = () => {
    setContentUrl('')
    setDescription('')
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
    if (!screenshotFile || !account?.address || !mission?.id) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', screenshotFile)
      formData.append('wallet_address', account.address)
      formData.append('mission_type', mission.id)

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
    if (!mission) return

    if (!contentUrl.trim()) {
      toast.error('Please enter the content URL')
      return
    }

    // Basic URL validation
    try {
      new URL(contentUrl)
    } catch {
      toast.error('Please enter a valid URL')
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

      // Submit to the social mission endpoint
      const res = await fetch('/api/rewards/submit-social-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: account.address,
          mission_type: mission.id,
          network: APP_NETWORK,
          content_link: contentUrl,
          description: description.trim() || undefined,
          screenshot_url: screenshotUrl || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      setIsSubmitted(true)
      toast.success('Content submitted for review!')
    } catch (err: any) {
      console.error('Submission error:', err)
      toast.error(err.message || 'Failed to submit content')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mission) return null

  const tierInfo = BOOSTER_TIERS[mission.boosterTier]

  const step1 = MISSION_STEP1_CONFIG[mission.id] ?? {
    heading: `Create your content about Red Sentinel`,
    hint: "Share accurate information and showcase the platform's features.",
    urlPlaceholder: 'https://...',
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} disableBackdropClick className="max-w-[600px]">
      <div className="w-full rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg px-2 py-1 ${tierInfo.bgColor}`}>
              <span className={`text-sm font-semibold ${tierInfo.textColor}`}>
                {mission.multiplier}x {tierInfo.name}
              </span>
            </div>
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)] md:text-lg">
              {mission.title}
            </h2>
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
              <h3 className="font-display mb-1.5 text-base font-bold text-[var(--color-text-primary)] md:mb-2 md:text-lg">
                Submission Received!
              </h3>
              <p className="font-body mx-auto max-w-xs text-xs text-[var(--color-text-muted)] md:text-sm">
                Our team will review your content within 48 hours. Quality content earns you a{' '}
                {mission.multiplier}x {tierInfo.name} Spin Pass.
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
            {/* Mission Description */}
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4">
              <p className="font-body text-sm text-[var(--color-text-muted)]">
                {mission.description}
              </p>
              {mission.requirements.description && (
                <p className="font-body mt-2 text-xs text-[var(--color-text-muted)]">
                  Requirements: {mission.requirements.description}
                </p>
              )}
            </div>

            <div className="border-t border-[var(--color-border-subtle)]" />

            {/* Step 1: Mission-specific action */}
            <div>
              <p className="font-body mb-1 text-xs font-medium text-[var(--color-text-muted)] md:text-sm">
                Step 1
              </p>
              <p className="font-body mb-2 text-sm font-medium text-[var(--color-text-primary)] md:text-base">
                {step1.heading}
              </p>
              <p className="font-body mb-3 text-xs text-[var(--color-text-muted)]">{step1.hint}</p>
              {step1.actionLabel && step1.actionUrl && (
                <a
                  href={step1.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-black inline-flex h-[34px] items-center gap-1.5 px-4 text-sm md:h-[38px] md:gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {step1.actionLabel}
                </a>
              )}
            </div>

            <div className="border-t border-[var(--color-border-subtle)]" />

            {/* Step 2: Submit Link */}
            <div>
              <p className="font-body mb-1 text-xs font-medium text-[var(--color-text-muted)] md:text-sm">
                Step 2
              </p>
              <p className="font-body mb-3 text-sm font-medium text-[var(--color-text-primary)] md:text-base">
                Submit your content link
              </p>

              <div className="space-y-3">
                {/* Content URL */}
                <div>
                  <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                    Content URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      value={contentUrl}
                      onChange={e => setContentUrl(e.target.value)}
                      placeholder={step1.urlPlaceholder}
                      className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] py-2 pl-10 pr-3 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
                    />
                  </div>
                  <p className="font-body mt-1 text-[11px] text-[var(--color-text-muted)] md:text-xs">
                    Supported: YouTube, Twitter, Substack, Medium, Google Docs, Notion, and more
                  </p>
                </div>

                {/* Optional Description */}
                <div>
                  <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                    Additional Notes{' '}
                    <span className="text-[var(--color-text-muted)]">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Any additional context for reviewers..."
                    rows={2}
                    className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                    Screenshot <span className="text-[var(--color-text-muted)]">(optional)</span>
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
                        <p className="font-body text-xs text-[var(--color-text-muted)] md:text-sm">
                          Click to upload screenshot
                        </p>
                        <p className="font-body text-[11px] text-[var(--color-text-muted)] md:text-xs">
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
                <>
                  <ExternalLink className="h-4 w-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}

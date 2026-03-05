'use client'

import { useState, useRef } from 'react'
import { X, CheckCircle, Loader2, Upload, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import type { EarnMission } from '@/types/Earn'
import { BOOSTER_TIERS } from '@/constants'
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
          network: 'testnet',
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

  // Determine content type for better UX messaging
  const getContentTypeInfo = () => {
    const id = mission.id.toLowerCase()
    if (id.includes('video')) return { type: 'video', placeholder: 'https://youtube.com/watch?v=... or https://twitter.com/...' }
    if (id.includes('article')) return { type: 'article', placeholder: 'https://substack.com/... or https://medium.com/...' }
    if (id.includes('thread')) return { type: 'thread', placeholder: 'https://twitter.com/username/status/...' }
    if (id.includes('infographic')) return { type: 'image', placeholder: 'https://twitter.com/... or image hosting URL' }
    if (id.includes('translation')) return { type: 'document', placeholder: 'https://docs.google.com/... or https://notion.so/...' }
    return { type: 'content', placeholder: 'https://...' }
  }

  const contentTypeInfo = getContentTypeInfo()

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="w-full rounded-xl bg-white text-black md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg px-2 py-1 ${tierInfo.bgColor}`}>
              <span className={`text-sm font-bold ${tierInfo.textColor}`}>
                {mission.multiplier}x {tierInfo.name}
              </span>
            </div>
            <h2 className="text-base font-bold md:text-lg">{mission.title}</h2>
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
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">{mission.description}</p>
              {mission.requirements.description && (
                <p className="mt-2 text-xs text-gray-500">
                  Requirements: {mission.requirements.description}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200" />

            {/* Step 1: Create Content */}
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 md:text-sm">Step 1</p>
              <p className="mb-2 text-sm font-medium md:text-base">
                Create your {contentTypeInfo.type} about Sui Sentinel
              </p>
              <p className="text-xs text-gray-500">
                Share accurate information and showcase the platform&apos;s features
              </p>
            </div>

            <div className="border-t border-gray-200" />

            {/* Step 2: Submit Link */}
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 md:text-sm">Step 2</p>
              <p className="mb-3 text-sm font-medium md:text-base">Submit your content link</p>

              <div className="space-y-3">
                {/* Content URL */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                    Content URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={contentUrl}
                      onChange={e => setContentUrl(e.target.value)}
                      placeholder={contentTypeInfo.placeholder}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400 md:text-xs">
                    Supported: YouTube, Twitter, Substack, Medium, Google Docs, Notion, and more
                  </p>
                </div>

                {/* Optional Description */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                    Additional Notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Any additional context for reviewers..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:text-sm"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 md:text-sm">
                    Screenshot <span className="text-gray-400">(optional)</span>
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
                        <p className="text-xs text-gray-500 md:text-sm">Click to upload screenshot</p>
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

'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, ImagePlus, Loader2, X, XCircle } from 'lucide-react'
import { SUI_SENTINEL_SUPPORT_EMAIL } from '@/constants'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024

export const SupportForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { address, chain } = useConnectedAddress()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Revoke the current (or replaced) blob URL so previews don't leak memory.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Screenshots must be image files (PNG, JPG, WebP, or GIF).')
      return
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError('Screenshot is too large. Please pick an image under 5MB.')
      return
    }

    setError(null)
    setScreenshot(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearScreenshot = () => {
    setScreenshot(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) {
      setError('A short subject is required.')
      return
    }
    if (!description.trim()) {
      setError('A description is required.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('subject', subject.trim())
      formData.append('description', description.trim())
      if (email.trim()) formData.append('email', email.trim())
      if (address) {
        formData.append('walletAddress', address)
        formData.append('chain', chain)
      }
      if (screenshot) formData.append('screenshot', screenshot)

      const response = await fetch('/api/support', { method: 'POST', body: formData })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit your request')
      }

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        setIsSuccess(false)
        setSubject('')
        setDescription('')
        setEmail('')
        clearScreenshot()
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">We got it!</h3>
        <p className="text-[var(--color-text-secondary)]">
          Our team has been notified and will get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {address && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2">
          <p className="text-xs text-[var(--color-text-muted)]">
            Reporting as{' '}
            <span className="font-mono text-[var(--color-text-secondary)]">{address}</span> ({chain}
            )
          </p>
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="support-subject"
          className="text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm"
        >
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="support-subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={140}
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-2 text-sm text-[var(--color-text-primary)] sm:text-base"
          placeholder="Briefly, what happened?"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="support-description"
          className="text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="support-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-2 text-sm text-[var(--color-text-primary)] sm:text-base"
          placeholder="Walk us through what you did, what you expected, and what went wrong."
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm">
          Screenshot (Optional)
        </label>
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="max-h-40 w-full object-contain"
            />
            <button
              type="button"
              onClick={clearScreenshot}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition-colors hover:bg-black"
              aria-label="Remove screenshot"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-white"
          >
            <ImagePlus className="h-4 w-4" />
            Attach a screenshot (max 5MB)
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleScreenshotChange}
          className="hidden"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="support-email"
          className="text-xs font-medium text-[var(--color-text-secondary)] sm:text-sm"
        >
          Email (Optional)
        </label>
        <input
          id="support-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-2 text-sm text-[var(--color-text-primary)] sm:text-base"
          placeholder="So we can reply to you"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-100 p-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-black flex w-full items-center justify-center"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
      </button>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Prefer email? Reach us at{' '}
        <a
          href={`mailto:${SUI_SENTINEL_SUPPORT_EMAIL}`}
          className="underline transition-colors hover:text-white"
        >
          {SUI_SENTINEL_SUPPORT_EMAIL}
        </a>
      </p>
    </form>
  )
}

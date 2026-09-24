'use client'

import { useState } from 'react'
import { X, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'

interface BugReportFormProps {
  isOpen: boolean
  onClose: () => void
  isCritical?: boolean
}

export function BugReportForm({ isOpen, onClose, isCritical = false }: BugReportFormProps) {
  const account = useCurrentAccount()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reproSteps, setReproSteps] = useState('')
  const [url, setUrl] = useState('')
  const [severity, setSeverity] = useState<'bug' | 'critical' | 'security'>(
    isCritical ? 'critical' : 'bug'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setReproSteps('')
    setUrl('')
    setSeverity(isCritical ? 'critical' : 'bug')
    setIsSubmitted(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call when endpoint is ready
      // const response = await fetch('/api/rewards/submit-bug-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     wallet_address: account.address,
      //     title,
      //     description,
      //     reproduction_steps: reproSteps,
      //     url,
      //     severity,
      //   }),
      // })
      // if (!response.ok) throw new Error('Failed to submit bug report')

      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
      toast.success('Bug report submitted successfully!')
    } catch (err: any) {
      console.error('Bug report error:', err)
      toast.error(err.message || 'Failed to submit bug report')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="w-full rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] md:rounded-2xl">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-red-600' : 'text-[var(--color-gold-primary)]'}`} />
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)] md:text-lg">
              {isCritical ? 'Report Critical Bug / Security Issue' : 'Report Bug'}
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
                Report Submitted!
              </h3>
              <p className="font-body mx-auto max-w-xs text-xs text-[var(--color-text-secondary)] md:text-sm">
                Our team will review your bug report and award Spin Passes once verified.
                {isCritical && ' Critical bugs receive Divine Spin Passes (100x booster).'}
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
            {/* Title */}
            <div>
              <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                Bug Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Brief description of the bug"
                className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of the bug and its impact"
                rows={4}
                className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
              />
            </div>

            {/* Reproduction Steps */}
            <div>
              <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                Reproduction Steps
              </label>
              <textarea
                value={reproSteps}
                onChange={e => setReproSteps(e.target.value)}
                placeholder="Step-by-step instructions to reproduce the bug"
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
              />
            </div>

            {/* URL */}
            <div>
              <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                URL or Screenshot <span className="text-[var(--color-text-muted)]">(optional)</span>
              </label>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Link to screenshot or affected page"
                className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="font-body mb-1 block text-xs font-medium text-[var(--color-text-secondary)] md:text-sm">
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)] md:text-sm"
              >
                <option value="bug">Bug (25x Legendary Spin Pass)</option>
                <option value="critical">Critical Bug (100x Divine Spin Pass)</option>
                <option value="security">Security Issue (100x Divine Spin Pass)</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-black flex w-full items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-70 md:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Bug Report'
              )}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}

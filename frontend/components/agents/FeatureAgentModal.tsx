'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog } from '@/components/Dialog'
import { X, Loader2, User, Mail, MessageSquare, BookOpen } from 'lucide-react'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useRequestFeatureAgent } from '@/hooks/agents/useRequestFeatureAgent'
import Image from 'next/image'
import { SUI_SENTINEL_DOCS_URL } from '@/constants'
import { useHasRequestedFeature } from '@/hooks/agents/useHasRequestedFeature'
import { LoadingSkeleton } from './FeatureRequestFormSkeleton'
import { AlreadyRequestedState } from './AlreadyRequestedState'
import { FeatureRequestSuccessState } from './FeatureRequestSuccessState'

export interface FeatureAgentModalProps {
  open: boolean
  onClose: () => void
  agentId: string
}

export const FeatureAgentModal = ({ open, onClose, agentId }: FeatureAgentModalProps) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    description: '',
    telegram_username: '',
    twitter_username: '',
  })
  const [error, setError] = useState('')
  const [showSuccessState, setShowSuccessState] = useState(false)
  const { address } = useConnectedAddress()

  const {
    data: hasRequested,
    isLoading: isCheckingRequest,
    refetch,
  } = useHasRequestedFeature(agentId, address || null)

  useEffect(() => {
    if (open && !isCheckingRequest) {
      refetch()
    }
  }, [isCheckingRequest, open, refetch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const { mutateAsync: requestFeature, isPending } = useRequestFeatureAgent()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.description || !address) {
      setError('Name, email, and description are required.')
      return
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      await requestFeature({
        name: form.name,
        email_id: form.email,
        wallet_address: address,
        description: form.description,
        agent_id: parseInt(agentId, 10),
        telegram_username: form.telegram_username || undefined,
        twitter_username: form.twitter_username || undefined,
        status: 'pending',
      })

      setShowSuccessState(true)
      setForm({ name: '', email: '', description: '', twitter_username: '', telegram_username: '' })
      setError('')
       
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleClose = () => {
    setShowSuccessState(false)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="w-full max-w-lg p-4 sm:p-6"
    >
      {isCheckingRequest ? (
        <LoadingSkeleton />
      ) : hasRequested ? (
        <AlreadyRequestedState onClose={handleClose} />
      ) : showSuccessState ? (
        <FeatureRequestSuccessState onClose={handleClose} />
      ) : (
        <div className="space-y-3 text-[var(--color-text-primary)] sm:space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/icons/check-mark.svg"
                width={24}
                height={24}
                alt="checkmark"
                className="size-5 sm:size-6"
              />
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-primary)] sm:text-lg">
                  Request to Feature Your Agent
                </h2>
                <p className="text-[10px] text-[var(--color-text-muted)] sm:text-xs">
                  Please share a few details so we can consider your agent for featuring.
                </p>
                <div className="mt-2">
                  <Link
                    href={`${SUI_SENTINEL_DOCS_URL}/agents/how-to-feature-your-agent#best-practices-before-requesting`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[var(--color-info)] underline transition-colors hover:text-[var(--color-gold-primary)]"
                  >
                    <BookOpen className="size-3" />
                    View best practices
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  <User className="size-3" />
                  Your Name <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-colors focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-[var(--color-gold-primary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  <Mail className="size-3" />
                  Email Address <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-colors focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-[var(--color-gold-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    <Image
                      src="/icons/x_black.png"
                      alt="X (Twitter)"
                      width={12}
                      height={12}
                      className="brightness-0 invert opacity-70"
                    />
                    Twitter Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-sm text-[var(--color-text-faint)]">
                      @
                    </span>
                    <input
                      name="twitter_username"
                      type="text"
                      value={form.twitter_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-2 pl-6 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-colors focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-[var(--color-gold-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    <Image
                      src="/icons/telegram_black.png"
                      alt="Telegram"
                      width={14}
                      height={14}
                      className="brightness-0 invert opacity-70"
                    />
                    Telegram Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-sm text-[var(--color-text-faint)]">
                      @
                    </span>
                    <input
                      name="telegram_username"
                      type="text"
                      value={form.telegram_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-2 pl-6 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-colors focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-[var(--color-gold-primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  <MessageSquare className="size-3" />
                  Any notes you wish to provide <span className="text-[var(--color-danger)]">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write here..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] transition-colors focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-[var(--color-gold-primary)]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-danger-muted)] p-3">
                <p className="flex items-center gap-2 text-xs text-[var(--color-danger)]">
                  <X className="size-3" />
                  {error}
                </p>
              </div>
            )}

            {!address && (
              <div className="rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 p-3">
                <p className="flex items-center gap-2 text-xs text-[var(--color-warning)]">
                  <MessageSquare className="size-3" />
                  Please connect your wallet to submit a feature request.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!address || isPending || !form.name || !form.email || !form.description}
              className="btn btn-black w-full disabled:cursor-not-allowed disabled:bg-[var(--color-border-subtle)]"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Submitting Request...
                </div>
              ) : (
                'Submit Feature Request'
              )}
            </button>
          </>
        </div>
      )}
    </Dialog>
  )
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

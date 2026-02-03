'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog } from '@/components/Dialog'
import { X, Loader2, User, Mail, MessageSquare, BookOpen } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
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
  agentId: number
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
  const account = useCurrentAccount()
  const address = account?.address

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
        agent_id: agentId,
        telegram_username: form.telegram_username || undefined,
        twitter_username: form.twitter_username || undefined,
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
      className="w-full max-w-lg border-gray-200 bg-white p-6"
    >
      {isCheckingRequest ? (
        <LoadingSkeleton />
      ) : hasRequested ? (
        <AlreadyRequestedState onClose={handleClose} />
      ) : showSuccessState ? (
        <FeatureRequestSuccessState onClose={handleClose} />
      ) : (
        <div className="space-y-4 text-black">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Image src="/icons/check-mark.svg" width={24} height={24} alt="checkmark" />
              <div>
                <h2 className="text-lg font-bold text-black">Request to Feature Your Agent</h2>
                <p className="text-xs text-gray-500">
                  Please share a few details so we can consider your agent for featuring.
                </p>
                <div className="mt-2">
                  <Link
                    href={`${SUI_SENTINEL_DOCS_URL}/agents/how-to-feature-your-agent#best-practices-before-requesting`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 underline transition-colors hover:text-blue-800"
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
              className="p-1 text-gray-500 transition-colors hover:text-black"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  <User className="size-3" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  <Mail className="size-3" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                    <Image
                      src="/icons/x_black.png"
                      alt="X (Twitter)"
                      width={12}
                      height={12}
                      className="transition-transform duration-300"
                    />
                    Twitter Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-sm text-gray-400">
                      @
                    </span>
                    <input
                      name="twitter_username"
                      type="text"
                      value={form.twitter_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-6 pr-3 text-sm text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                    <Image
                      src="/icons/telegram_black.png"
                      alt="Telegram"
                      width={16}
                      height={16}
                      className="transition-transform duration-300"
                    />
                    Telegram Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-sm text-gray-400">
                      @
                    </span>
                    <input
                      name="telegram_username"
                      type="text"
                      value={form.telegram_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-6 pr-3 text-sm text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  <MessageSquare className="size-3" />
                  Any notes you wish to provide <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write here..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-black"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-2 text-xs text-red-700">
                  <X className="size-3" />
                  {error}
                </p>
              </div>
            )}

            {!address && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="flex items-center gap-2 text-xs text-yellow-800">
                  <MessageSquare className="size-3" />
                  Please connect your wallet to submit a feature request.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!address || isPending || !form.name || !form.email || !form.description}
              className="btn btn-black w-full disabled:cursor-not-allowed disabled:bg-gray-300"
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

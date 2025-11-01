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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      className="bg-white border-gray-200 p-6 max-w-lg w-full"
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
              <Image
                src="/icons/check-mark.svg"
                width={24}
                height={24}
                alt="checkmark"
              />
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
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 underline"
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
              className="text-gray-500 hover:text-black transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <User className="size-3" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-black focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Mail className="size-3" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-black focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
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
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      @
                    </span>
                    <input
                      name="twitter_username"
                      type="text"
                      value={form.twitter_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
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
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      @
                    </span>
                    <input
                      name="telegram_username"
                      type="text"
                      value={form.telegram_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  Any notes you wish to provide <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write here..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-black focus:ring-black focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700 flex items-center gap-2">
                  <X className="size-3" />
                  {error}
                </p>
              </div>
            )}

            {!address && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-center gap-2">
                  <MessageSquare className="size-3" />
                  Please connect your wallet to submit a feature request.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!address || isPending || !form.name || !form.email || !form.description}
              className="w-full btn btn-black disabled:bg-gray-300 disabled:cursor-not-allowed"
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

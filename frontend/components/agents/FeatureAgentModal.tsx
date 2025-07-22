'use client'

import type React from 'react'
import { useState } from 'react'
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
  const account = useCurrentAccount()
  const address = account?.address

  const { data: hasRequested, isLoading: isCheckingRequest } = useHasRequestedFeature(
    agentId,
    address || null
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const { mutateAsync: requestFeature, isPending } = useRequestFeatureAgent()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.description || !address) {
      setError('Name, email, description are required.')
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
      onClose()
      setForm({ name: '', email: '', description: '', twitter_username: '', telegram_username: '' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="bg-[#12121266] backdrop-blur-xl border border-[#383838] rounded-2xl p-6 max-w-lg w-full shadow-2xl"
    >
      {isCheckingRequest ? (
        <LoadingSkeleton />
      ) : hasRequested ? (
        <AlreadyRequestedState />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/check-mark.svg"
                width={24}
                height={24}
                alt="checkmark"
              />
              <div>
                <h2 className="text-lg font-bold text-white">Request to Feature Your Agent</h2>
                <p className="text-xs text-gray-400">
                  Please share a few details so we can consider your agent for featuring.
                </p>
                <div className="mt-2">
                  <Link
                    href={`${SUI_SENTINEL_DOCS_URL}/agents/how-to-feature-your-agent#best-practices-before-requesting`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#558EB4] hover:text-[#1388D5] transition-colors flex items-center gap-1 underline"
                  >
                    <BookOpen className="size-3" />
                    View best practices
                  </Link>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isPending}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <User className="size-3" />
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm bg-[#1a1b1f] border border-[#558eb466] rounded-lg text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <Mail className="size-3" />
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 text-sm bg-[#1a1b1f] border border-[#558eb466] rounded-lg text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                    <Image
                      src="/icons/x.png"
                      alt="X (Twitter)"
                      width={12}
                      height={12}
                      className="transition-transform duration-300"
                    />
                    Twitter Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      @
                    </span>
                    <input
                      name="twitter_username"
                      type="text"
                      value={form.twitter_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-6 pr-3 py-2 text-sm bg-[#1a1b1f] border border-[#558eb466] rounded-lg text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                    <Image
                      src="/icons/telegram.png"
                      alt="Telegram"
                      width={12}
                      height={12}
                      className="transition-transform duration-300"
                    />
                    Telegram Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      @
                    </span>
                    <input
                      name="telegram_username"
                      type="text"
                      value={form.telegram_username}
                      onChange={handleChange}
                      placeholder="username"
                      className="w-full pl-6 pr-3 py-2 text-sm bg-[#1a1b1f] border border-[#558eb466] rounded-lg text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  Any notes you wish to provide <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write here..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-[#1a1b1f] border border-[#558eb466] rounded-lg text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-400 flex items-center gap-2">
                  <X className="size-3" />
                  {error}
                </p>
              </div>
            )}

            {!address && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400 flex items-center gap-2">
                  <MessageSquare className="size-3" />
                  Please connect your wallet to submit a feature request.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!address || isPending || !form.name || !form.email || !form.description}
              className="w-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full py-3 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue disabled:shadow-none disabled:cursor-not-allowed"
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

'use client'

import type React from 'react'
import { useState } from 'react'
import { Dialog } from '@/components/Dialog'
import { X, Loader2, User, Mail, MessageSquare } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRequestFeatureAgent } from '@/hooks/agents/useRequestFeatureAgent'
import Image from 'next/image'

export interface FeatureAgentModalProps {
  open: boolean
  onClose: () => void
  agentId: number
}

export const FeatureAgentModal = ({ open, onClose, agentId }: FeatureAgentModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', description: '' })
  const [error, setError] = useState('')
  const account = useCurrentAccount()
  const address = account?.address

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const { mutateAsync: requestFeature, isPending } = useRequestFeatureAgent()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.description || !address) {
      setError('All fields are required and wallet must be connected.')
      return
    }

    try {
      await requestFeature({
        name: form.name,
        email_id: form.email,
        wallet_address: address,
        description: form.description,
        agent_id: agentId,
      })

      onClose()
      setForm({ name: '', email: '', description: '' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="bg-[#12121266] backdrop-blur-xl border border-[#383838] rounded-2xl p-8 max-w-xl w-full shadow-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icons/check-mark.svg"
              width={32}
              height={32}
              alt="checkmark"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">Request to Feature Your Agent</h2>
              <p className="text-sm text-gray-400">
                Please share a few details so we can consider your agent for featuring.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="size-4" />
              Your Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-4 bg-[#1a1b1f] border border-[#558eb466] rounded-xl text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Mail className="size-4" />
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full p-4 bg-[#1a1b1f] border border-[#558eb466] rounded-xl text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MessageSquare className="size-4" />
              Any notes you wish to provide
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write here..."
              rows={4}
              className="w-full p-4 bg-[#1a1b1f] border border-[#558eb466] rounded-xl text-white placeholder-gray-500 focus:border-[#558EB4] focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!address && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-sm text-yellow-400">
              Please connect your wallet to submit a feature request.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!address || isPending || !form.name || !form.email || !form.description}
          className="w-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full py-4 font-bold transition-all duration-300 shadow-lg hover:shadow-glow-blue disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Submitting Request...
            </div>
          ) : (
            'Submit Feature Request'
          )}
        </button>
      </div>
    </Dialog>
  )
}

'use client'
import React, { useState } from 'react'
import { Dialog } from '@/components/Dialog'
import { X, Loader2 } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRequestFeatureAgent } from '@/hooks/agents/useRequestFeatureAgent'

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
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Request to Feature Agent</h2>
          <button
            onClick={onClose}
            disabled={isPending}
          >
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-3 bg-[#12121266] border border-gray-600 rounded"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-3 bg-[#12121266] border border-gray-600 rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Why do you want to feature this agent?"
            rows={4}
            className="w-full p-3 bg-[#12121266] border border-gray-600 rounded"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!address || isPending}
          className="w-full py-3 rounded-full font-semibold bg-white text-black disabled:opacity-50"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
            </div>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </Dialog>
  )
}

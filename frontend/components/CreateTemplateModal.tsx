'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Crosshair, Gavel, Sparkles } from 'lucide-react'
import { Toaster } from './ui/sonner'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const account = useCurrentAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    public_instructions: '',
    private_instructions: '',
    attack_goal: '',
    jury_prompt: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account?.address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.name || !formData.public_instructions || !formData.private_instructions || !formData.attack_goal || !formData.jury_prompt) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          creator_address: account.address
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      toast.success('Template created successfully!')
      setFormData({
        name: '',
        public_instructions: '',
        private_instructions: '',
        attack_goal: '',
        jury_prompt: ''
      })
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl border-b border-[#5E5E5E] bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {formData.name || 'Create Custom Template'}
                    </h2>
                    <span className="shrink-0 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      basic
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 text-gray-400 transition-colors hover:text-black"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              
              {/* Template Name Block */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  <h3 className="text-base font-semibold">Template Name</h3>
                </div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., The Ultimate Defender"
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-gray-800 placeholder-yellow-700/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Public Instructions Block */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-semibold">Public Instructions</h3>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <textarea
                    name="public_instructions"
                    value={formData.public_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="What attackers see before they start. Describe the agent's public persona..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-gray-800 placeholder-blue-700/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Private Instructions Block */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-orange-600" />
                  <h3 className="text-base font-semibold">Private Instructions</h3>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <textarea
                    name="private_instructions"
                    value={formData.private_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="The secret prompt the agent follows to defend. Enter the secret rules and knowledge..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-gray-800 placeholder-orange-700/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Attack Goal Block */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-red-600" />
                  <h3 className="text-base font-semibold">Attack Goal</h3>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <textarea
                    name="attack_goal"
                    value={formData.attack_goal}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What the attacker is trying to achieve. e.g., Make the agent reveal..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-gray-800 placeholder-red-700/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Jury Prompt Block */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-purple-600" />
                  <h3 className="text-base font-semibold">Jury Prompt</h3>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <textarea
                    name="jury_prompt"
                    value={formData.jury_prompt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="How the jury decides if the attacker won. e.g., Did the agent reveal..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-gray-800 placeholder-purple-700/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl border border-gray-200 font-medium text-gray-800 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="p-5 rounded-xl bg-black py-4 text-center font-medium text-white transition-all hover:bg-black/90 flex items-center justify-end gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      <Toaster />
    </AnimatePresence>
  )
}


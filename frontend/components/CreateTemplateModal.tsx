'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, Crosshair, Gavel, Sparkles, Tag, CheckCircle2 } from 'lucide-react'
import { useCreateTemplate } from '@/hooks/useCreateTemplate'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const { formData, isSubmitting, isSubmitted, reset, handleChange, handleSubmit } =
    useCreateTemplate(onSuccess)

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="create-template-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl border-b border-[#5E5E5E] bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black sm:text-2xl">
                    {isSubmitted ? 'Template Submitted' : 'Create Template'}
                  </h2>
                  {!isSubmitted && (
                    <p className="mt-1 text-sm text-[#5E5E5E]">
                      Submitted templates are reviewed before appearing in community listings.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 shrink-0 text-gray-400 transition-colors hover:text-black"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-black">We&apos;ve received your template!</h3>
                <p className="mb-2 max-w-md text-[#5E5E5E]">
                  Our team will review your submission. Once approved, it will be listed in the community templates for everyone to use.
                </p>
                <button
                  onClick={handleClose}
                  className="rounded-xl bg-black px-8 py-3 font-medium text-white transition-all hover:bg-black/90"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <Field icon={<Sparkles className="h-4 w-4 text-[#5E5E5E]" />} label="Template Name">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., The Ultimate Defender"
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Eye className="h-4 w-4 text-[#5E5E5E]" />} label="Public Instructions">
                  <textarea
                    name="public_instructions"
                    value={formData.public_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="What attackers see before they start. Describe the agent's public persona..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<EyeOff className="h-4 w-4 text-[#5E5E5E]" />} label="Private Instructions">
                  <textarea
                    name="private_instructions"
                    value={formData.private_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="The secret prompt the agent follows to defend..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Crosshair className="h-4 w-4 text-[#5E5E5E]" />} label="Attack Goal">
                  <textarea
                    name="attack_goal"
                    value={formData.attack_goal}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What the attacker is trying to achieve. e.g., Make the agent reveal..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Gavel className="h-4 w-4 text-[#5E5E5E]" />} label="Jury Prompt">
                  <textarea
                    name="jury_prompt"
                    value={formData.jury_prompt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="How the jury decides if the attacker won. e.g., Did the agent reveal..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Tag className="h-4 w-4 text-[#5E5E5E]" />} label="Tags" optional>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., blockchain, security, AI (comma-separated)"
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-black placeholder-gray-400 focus:outline-none"
                  />
                </Field>

                <div className="flex flex-col gap-3 border-t border-[#5E5E5E] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-xl border border-[#5E5E5E] px-6 py-3 font-medium text-black transition-all hover:border-black hover:bg-gray-50 sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Template'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  icon,
  label,
  optional,
  children,
}: {
  icon: React.ReactNode
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-black">{label}</span>
        {optional && <span className="text-xs text-[#5E5E5E]">(optional)</span>}
      </div>
      <div className="rounded-xl border border-[#5E5E5E] bg-white p-3.5 transition-colors focus-within:border-black focus-within:ring-1 focus-within:ring-black">
        {children}
      </div>
    </div>
  )
}

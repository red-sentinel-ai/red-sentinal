'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Eye, EyeOff, Crosshair, Sparkles, Tag, CheckCircle2, Camera } from 'lucide-react'
import { useCreateTemplate } from '@/hooks/useCreateTemplate'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { SENTINEL_IMAGES, SENTINEL_GIFS } from '@/constants/asset_paths'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const { formData, selectedImage, setSelectedImage, isSubmitting, isSubmitted, reset, handleChange, handleSubmit } =
    useCreateTemplate(onSuccess)
  const [imagePickerOpen, setImagePickerOpen] = useState(false)

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <motion.div
          key="create-template-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-deepest)]/50 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-[var(--color-bg-elevated)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)] sm:text-2xl">
                    {isSubmitted ? 'Template Submitted' : 'Create Template'}
                  </h2>
                  {!isSubmitted && (
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Your template will appear in the community listing right away.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="ml-4 shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {isSubmitted ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold-primary)]">
                  <CheckCircle2 className="h-8 w-8 text-[var(--color-text-on-gold)]" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">Your template is live!</h3>
                <p className="mb-2 max-w-md text-[var(--color-text-muted)]">
                  It&apos;s now listed in the community templates for everyone to use. Defenders, assemble!
                </p>
                <button
                  onClick={handleClose}
                  className="btn rounded-xl bg-[var(--color-gold-primary)] px-8 py-3 font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <Field icon={<Camera className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Template Image" optional>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setImagePickerOpen(true)}
                      className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] transition-colors hover:border-[var(--color-gold-primary)]"
                      aria-label="Choose template image"
                    >
                      {selectedImage?.url ? (
                        <Image
                          src={selectedImage.url}
                          alt="Template image"
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[var(--color-text-faint)]">
                          <Camera className="h-6 w-6" />
                        </span>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-overlay)] opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="h-5 w-5 text-white" />
                      </span>
                    </button>
                    <div>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {selectedImage ? 'Image selected' : 'Choose an image'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setImagePickerOpen(true)}
                        className="text-xs text-[var(--color-gold-primary)] transition-colors hover:text-[var(--color-gold-light)]"
                      >
                        {selectedImage ? 'Change image' : 'Pick from gallery or upload your own'}
                      </button>
                    </div>
                  </div>
                </Field>

                <Field icon={<Sparkles className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Template Name">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., The Ultimate Defender"
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Eye className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Public Instructions">
                  <textarea
                    name="public_instructions"
                    value={formData.public_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="What attackers see before they start. Describe the agent's public persona..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<EyeOff className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Private Instructions">
                  <textarea
                    name="private_instructions"
                    value={formData.private_instructions}
                    onChange={handleChange}
                    rows={4}
                    placeholder="The secret prompt the agent follows to defend..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Crosshair className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Attack Goal">
                  <textarea
                    name="attack_goal"
                    value={formData.attack_goal}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What the attacker is trying to achieve. e.g., Make the agent reveal..."
                    className="w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                    required
                  />
                </Field>

                <Field icon={<Tag className="h-4 w-4 text-[var(--color-text-muted)]" />} label="Tags" optional>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., blockchain, security, AI (comma-separated)"
                    className="w-full bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
                  />
                </Field>

                <div className="flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn w-full rounded-xl border border-[var(--color-border-subtle)] px-6 py-3 font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-gold-primary)] hover:bg-[var(--color-bg-subtle)] sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-gold-primary)] px-6 py-3 font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

      <ImagePickerSheet
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelectImage={img => {
          setSelectedImage(img)
          setImagePickerOpen(false)
        }}
        title="Select Template Image"
        subtitle="Choose an avatar for your template."
        imageArray={SENTINEL_IMAGES}
        gifArray={SENTINEL_GIFS}
        disableGifs={true}
      />
    </>
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
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        {optional && <span className="text-xs text-[var(--color-text-muted)]">(optional)</span>}
      </div>
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3.5 transition-colors focus-within:border-[var(--color-gold-primary)] focus-within:ring-1 focus-within:ring-[var(--color-gold-primary)]">
        {children}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Eye, EyeOff, Crosshair } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/ui/common/CopyButton'
import { SESSION_KEYS } from '@/constants'
import type { SentinelTemplate } from '@/types'

interface TemplateDetailModalProps {
  template: SentinelTemplate | null
  copiedField: string | null
  onCopy: (text: string, fieldId: string) => void
  onClose: () => void
}

export function TemplateDetailModal({
  template,
  copiedField,
  onCopy,
  onClose,
}: TemplateDetailModalProps) {
  return (
    <AnimatePresence>
      {template && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-deepest)]/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-[var(--color-bg-elevated)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 rounded-t-2xl border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {template.avatar_url && (
                      <img
                        src={template.avatar_url}
                        alt={template.name}
                        className="h-12 w-12 shrink-0 rounded-xl border border-[var(--color-border-subtle)] object-cover"
                      />
                    )}
                    <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{template.name}</h2>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium',
                        template.sentinel_type === 'rag'
                          ? 'border-[var(--color-gold-primary)]/20 bg-[var(--color-gold-muted)] text-[var(--color-gold-primary)]'
                          : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                      )}
                    >
                      {template.sentinel_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[var(--color-info)]" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Public Instructions</h3>
                  </div>
                  <CopyButton
                    text={template.public_instructions}
                    fieldId="public"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {template.public_instructions}
                  </pre>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-[var(--color-warning)]" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Private Instructions</h3>
                  </div>
                  <CopyButton
                    text={template.hidden_instructions}
                    fieldId="hidden"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {template.hidden_instructions}
                  </pre>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-[var(--color-danger)]" />
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Attack Goal</h3>
                  </div>
                  <CopyButton
                    text={template.attack_goal}
                    fieldId="attack"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                </div>
                <div className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {template.attack_goal}
                  </pre>
                </div>
              </div>

              <Link
                href="/defend"
                onClick={() => {
                  sessionStorage.setItem(SESSION_KEYS.SELECTED_TEMPLATE, JSON.stringify(template))
                }}
                className="btn block w-full rounded-xl bg-[var(--color-gold-primary)] py-4 text-center font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)]"
              >
                Use This Template
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

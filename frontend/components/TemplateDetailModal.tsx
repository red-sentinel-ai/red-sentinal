'use client'

import Link from 'next/link'
import { Eye, EyeOff, Crosshair, Heart, MessageCircle, ShieldCheck, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/ui/common/CopyButton'
import { TemplateComments } from '@/components/templates/TemplateComments'
import { SESSION_KEYS } from '@/constants'
import type { SentinelTemplate } from '@/types'

interface TemplateDetailModalProps {
  template: SentinelTemplate | null
  copiedField: string | null
  onCopy: (text: string, fieldId: string) => void
  onClose: () => void
  onToggleLike?: (template: SentinelTemplate) => void
  onConnectRequest?: () => void
  onCommentCountChange?: (templateId: number, delta: number) => void
}

export function TemplateDetailModal({
  template,
  copiedField,
  onCopy,
  onClose,
  onToggleLike,
  onConnectRequest,
  onCommentCountChange,
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
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-[var(--color-bg-elevated)] shadow-[var(--shadow-elevated)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Hero header */}
            <div className="sticky top-0 z-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/95 px-6 py-5 backdrop-blur-md sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  {template.avatar_url ? (
                    <img
                      src={template.avatar_url}
                      alt={template.name}
                      className="h-14 w-14 shrink-0 rounded-2xl border border-[var(--color-border-subtle)] object-cover sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-2xl font-bold text-[var(--color-text-muted)] sm:h-16 sm:w-16">
                      {template.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="truncate text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
                        {template.name}
                      </h2>
                      {template.origin === 'team' && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-gold-primary)]/30 bg-[var(--color-gold-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-gold-primary)]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Official
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleLike?.(template)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                          template.liked_by_me
                            ? 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                            : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-danger)]/40 hover:text-[var(--color-danger)]'
                        )}
                        aria-label={template.liked_by_me ? 'Unlike template' : 'Like template'}
                      >
                        <Heart className={cn('h-3.5 w-3.5', template.liked_by_me && 'fill-current')} />
                        {template.like_count ?? 0}
                      </button>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {template.comment_count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-8 px-6 py-7 sm:px-8">
              <Section
                icon={<Eye className="h-3.5 w-3.5" />}
                label="Public Instructions"
                accent="text-[var(--color-info)]"
                copy={
                  <CopyButton
                    text={template.public_instructions}
                    fieldId="public"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                }
              >
                <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-[1.75] text-[var(--color-text-secondary)]">
                    {template.public_instructions}
                  </p>
                </div>
              </Section>

              <Section
                icon={<EyeOff className="h-3.5 w-3.5" />}
                label="Private Instructions"
                accent="text-[var(--color-warning)]"
                copy={
                  <CopyButton
                    text={template.hidden_instructions}
                    fieldId="hidden"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                }
              >
                <div className="rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-[1.75] text-[var(--color-text-secondary)]">
                    {template.hidden_instructions}
                  </p>
                </div>
              </Section>

              <Section
                icon={<Crosshair className="h-3.5 w-3.5" />}
                label="Attack Goal"
                accent="text-[var(--color-danger)]"
                copy={
                  <CopyButton
                    text={template.attack_goal}
                    fieldId="attack"
                    copiedField={copiedField}
                    onCopy={onCopy}
                  />
                }
              >
                <blockquote className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-5 py-4">
                  <p className="text-base italic leading-relaxed text-[var(--color-text-primary)]">
                    &ldquo;{template.attack_goal}&rdquo;
                  </p>
                </blockquote>
              </Section>

              {template.id && (
                <TemplateComments
                  templateId={template.id}
                  onConnectRequest={onConnectRequest}
                  onCountChange={delta => onCommentCountChange?.(template.id!, delta)}
                />
              )}
            </div>

            {/* Sticky CTA */}
            <div className="sticky bottom-0 z-10 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/95 px-6 py-4 backdrop-blur-md sm:px-8">
              <Link
                href="/defend"
                onClick={() => {
                  sessionStorage.setItem(SESSION_KEYS.SELECTED_TEMPLATE, JSON.stringify(template))
                }}
                className="btn block w-full rounded-xl bg-[var(--color-gold-primary)] py-3.5 text-center text-base font-semibold tracking-wide text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)]"
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

function Section({
  icon,
  label,
  accent,
  copy,
  children,
}: {
  icon: React.ReactNode
  label: string
  accent: string
  copy: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn('shrink-0', accent)}>{icon}</span>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            {label}
          </h3>
        </div>
        {copy}
      </div>
      {children}
    </section>
  )
}

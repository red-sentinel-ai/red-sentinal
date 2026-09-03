'use client'

import Link from 'next/link'
import { ChevronLeft, AlertTriangle, Plus, Crosshair, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CreateTemplateModal } from '@/components/CreateTemplateModal'
import { ConnectModal } from '@mysten/dapp-kit'
import { useInstructionTemplates } from '@/hooks/useInstructionTemplates'
import { TemplateDetailModal } from '@/components/TemplateDetailModal'
import { TemplateCardSkeleton } from '@/components/ui/skeletons/TemplateCardSkeleton'
import { SESSION_KEYS } from '@/constants'

export default function InstructionTemplatesPage() {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedTemplate,
    setSelectedTemplate,
    filteredTemplates,
    copiedField,
    copyToClipboard,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isWalletModalOpen,
    setIsWalletModalOpen,
    handleCreateClick,
    fetchTemplates,
    isLoading,
  } = useInstructionTemplates()

  return (
    <div className="min-h-body relative">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="container mx-auto max-w-[1400px] px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/defend"
            className="mb-4 inline-flex items-center gap-2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Deploy</span>
          </Link>

          <div className="mb-3">
            <h1 className="mb-3 text-2xl font-medium text-[var(--color-text-primary)] sm:text-4xl md:text-5xl">
              Sentinel Templates
            </h1>
            <p className="max-w-3xl text-base text-[var(--color-text-muted)] sm:text-xl">
              Pre-built defenders, ready in 2 minutes. Pick one, fund the pool, and earn from every
              attack it survives.
            </p>
          </div>
        </div>

        <div className="border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 mb-8 rounded-xl border p-6">
          <div className="flex gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-[var(--color-warning)]" />
            <div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                Battle-tested defenses.{' '}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                These templates are hardened against the most common jailbreak patterns from real
                security research. They won&apos;t make your sentinel invincible — nothing is — but
                they&apos;ll make attackers work for it. That&apos;s the point: the harder your
                sentinel is to break, the more fees you earn. These templates draw from security
                research including{' '}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {(['all', 'basic', 'rag'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:py-3 sm:text-base',
                  selectedCategory === category
                    ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                    : 'border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-gold-primary)]'
                )}
              >
                {category === 'all' ? 'All Templates' : category === 'basic' ? 'Basic' : 'RAG'}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreateClick}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-gold-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)] sm:py-3 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Create Template
          </button>
        </div>

        {/* Grid title row */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] sm:text-2xl">
            Choose your champion
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] sm:text-base">
            Pick a fighter for the arena — full instructions are one click in.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <TemplateCardSkeleton key={`skeleton-${i}`} />
              ))
            : filteredTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] transition-all hover:border-[var(--color-gold-primary)] hover:shadow-[var(--shadow-elevated)]"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* Portrait */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg-subtle)]">
                    {template.avatar_url ? (
                      <img
                        src={template.avatar_url}
                        alt={template.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-[var(--color-text-muted)]">
                        {template.name.charAt(0)}
                      </div>
                    )}
                    <span
                      className={cn(
                        'absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm',
                        template.sentinel_type === 'rag'
                          ? 'border-[var(--color-gold-primary)]/20 bg-[var(--color-bg-deepest)]/60 text-[var(--color-gold-primary)]'
                          : 'bg-[var(--color-bg-deepest)]/60 border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'
                      )}
                    >
                      {template.sentinel_type}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="mb-2 text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
                      {template.name}
                    </h3>

                    <div className="mb-4 flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                      <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                      <span className="line-clamp-2 italic">
                        &ldquo;{template.attack_goal}&rdquo;
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-secondary)]">
                        View full instructions
                      </span>
                      <Link
                        href="/defend"
                        onClick={e => {
                          e.stopPropagation()
                          sessionStorage.setItem(
                            SESSION_KEYS.SELECTED_TEMPLATE,
                            JSON.stringify(template)
                          )
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)]"
                      >
                        Deploy
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        <TemplateDetailModal
          template={selectedTemplate}
          copiedField={copiedField}
          onCopy={copyToClipboard}
          onClose={() => setSelectedTemplate(null)}
        />

        <CreateTemplateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchTemplates()
          }}
        />
        <ConnectModal
          open={isWalletModalOpen}
          onOpenChange={setIsWalletModalOpen}
          trigger={<span className="hidden" />}
        />
      </div>
    </div>
  )
}

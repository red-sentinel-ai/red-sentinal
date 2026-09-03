'use client'

import Link from 'next/link'
import { ChevronLeft, AlertTriangle, Plus, Crosshair } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CreateTemplateModal } from '@/components/CreateTemplateModal'
import { ConnectModal } from '@mysten/dapp-kit'
import { useInstructionTemplates } from '@/hooks/useInstructionTemplates'
import { TemplateDetailModal } from '@/components/TemplateDetailModal'
import { TemplateCardSkeleton } from '@/components/ui/skeletons/TemplateCardSkeleton'
import {
  GARAK_GITHUB_URL,
  PROMPTFOO_URL,
  PETRI_GITHUB_URL,
  BLOOM_GITHUB_URL,
} from '@/constants'

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
            <h1 className="mb-3 text-2xl font-medium sm:text-4xl md:text-5xl text-[var(--color-text-primary)]">Sentinel Templates</h1>
            <p className="max-w-3xl text-base text-[var(--color-text-muted)] sm:text-xl">
              Fun, pre-configured sentinel characters ready to deploy. Pick a template, customize it
              if you want, and deploy your defender with all fields auto-filled.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 p-6">
          <div className="flex gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-[var(--color-warning)]" />
            <div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                No Perfect Defense But These Help
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                These templates draw from security research including{' '}
                <Link
                  href={GARAK_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--color-gold-primary)]"
                >
                  garak
                </Link>
                ,{' '}
                <Link
                  href={PROMPTFOO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--color-gold-primary)]"
                >
                  promptfoo
                </Link>
                ,{' '}
                <Link
                  href={PETRI_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--color-gold-primary)]"
                >
                  petri
                </Link>
                , and{' '}
                <Link
                  href={BLOOM_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--color-gold-primary)]"
                >
                  bloom
                </Link>
                . No defense is perfect against determined attackers, but these templates
                significantly raise the bar. Always test your Sentinel against real attacks before
                deploying.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-gold-primary)] px-6 py-2.5 sm:py-3 text-sm font-medium text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)] shrink-0 sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Create Template
          </button>
        </div>

        {/* Templates Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={`skeleton-${i}`} />)
            : filteredTemplates.map((template, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 transition-all hover:border-[var(--color-gold-primary)] hover:shadow-[var(--shadow-elevated)]"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold leading-tight text-[var(--color-text-primary)]">{template.name}</h3>
                <span
                  className={cn(
                    'ml-2 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    template.sentinel_type === 'rag'
                      ? 'border-[var(--color-gold-primary)]/20 bg-[var(--color-gold-muted)] text-[var(--color-gold-primary)]'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                  )}
                >
                  {template.sentinel_type}
                </span>
              </div>

              <p className="mb-4 line-clamp-3 text-sm text-[var(--color-text-muted)]">
                {template.public_instructions}
              </p>

              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <Crosshair className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{template.attack_goal}</span>
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

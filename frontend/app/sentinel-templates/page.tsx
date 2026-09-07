'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  AlertTriangle,
  Plus,
  Crosshair,
  Heart,
  MessageCircle,
  ShieldCheck,
  Users,
  Flame,
  Clock,
  Search,
  X,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CreateTemplateModal } from '@/components/CreateTemplateModal'
import { ConnectModal } from '@mysten/dapp-kit'
import { useInstructionTemplates } from '@/hooks/useInstructionTemplates'
import { TemplateDetailModal } from '@/components/TemplateDetailModal'
import { TemplateCardSkeleton } from '@/components/ui/skeletons/TemplateCardSkeleton'
import { SESSION_KEYS } from '@/constants'
import { TemplateOrigin } from '@/types'

export default function InstructionTemplatesPage() {
  const {
    selectedOrigin,
    setSelectedOrigin,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
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
    toggleLike,
    handleCommentCountChange,
    fetchTemplates,
    isLoading,
  } = useInstructionTemplates()

  return (
    <div className="min-h-body relative">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="container mx-auto max-w-[1400px] px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-3">
          <h1 className="mb-3 text-2xl font-medium text-[var(--color-text-primary)] sm:text-4xl md:text-5xl">
            Sentinel Templates
          </h1>
            <p className="max-w-3xl text-base text-[var(--color-text-muted)] sm:text-xl">
              Battle-tested defenders, pre-built and ready. Pick one, hit launch — name,
              instructions, and objective are all pre-filled. All that&apos;s left is setting your
              bounty.
            </p>
        </div>

        <div className="border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 mb-8 rounded-xl border p-6">
          <div className="flex gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-[var(--color-warning)]" />
            <div>
              <h3 className="mb-2 font-semibold text-[var(--color-text-primary)]">
                {selectedOrigin === 'team'
                  ? 'Battle-tested defenses. '
                  : 'Community-built defenses. '}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {selectedOrigin === 'team'
                  ? "These templates are hardened against the most common jailbreak patterns from real security research. They won't make your sentinel invincible — nothing is — but they'll make attackers work for it. That's the point: the harder your sentinel is to break, the more fees you earn. These templates draw from security research including "
                  : 'These templates are crafted by defenders like you. Like the ones that look strongest, read the comments, and pick the defender that fits your strategy. Remember — no sentinel is invincible, but a good template makes attackers work for it. '}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Origin tabs: Team vs Community */}
          <div className="flex gap-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">
            {(
              [
                { value: 'team' as TemplateOrigin, label: 'Team Picks', icon: ShieldCheck },
                { value: 'community' as TemplateOrigin, label: 'Community', icon: Users },
              ] as const
            ).map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedOrigin(tab.value)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all sm:text-base',
                  selectedOrigin === tab.value
                    ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
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

        {/* Search + sort row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-2.5 transition-colors focus-within:border-[var(--color-gold-primary)] sm:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">
            {(
              [
                { value: 'newest' as const, label: 'Newest', icon: Clock },
                { value: 'popular' as const, label: 'Most Liked', icon: Flame },
              ] as const
            ).map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                  sortBy === option.value
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid title row */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] sm:text-2xl">
            {selectedOrigin === 'team' ? 'Team picks' : 'Community creations'}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] sm:text-base">
            {selectedOrigin === 'team'
              ? 'Hand-crafted by the Red Sentinel team — battle-tested and ready for the arena.'
              : 'Built by defenders like you. Like your favorites and deploy the best.'}
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={`skeleton-${i}`} />)
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-[var(--color-border-subtle)] py-16 text-center">
              {searchQuery ? (
                <>
                  <Search className="mx-auto mb-3 h-8 w-8 text-[var(--color-text-faint)]" />
                  <h3 className="mb-1 font-medium text-[var(--color-text-primary)]">
                    No templates match your search
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Try a different keyword or clear the search.
                  </p>
                </>
              ) : (
                <>
                  <Users className="mx-auto mb-3 h-8 w-8 text-[var(--color-text-faint)]" />
                  <h3 className="mb-1 font-medium text-[var(--color-text-primary)]">
                    {selectedOrigin === 'team'
                      ? 'No team templates yet'
                      : 'No community templates yet'}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {selectedOrigin === 'team'
                      ? 'Check back soon — the team is crafting new defenders.'
                      : 'Be the first to create one and lead the pack.'}
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id ?? index}
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
                  {template.origin === 'team' && (
                    <span className="border-[var(--color-gold-primary)]/30 bg-[var(--color-bg-deepest)]/60 absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium text-[var(--color-gold-primary)] backdrop-blur-sm">
                      <ShieldCheck className="h-3 w-3" />
                      Official
                    </span>
                  )}
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

                  <div className="mb-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        toggleLike(template)
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all',
                        template.liked_by_me
                          ? 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                          : 'hover:border-[var(--color-danger)]/40 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)]'
                      )}
                      aria-label={template.liked_by_me ? 'Unlike template' : 'Like template'}
                    >
                      <Heart className={cn('h-4 w-4', template.liked_by_me && 'fill-current')} />
                      {template.like_count ?? 0}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                      <MessageCircle className="h-4 w-4" />
                      {template.comment_count ?? 0}
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
                        <Zap className="h-4 w-4" />
                        1-Click Launch
                      </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <TemplateDetailModal
          template={selectedTemplate}
          copiedField={copiedField}
          onCopy={copyToClipboard}
          onClose={() => setSelectedTemplate(null)}
          onToggleLike={toggleLike}
          onConnectRequest={() => setIsWalletModalOpen(true)}
          onCommentCountChange={handleCommentCountChange}
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

import Link from 'next/link'
import { Globe, Lock, MessageSquare, Mic, Share2, Unlock, UserPlus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getSyndicateBasePath } from '@/lib/syndicate-utils'
import type { BackendSyndicate } from '@/types/Syndicate'

interface Props {
  meta: BackendSyndicate | undefined
  onRequestPermission?: () => void
}

export function SyndicateHero({ meta, onRequestPermission }: Props) {
  const agentId = meta?.agent_id
  const isPermissioned = meta?.whitelist_enabled ?? false

  return (
    <section className="mb-20 space-y-6">
      {!meta ? (
        <>
          <Skeleton className="h-16 w-80" />
          <Skeleton className="h-6 w-96" />
        </>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-[var(--color-text-primary)] md:text-6xl lg:text-7xl">
              {meta.name}
            </h1>
            <div className="pb-1">
              {agentId ? (
                <Link
                  href={meta.agent_path ?? `/agent/${agentId}`}
                  className="button-ghost-terminal inline-flex items-center gap-2 px-6 py-3"
                >
                  View Sentinel
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  No Sentinel
                </span>
              )}
            </div>
          </div>

          {/* Chat / Voice */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${getSyndicateBasePath(meta)}/chat`}
              className="button-ghost-terminal inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Private Chat Room</span>
            </Link>
            <div className="group relative">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="button-ghost-terminal inline-flex cursor-not-allowed items-center justify-center gap-2 px-6 py-3 opacity-40"
              >
                <Mic className="h-4 w-4" />
                <span>Voice</span>
              </button>
              <span className="industrial-header pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-2 py-1 text-[9px] tracking-widest text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                COMING_SOON
              </span>
            </div>
          </div>

          {meta.description && (
            <p className="max-w-xl text-base text-[var(--color-text-muted)]">{meta.description}</p>
          )}

          <div className="flex items-center gap-4">
            {meta.social_link && (
              <a
                href={meta.social_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-widest">Website</span>
              </a>
            )}
            <button className="flex items-center gap-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
              <Share2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Share</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              {isPermissioned ? (
                <Lock className="h-4 w-4 text-[var(--color-gold-primary)]" />
              ) : (
                <Unlock className="h-4 w-4 text-emerald-400" />
              )}
              <span>
                {isPermissioned ? (
                  <>
                    This syndicate is{' '}
                    <span className="font-bold text-[var(--color-text-primary)]">permissioned</span>.
                    You need syndicate owner permission to join this syndicate.
                  </>
                ) : (
                  <>
                    This syndicate is{' '}
                    <span className="font-bold text-[var(--color-text-primary)]">public</span>.
                    Anybody can join this syndicate.
                  </>
                )}
              </span>
            </div>
            {isPermissioned && onRequestPermission && (
              <button
                onClick={onRequestPermission}
                className="inline-flex w-fit items-center gap-2 border border-[var(--color-gold-primary)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-gold-primary)] transition-colors hover:bg-[var(--color-gold-primary)] hover:text-[var(--color-bg-deepest)]"
              >
                <UserPlus className="h-4 w-4" />
                Request Permission
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

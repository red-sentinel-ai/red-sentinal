import Link from 'next/link'
import { Globe, Lock, Share2, Unlock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { BackendSyndicate } from '@/types/Syndicate'

interface Props {
  meta: BackendSyndicate | undefined
}

export function SyndicateHero({ meta }: Props) {
  const agentId = meta?.agent_id
  const isPermissioned = meta?.whitelist_enabled ?? false

  const handleRequestPermission = () => {
    // TODO: send in-app notification, telegram, email to syndicate owner,
    // then prompt user to connect telegram/email if not connected.
    // eslint-disable-next-line no-console
    console.log('Request permission clicked for', meta?.contract_address)
  }

  return (
    <section className="mb-20 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-4">
        {!meta ? (
          <>
            <Skeleton className="h-16 w-80" />
            <Skeleton className="h-6 w-96" />
          </>
        ) : (
          <>
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-[var(--color-text-primary)] md:text-6xl lg:text-7xl">
              {meta.name}
            </h1>
            {meta.description && (
              <p className="max-w-xl text-base text-[var(--color-text-muted)]">
                {meta.description}
              </p>
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
                      <span className="font-bold text-[var(--color-text-primary)]">
                        permissioned
                      </span>
                      . You need syndicate owner permission to join this syndicate.
                    </>
                  ) : (
                    <>
                      This syndicate is{' '}
                      <span className="font-bold text-[var(--color-text-primary)]">
                        public
                      </span>
                      . Anybody can join this syndicate.
                    </>
                  )}
                </span>
              </div>
              {isPermissioned && (
                <button
                  onClick={handleRequestPermission}
                  className="w-fit text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-primary)] underline-offset-4 transition-colors hover:text-[var(--color-gold-light)] hover:underline"
                >
                  Request Permission
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <div className="pb-1">
        {agentId ? (
          <Link
            href={meta?.agent_path ?? `/agent/${agentId}`}
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
    </section>
  )
}

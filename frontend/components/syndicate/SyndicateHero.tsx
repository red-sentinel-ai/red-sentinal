import Link from 'next/link'
import { Globe, Share2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { BackendSyndicate } from '@/types/Syndicate'

interface Props {
  meta: BackendSyndicate | undefined
}

export function SyndicateHero({ meta }: Props) {
  const agentId = meta?.agent_id
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

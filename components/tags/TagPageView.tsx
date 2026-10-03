'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  Copy,
  FileQuestion,
  Loader2,
  Search,
  ShieldAlert,
  Swords,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import {
  useTagAttackers,
  useTagDefenders,
  useTagPage,
  useTagSentinels,
} from '@/hooks/tags/useTagPage'
import {
  TAG_ATTACKER_SORT_OPTIONS,
  TAG_DEFENDER_SORT_OPTIONS,
  type TagActivityEntry,
  type TagAttackerEntry,
  type TagDefenderEntry,
  type TagPageResponse,
  type TagSentinelStatus,
} from '@/types/tag-pages'

/**
 * TagPageRenderer (WO-20): the public Tag Page. Renders campaign identity
 * and share copy, the mainnet activity summary, tag-scoped leaderboards with
 * supported metric sorting and load-more, Sentinels with status filtering,
 * and recent activity. Unavailable metrics are shown as unavailable — never
 * as current zeros (AC-STL-003.4).
 */

const METRIC_CELLS: Array<{ key: keyof NonNullable<TagPageResponse['metrics']>; label: string; format?: 'usd' | 'pct' }> = [
  { key: 'totalAttacks', label: 'Total Attacks' },
  { key: 'tagDefenders', label: 'Tag Defenders' },
  { key: 'sentinelsLaunched', label: 'Sentinels Launched' },
  { key: 'attackedTagDefenders', label: 'Attacked Defenders' },
  { key: 'breachedSentinels', label: 'Breached Sentinels' },
  { key: 'breachRatePct', label: 'Breach Rate', format: 'pct' },
  { key: 'activeSentinels', label: 'Active Sentinels' },
  { key: 'bountyPaidUsd', label: 'Bounty Paid', format: 'usd' },
]

const SENTINEL_STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'breached', label: 'Breached' },
  { value: 'closed', label: 'Closed' },
]

function formatMetric(value: number, format?: 'usd' | 'pct'): string {
  if (format === 'usd') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
  if (format === 'pct') {
    return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
  }
  return value.toLocaleString('en-US')
}

function shortWallet(wallet: string): string {
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
}

function displayName(entry: { wallet: string; username?: string | null }): string {
  return entry.username || shortWallet(entry.wallet)
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border-default)] px-4 py-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.08em] text-white">{title}</h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function MiniEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Search className="mb-3 h-6 w-6 text-[var(--color-text-faint)]" />
      <p className="text-xs text-[var(--color-text-muted)]">{message}</p>
    </div>
  )
}

function UnavailableNote({ message }: { message: string }) {
  return (
    <div className="border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-200/90">
      {message}
    </div>
  )
}

function LoadMoreButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-transparent px-5 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Load more
      </button>
    </div>
  )
}

function Participant({ wallet, username, avatarUrl }: { wallet: string; username?: string | null; avatarUrl?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        // Hero/avatars may point at any administrator-set host; plain img
        // avoids narrowing next/image remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : null}
      <span className="truncate text-sm text-[var(--color-text-primary)]" title={wallet}>
        {username || shortWallet(wallet)}
      </span>
    </div>
  )
}

function ShareRow({ canonicalUrl }: { canonicalUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(canonicalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (permissions/http) — the URL stays visible.
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <code className="max-w-full truncate border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
        {canonicalUrl}
      </code>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}

function MetricsGrid({ metrics }: { metrics: NonNullable<TagPageResponse['metrics']> }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-border-default)] lg:grid-cols-4">
      {METRIC_CELLS.map(cell => (
        <div key={cell.key} className="attack-stat-cell">
          <div className="font-display text-xl font-extrabold text-white md:text-3xl">
            {formatMetric(metrics[cell.key], cell.format)}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] md:text-xs">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function SortSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-label="Sort leaderboard by metric"
      className="border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2 py-1 text-xs text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-border-strong)]"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function DefenderBoard({ slug }: { slug: string }) {
  const [sort, setSort] = useState('composite_score')
  const query = useTagDefenders(slug, sort)
  const entries = useMemo(
    () => (query.data?.pages ?? []).flatMap(page => page.defenders),
    [query.data]
  )
  const total = query.data?.pages[0]?.total ?? 0
  const available = query.data?.pages[0]?.available ?? true

  return (
    <Panel
      title="Top Defenders"
      action={<SortSelect value={sort} options={TAG_DEFENDER_SORT_OPTIONS} onChange={setSort} />}
    >
      {!available ? (
        <UnavailableNote message="Defender rankings are temporarily unavailable." />
      ) : query.isLoading ? (
        <div className="py-10 text-center text-xs text-[var(--color-text-muted)]">Loading…</div>
      ) : entries.length === 0 ? (
        <MiniEmpty message="No qualifying defenders for this tag yet." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                  <th className="py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-2 font-medium">Defender</th>
                  <th className="py-2 pr-2 text-right font-medium">Sentinels</th>
                  <th className="py-2 pr-2 text-right font-medium">Attacks</th>
                  <th className="py-2 pr-2 text-right font-medium">Breached</th>
                  <th className="py-2 pr-2 text-right font-medium">Active</th>
                  <th className="py-2 pr-2 text-right font-medium">Breach rate</th>
                  <th className="py-2 text-right font-medium">Bounty paid</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <DefenderRow key={entry.wallet} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
          {query.hasNextPage ? (
            <LoadMoreButton onClick={() => query.fetchNextPage()} isLoading={query.isFetchingNextPage} />
          ) : (
            total > entries.length && null
          )}
        </>
      )}
    </Panel>
  )
}

function DefenderRow({ entry }: { entry: TagDefenderEntry }) {
  return (
    <tr className="border-b border-[var(--color-border-subtle)] last:border-0">
      <td className="py-2.5 pr-2 text-xs text-[var(--color-text-muted)]">{entry.rank}</td>
      <td className="py-2.5 pr-2">
        <Participant wallet={entry.wallet} username={entry.username} avatarUrl={entry.avatar_url} />
      </td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.sentinelsLaunched}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.attacksOnSentinels}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.breachedSentinels}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.activeSentinels}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{formatMetric(entry.breachRatePct, 'pct')}</td>
      <td className="py-2.5 text-right tabular-nums text-[var(--color-text-secondary)]">{formatMetric(entry.bountyPaidUsd, 'usd')}</td>
    </tr>
  )
}

function AttackerBoard({ slug }: { slug: string }) {
  const [sort, setSort] = useState('composite_score')
  const query = useTagAttackers(slug, sort)
  const entries = useMemo(
    () => (query.data?.pages ?? []).flatMap(page => page.attackers),
    [query.data]
  )
  const total = query.data?.pages[0]?.total ?? 0
  const available = query.data?.pages[0]?.available ?? true

  return (
    <Panel
      title="Top Attackers"
      action={<SortSelect value={sort} options={TAG_ATTACKER_SORT_OPTIONS} onChange={setSort} />}
    >
      {!available ? (
        <UnavailableNote message="Attacker rankings are temporarily unavailable." />
      ) : query.isLoading ? (
        <div className="py-10 text-center text-xs text-[var(--color-text-muted)]">Loading…</div>
      ) : entries.length === 0 ? (
        <MiniEmpty message="No qualifying attackers for this tag yet." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                  <th className="py-2 pr-2 font-medium">#</th>
                  <th className="py-2 pr-2 font-medium">Attacker</th>
                  <th className="py-2 pr-2 text-right font-medium">Attacks</th>
                  <th className="py-2 pr-2 text-right font-medium">Breaches</th>
                  <th className="py-2 pr-2 text-right font-medium">Breach rate</th>
                  <th className="py-2 text-right font-medium">Bounty won</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <AttackerRow key={entry.wallet} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
          {query.hasNextPage ? (
            <LoadMoreButton onClick={() => query.fetchNextPage()} isLoading={query.isFetchingNextPage} />
          ) : (
            total > entries.length && null
          )}
        </>
      )}
    </Panel>
  )
}

function AttackerRow({ entry }: { entry: TagAttackerEntry }) {
  return (
    <tr className="border-b border-[var(--color-border-subtle)] last:border-0">
      <td className="py-2.5 pr-2 text-xs text-[var(--color-text-muted)]">{entry.rank}</td>
      <td className="py-2.5 pr-2">
        <Participant wallet={entry.wallet} username={entry.username} avatarUrl={entry.avatar_url} />
      </td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.totalAttacks}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{entry.successfulBreaches}</td>
      <td className="py-2.5 pr-2 text-right tabular-nums text-[var(--color-text-secondary)]">{formatMetric(entry.breachRatePct, 'pct')}</td>
      <td className="py-2.5 text-right tabular-nums text-[var(--color-text-secondary)]">{formatMetric(entry.bountyWonUsd, 'usd')}</td>
    </tr>
  )
}

const SENTINEL_STATUS_BADGE: Record<TagSentinelStatus, string> = {
  active: 'border-white/40 text-white',
  breached: 'border-red-500/40 text-red-300',
  closed: 'border-[var(--color-border-default)] text-[var(--color-text-muted)]',
}

function SentinelsSection({ slug, initialTotal }: { slug: string; initialTotal: number }) {
  const [status, setStatus] = useState('')
  const query = useTagSentinels(slug, status)
  const sentinels = useMemo(
    () => (query.data?.pages ?? []).flatMap(page => page.sentinels),
    [query.data]
  )
  const total = query.data?.pages[0]?.total ?? initialTotal
  const available = query.data?.pages[0]?.available ?? true

  return (
    <Panel
      title="Sentinels"
      action={
        <div className="flex flex-wrap gap-1">
          {SENTINEL_STATUS_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={`border px-2.5 py-1 text-xs transition-colors ${
                status === filter.value
                  ? 'border-white bg-white text-black'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      }
    >
      {!available ? (
        <UnavailableNote message="The Sentinel list is temporarily unavailable." />
      ) : query.isLoading ? (
        <div className="py-10 text-center text-xs text-[var(--color-text-muted)]">Loading…</div>
      ) : sentinels.length === 0 ? (
        <MiniEmpty message={total === 0 && !status ? 'No Sentinels assigned to this tag yet.' : `No ${status || 'matching'} Sentinels.`} />
      ) : (
        <>
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {sentinels.map(sentinel => (
              <li key={sentinel.agentId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Swords className="h-3.5 w-3.5 text-[var(--color-text-faint)]" />
                  <span className="text-[var(--color-text-primary)]">Sentinel #{sentinel.agentId}</span>
                  {sentinel.owner ? (
                    <span className="text-xs text-[var(--color-text-faint)]" title={sentinel.owner}>
                      {shortWallet(sentinel.owner)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--color-text-faint)]">Launched {formatDate(sentinel.launchedAt)}</span>
                  <span className={`border px-2 py-0.5 uppercase tracking-wide ${SENTINEL_STATUS_BADGE[sentinel.status]}`}>
                    {sentinel.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {query.hasNextPage ? (
            <LoadMoreButton onClick={() => query.fetchNextPage()} isLoading={query.isFetchingNextPage} />
          ) : null}
        </>
      )}
    </Panel>
  )
}

function ActivitySection({ entries, available }: { entries: TagActivityEntry[]; available: boolean }) {
  return (
    <Panel title="Recent Activity">
      {!available ? (
        <UnavailableNote message="Recent activity is temporarily unavailable." />
      ) : entries.length === 0 ? (
        <MiniEmpty message="No recent activity for this tag yet." />
      ) : (
        <ul className="divide-y divide-[var(--color-border-subtle)]">
          {entries.map((event, index) => (
            <li key={`${event.kind}-${event.agentId}-${event.timestamp}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                {event.kind === 'breach' ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Swords className="h-3.5 w-3.5 text-[var(--color-text-faint)]" />
                )}
                <span className={event.kind === 'breach' ? 'text-red-300' : 'text-[var(--color-text-secondary)]'}>
                  {event.kind === 'breach' ? 'Breached' : 'Attack held'}
                </span>
                <span className="text-xs text-[var(--color-text-faint)]">Sentinel #{event.agentId}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {event.bountyWonUsd != null ? (
                  <span className="tabular-nums text-[var(--color-text-secondary)]">
                    {formatMetric(event.bountyWonUsd, 'usd')} bounty
                  </span>
                ) : null}
                <span className="text-[var(--color-text-muted)]">{displayName({ wallet: event.wallet })}</span>
                <span className="text-[var(--color-text-faint)]">{formatDate(event.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default function TagPageView({ slug }: { slug: string }) {
  const query = useTagPage(slug)

  if (query.isLoading) {
    return (
      <div className="relative min-h-full bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-5xl px-3 py-6 md:px-12 md:py-12">
          <div className="h-40 animate-pulse border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] md:h-64" />
          <div className="mt-6 h-8 w-2/3 animate-pulse bg-[var(--color-bg-elevated)]" />
          <div className="mt-3 h-4 w-1/2 animate-pulse bg-[var(--color-bg-elevated)]" />
        </div>
      </div>
    )
  }

  // Unknown slug, unpublished page, and unassigned custom URLs all land here
  // (AC-STL-001.3/.004): no tag page content is displayed.
  if (!query.data) {
    return (
      <div className="relative min-h-full bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-5xl px-3 py-6 md:px-12 md:py-12">
          <div className="flex flex-col items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-24 text-center">
            <FileQuestion className="mb-4 h-10 w-10 text-[var(--color-text-faint)]" />
            <h1 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-white">Page Not Found</h1>
            <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              This tag page does not exist or is not publicly available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const page = query.data
  const canonicalUrl = `${SUI_SENTINEL_APP_URL}/tags/${page.tag.slug}`
  const description = page.metadata.description ?? page.metadata.share_copy

  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="mx-auto max-w-5xl px-3 py-6 md:px-12 md:py-12">
        {/* Campaign identity (AC-STL-002.1/.002.2): hero image and share copy
            render only when published; no placeholder implies an image. */}
        {page.metadata.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.metadata.hero_image_url}
            alt={`${page.metadata.title} hero`}
            className="mb-6 h-48 w-full object-cover md:h-72"
          />
        ) : null}

        <header className="mb-8">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-faint)] md:text-xs">
            Tag · {page.tag.name}
          </div>
          <h1 className="font-display mt-2 text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            {page.metadata.title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-text-secondary)] md:text-base">
              {description}
            </p>
          ) : null}
          {page.metadata.share_copy ? (
            <p className="mt-3 border-l-2 border-[var(--color-border-strong)] pl-3 text-sm italic text-[var(--color-text-muted)]">
              {page.metadata.share_copy}
            </p>
          ) : null}
          <ShareRow canonicalUrl={canonicalUrl} />
        </header>

        <section className="mb-8">
          <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-[0.08em] text-white">
            Mainnet Activity
          </h2>
          {!page.metricsAvailable || !page.metrics ? (
            <UnavailableNote message="Activity metrics are temporarily unavailable. Check back soon — values are never shown stale." />
          ) : (
            <>
              <MetricsGrid metrics={page.metrics} />
              {page.lastComputedAt ? (
                <p className="mt-2 text-[10px] text-[var(--color-text-faint)] md:text-xs">
                  Aggregated from mainnet activity · computed {formatDate(page.lastComputedAt)}
                </p>
              ) : null}
            </>
          )}
        </section>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <DefenderBoard slug={page.tag.slug} />
          <AttackerBoard slug={page.tag.slug} />
        </div>

        <div className="mb-8">
          <SentinelsSection slug={page.tag.slug} initialTotal={page.sentinels.total} />
        </div>

        <ActivitySection entries={page.activity.entries} available={page.activity.available} />
      </div>
    </div>
  )
}

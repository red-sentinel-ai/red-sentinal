'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Lock, Unlock } from 'lucide-react'

import { generateAvatarUrl } from '@/lib/utils'
import type { BackendSyndicate } from '@/types/Syndicate'

interface SyndicateChatSidebarProps {
  meta: BackendSyndicate
  tokenSymbol: string
  formattedTVL: string | null
  formattedIdle: string | null
  formattedPendingFees: string | null
}

export function SyndicateChatSidebar({
  meta,
  tokenSymbol,
  formattedTVL,
  formattedIdle,
  formattedPendingFees,
}: SyndicateChatSidebarProps) {
  const isPermissioned = meta.whitelist_enabled
  const sentinelIcon = meta.agent_image || generateAvatarUrl(meta.agent_id ?? meta.contract_address)

  const metrics: { label: string; value: string | null }[] = [
    { label: 'TOTAL_MANAGED_ASSET', value: formattedTVL },
    { label: 'IDLE_PRINCIPAL', value: formattedIdle },
    { label: 'PENDING_FEES', value: formattedPendingFees },
  ]

  return (
    <div className="terminal-scrollbar flex h-full flex-col gap-6 overflow-y-auto bg-[var(--color-bg-base)] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]">
          <Image
            src={sentinelIcon}
            width={56}
            height={56}
            alt={meta.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
            {meta.name}
          </h2>
          <Link
            href={`/syndicate/${meta.contract_address}`}
            className="industrial-header text-[10px] tracking-widest text-[var(--color-text-muted)] transition-colors hover:text-white"
          >
            VIEW_SYNDICATE
          </Link>
        </div>
      </div>

      {meta.description && (
        <p className="font-mono text-[12px] leading-relaxed text-[var(--color-text-muted)]">
          {meta.description}
        </p>
      )}

      <div className="flex items-start gap-2 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2.5">
        {isPermissioned ? (
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold-primary)]" />
        ) : (
          <Unlock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        )}
        <p className="font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {isPermissioned
            ? 'This syndicate is permissioned. Owner approval is required to join.'
            : 'This syndicate is public. Anybody can join.'}
        </p>
      </div>

      <div className="space-y-3 border-t border-[var(--color-border-strong)] pt-6">
        {metrics.map(metric => (
          <div key={metric.label} className="flex items-center justify-between gap-4">
            <span className="industrial-header text-[10px] tracking-widest text-[var(--color-text-muted)]">
              {metric.label}
            </span>
            <span className="industrial-header text-right text-[12px] text-[var(--color-text-primary)]">
              {metric.value ?? '—'} {metric.value ? tokenSymbol : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

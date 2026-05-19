'use client'

import { Bell, Loader2, Send, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  TelegramSubscription,
  useTelegramSubscriptions,
} from '@/hooks/telegram/useTelegramSubscriptions'
import { useDeleteTelegramSubscription } from '@/hooks/telegram/useDeleteTelegramSubscription'
import { APP_NETWORK } from '@/constants'

type Props = {
  walletAddress: string
}

const ROLE_LABEL: Record<TelegramSubscription['role'], string> = {
  defender: 'Defender alerts',
  attacker: 'Attacker watch',
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return 'never'
  const d = new Date(dateStr).getTime()
  if (Number.isNaN(d)) return 'unknown'
  const diff = Date.now() - d
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  return `${days} d ago`
}

export function TelegramSubscriptionsSection({ walletAddress }: Props) {
  const { data, isLoading, error } = useTelegramSubscriptions(walletAddress)
  const { mutate: deleteSub, isPending: isDeleting } = useDeleteTelegramSubscription()

  const subs = data?.subscriptions ?? []

  const handleDelete = (id: string, label: string) => {
    deleteSub(
      { id, walletAddress },
      {
        onSuccess: result => {
          if (result.deleted) {
            toast.success(`Unsubscribed from ${label}`)
          } else {
            toast.error('Could not unsubscribe — please refresh and try again')
          }
        },
        onError: err => toast.error(err.message),
      }
    )
  }

  return (
    <div className="mb-10 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Send className="h-5 w-5 text-[#229ED9]" />
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Telegram Subscriptions
        </h2>
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
          {APP_NETWORK}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading subscriptions…
        </div>
      ) : error ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Couldn&apos;t load subscriptions. Please refresh.
        </p>
      ) : subs.length === 0 ? (
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-4 w-4 text-[var(--color-text-faint)]" />
          <p className="text-sm text-[var(--color-text-muted)]">
            No active subscriptions yet. Tap <b>Connect Telegram</b> on a sentinel to start receiving DM alerts when it&apos;s attacked or defeated.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-border-subtle)]">
          {subs.map(sub => {
            const label = sub.agent_name || `Sentinel ${sub.agent_id.slice(0, 8)}…`
            return (
              <li key={sub._id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {sub.agent_path ? (
                      <Link
                        href={`/attack/${sub.agent_path}`}
                        className="truncate text-sm font-semibold text-[var(--color-text-primary)] hover:underline"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {label}
                      </span>
                    )}
                    <span className="rounded bg-[#229ED9]/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#229ED9]">
                      {ROLE_LABEL[sub.role] ?? sub.role}
                    </span>
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                      {sub.chain}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    Last alert: {formatRelative(sub.last_notified_at)}
                    {sub.telegram_username ? ` • @${sub.telegram_username}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(sub._id, label)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Unsubscribe from ${label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Unsubscribe
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

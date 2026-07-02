'use client'

import Link from 'next/link'
import { BellRing, X } from 'lucide-react'
import { useConnectSocialPrompt } from '@/hooks/useConnectSocialPrompt'

export function ConnectSocialPrompt() {
  const { open, remindLater, dismiss, enableNotifications } = useConnectSocialPrompt()

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div className="pointer-events-auto relative w-full max-w-md border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] duration-300 animate-in fade-in slide-in-from-top-4">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-[var(--color-text-muted)] opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
            <BellRing className="h-4 w-4 text-[var(--color-error)]" />
          </div>

          <div className="flex flex-col gap-2 pr-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Never miss a critical alert
              </p>
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                Know the moment your Sentinel is breached, a bounty is claimed, or someone
                mentions you.
              </p>
            </div>

            <div className="mt-1 flex items-center gap-3">
              <Link
                href="/profile"
                onClick={enableNotifications}
                className="inline-flex items-center justify-center whitespace-nowrap border border-[var(--color-text-primary)] bg-[var(--color-text-primary)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-bg-base)] transition-opacity hover:opacity-90"
              >
                Enable Notifications
              </Link>
              <button
                type="button"
                onClick={remindLater}
                className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

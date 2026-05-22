'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEmailVerification } from '@/hooks/profile/useEmailVerification'

export default function VerifyEmailClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { state, confirmMerge, cancelMerge } = useEmailVerification(token)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-sm overflow-hidden">
        <div className="flex justify-center px-10 pt-10 pb-5">
          <Image src="/redSentinel.jpeg" alt="Red Sentinel" width={180} height={48} />
        </div>

        <div className="h-px mx-10 bg-[var(--color-border-subtle)]" />

        <div className="px-10 py-8 text-center">
          {(state.status === 'verifying' || state.status === 'merging') && (
            <>
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-gold-primary)] border-t-transparent" />
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {state.status === 'merging' ? 'Merging accounts…' : 'Verifying your email…'}
              </h1>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Please wait a moment.</p>
            </>
          )}

          {state.status === 'success' && (
            <>
              <Image src="/icons/check-circle.svg" alt="Success" width={48} height={48} className="mx-auto mb-5" />
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                Email <span style={{ color: 'var(--color-gold-primary)' }}>Connected!</span>
              </h1>
              {state.email && (
                <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">{state.email}</p>
              )}
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Redirecting you to your profile…</p>
            </>
          )}

          {state.status === 'error' && (
            <>
              <Image src="/icons/x-circle.svg" alt="Error" width={48} height={48} className="mx-auto mb-5" />
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Verification Failed</h1>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{state.errorMessage}</p>
              <Link
                href="/profile"
                className="mt-6 inline-block rounded-lg bg-[var(--color-gold-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--color-bg-surface)] hover:opacity-90"
              >
                Back to Profile
              </Link>
            </>
          )}

          {state.status === 'merge_prompt' && (
            <>
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-2xl">
                ⚠️
              </div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                Email already linked to{' '}
                <span style={{ color: 'var(--color-gold-primary)' }}>another account</span>
              </h1>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                <strong>{state.email}</strong> is already connected to:
              </p>

              <div className="mt-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  {state.otherAccount.avatarUrl && (
                    <Image
                      src={state.otherAccount.avatarUrl}
                      alt={state.otherAccount.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      @{state.otherAccount.username}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {state.otherAccount.totalPoints.toLocaleString()} SENTINEL points
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    Wallets ({state.otherAccount.wallets.length})
                  </p>
                  {state.otherAccount.wallets.map(w => (
                    <p key={w.address} className="truncate font-mono text-xs text-[var(--color-text-muted)]">
                      {w.address}
                    </p>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                Merging will combine both accounts into your current one. All wallets, points, and
                activity will be transferred.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={cancelMerge}
                  className="flex-1 rounded-lg border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMerge}
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-bg-surface)] hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-gold-primary)' }}
                >
                  Merge Accounts
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-[var(--color-text-primary)] px-5 py-5 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">© 2026 Red Sentinel. All Rights Reserved.</p>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">Securing the future of On-Chain AI.</p>
        </div>
      </div>
    </div>
  )
}

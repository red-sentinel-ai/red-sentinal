import { Suspense } from 'react'
import VerifyEmailClient from './VerifyEmailClient'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailClient />
    </Suspense>
  )
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-base)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-sm overflow-hidden">
        <div className="px-10 py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-gold-primary)] border-t-transparent" />
        </div>
      </div>
    </div>
  )
}

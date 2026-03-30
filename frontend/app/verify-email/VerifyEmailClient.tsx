'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useEmailVerification } from '@/hooks/profile/useEmailVerification'

export default function VerifyEmailClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { status, email, errorMessage } = useEmailVerification(token)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EAEAEA] bg-white shadow-sm overflow-hidden">
        <div className="flex justify-center px-10 pt-10 pb-5">
          <Image src="/icons/logo_large.svg" alt="Sui Sentinel" width={180} height={48} />
        </div>

        <div className="h-px mx-10 bg-[#EAEAEA]" />

        <div className="px-10 py-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-[#F445AB] border-t-transparent" />
              <h1 className="text-2xl font-semibold">Verifying your email…</h1>
              <p className="mt-3 text-sm text-[#5F5C5C]">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <Image src="/icons/check-circle.svg" alt="Success" width={48} height={48} className="mx-auto mb-5" />
              <h1 className="text-2xl font-semibold">
                Email <span style={{ color: '#F445AB' }}>Connected!</span>
              </h1>
              {email && <p className="mt-2 text-sm font-medium text-[#5F5C5C]">{email}</p>}
              <p className="mt-3 text-sm text-[#5F5C5C]">Redirecting you to your profile…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <Image src="/icons/x-circle.svg" alt="Error" width={48} height={48} className="mx-auto mb-5" />
              <h1 className="text-2xl font-semibold">Verification Failed</h1>
              <p className="mt-3 text-sm text-[#5F5C5C]">{errorMessage}</p>
              <Link
                href="/profile"
                className="mt-6 inline-block rounded-lg bg-[#F445AB] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Back to Profile
              </Link>
            </>
          )}
        </div>

        <div className="bg-[#111111] px-5 py-5 text-center">
          <p className="text-xs text-[#666666]">© 2026 Sui Sentinel. All Rights Reserved.</p>
          <p className="mt-1 text-xs text-[#444444]">Securing the future of On-Chain AI.</p>
        </div>
      </div>
    </div>
  )
}

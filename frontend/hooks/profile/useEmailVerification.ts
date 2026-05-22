'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export type MergeCandidate = {
  userId: string
  username: string
  avatarUrl: string | null
  totalPoints: number
  lifetimePoints: number
  wallets: { address: string; chainType: string }[]
}

type VerifyState =
  | { status: 'verifying' }
  | { status: 'success'; email: string }
  | { status: 'error'; errorMessage: string }
  | { status: 'merge_prompt'; email: string; currentUserId: string; otherAccount: MergeCandidate }
  | { status: 'merging' }

export function useEmailVerification(token: string | null) {
  const router = useRouter()
  const [state, setState] = useState<VerifyState>({ status: 'verifying' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', errorMessage: 'No verification token found.' })
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.needsMerge) {
          setState({
            status: 'merge_prompt',
            email: data.email,
            currentUserId: data.currentUserId,
            otherAccount: data.otherAccount,
          })
        } else if (data.success) {
          setState({ status: 'success', email: data.email })
          setTimeout(() => router.push('/profile?connected=email'), 3000)
        } else {
          setState({ status: 'error', errorMessage: data.error || 'Verification failed.' })
        }
      })
      .catch(() => {
        setState({ status: 'error', errorMessage: 'Something went wrong. Please try again.' })
      })
  }, [token, router])

  async function confirmMerge() {
    if (state.status !== 'merge_prompt') return
    const { email, currentUserId, otherAccount } = state
    setState({ status: 'merging' })

    try {
      const res = await fetch('/api/profile/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survivorUserId: currentUserId,
          mergingUserId: otherAccount.userId,
          email,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setState({ status: 'success', email: data.email })
        setTimeout(() => router.push('/profile?connected=email&merged=true'), 3000)
      } else {
        setState({ status: 'error', errorMessage: data.error || 'Merge failed.' })
      }
    } catch {
      setState({ status: 'error', errorMessage: 'Something went wrong during merge.' })
    }
  }

  function cancelMerge() {
    if (state.status !== 'merge_prompt') return
    router.push('/profile')
  }

  return { state, confirmMerge, cancelMerge }
}

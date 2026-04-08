'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useEmailVerification(token: string | null) {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('No verification token found.')
      return
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmail(data.email)
          setStatus('success')
          setTimeout(() => router.push('/profile?connected=email'), 3000)
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
      })
  }, [token, router])

  return { status, email, errorMessage }
}

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { SUI_SENTINEL_API_URL } from '@/constants'

type EmailVerificationState =
  | 'idle'
  | 'email_input'
  | 'sending'
  | 'code_input'
  | 'verifying'
  | 'success'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useEmailOtpVerification(userId: string | undefined) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [state, setState] = useState<EmailVerificationState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const start = useCallback(() => {
    setState('email_input')
    setEmail('')
    setCode('')
    setErrorMessage('')
  }, [])

  const sendCode = useCallback(async () => {
    if (!userId) {
      toast.error('Please connect your wallet first')
      return false
    }

    const trimmed = email.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      toast.error('Please enter a valid email address')
      return false
    }

    setState('sending')
    setErrorMessage('')

    try {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/auth/email/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ email: trimmed }),
      })

      if (res.ok) {
        setEmail(trimmed)
        setCode('')
        setState('code_input')
        toast.success(`Code sent to ${trimmed}`)
        return true
      }

      const data = await res.json().catch(() => ({}))
      const msg = data.message || data.error || 'Failed to send code'
      setState('email_input')
      setErrorMessage(msg)
      toast.error(msg)
      return false
    } catch {
      const msg = 'Something went wrong. Please try again.'
      setState('email_input')
      setErrorMessage(msg)
      toast.error(msg)
      return false
    }
  }, [userId, email])

  const verifyCode = useCallback(async () => {
    if (!userId) {
      toast.error('Please connect your wallet first')
      return false
    }

    if (code.trim().length !== 4) {
      toast.error('Please enter a valid 4-digit code')
      return false
    }

    setState('verifying')
    setErrorMessage('')

    try {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/auth/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })

      if (res.ok) {
        setState('success')
        toast.success('Email connected successfully!')
        return true
      }

      const data = await res.json().catch(() => ({}))
      const msg = data.message || data.error || 'Verification failed'
      setState('code_input')
      setErrorMessage(msg)
      toast.error(msg)
      return false
    } catch {
      const msg = 'Something went wrong. Please try again.'
      setState('code_input')
      setErrorMessage(msg)
      toast.error(msg)
      return false
    }
  }, [userId, email, code])

  const changeEmail = useCallback(() => {
    setState('email_input')
    setCode('')
    setErrorMessage('')
  }, [])

  const cancel = useCallback(() => {
    setState('idle')
    setEmail('')
    setCode('')
    setErrorMessage('')
  }, [])

  return {
    email,
    setEmail,
    code,
    setCode,
    state,
    errorMessage,
    start,
    sendCode,
    verifyCode,
    changeEmail,
    cancel,
  }
}

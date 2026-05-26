'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { SUI_SENTINEL_API_URL } from '@/constants'

type TelegramVerificationState = 'idle' | 'input' | 'verifying' | 'success' | 'error'

export function useTelegramVerification(userId: string | undefined) {
  const [code, setCode] = useState('')
  const [state, setState] = useState<TelegramVerificationState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const showCodeInput = useCallback(() => {
    setState('input')
    setCode('')
    setErrorMessage('')
  }, [])

  const verifyCode = useCallback(async () => {
    if (!userId) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!code.trim() || code.trim().length !== 4) {
      toast.error('Please enter a valid 4-digit code')
      return
    }

    setState('verifying')
    setErrorMessage('')

    try {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/auth/telegram/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (res.ok) {
        setState('success')
        toast.success('Telegram connected successfully!')
        return true
      } else {
        const data = await res.json()
        setState('error')
        const msg = data.message || data.error || 'Verification failed'
        setErrorMessage(msg)
        toast.error(msg)
        return false
      }
    } catch {
      setState('error')
      const msg = 'Something went wrong. Please try again.'
      setErrorMessage(msg)
      toast.error(msg)
      return false
    }
  }, [userId, code])

  const reset = useCallback(() => {
    setState('idle')
    setCode('')
    setErrorMessage('')
  }, [])

  const cancel = useCallback(() => {
    setState('idle')
    setCode('')
    setErrorMessage('')
  }, [])

  return {
    code,
    setCode,
    state,
    errorMessage,
    showCodeInput,
    verifyCode,
    reset,
    cancel,
  }
}

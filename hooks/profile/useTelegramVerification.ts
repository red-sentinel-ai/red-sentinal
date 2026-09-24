'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { verifyTelegram as verifyTelegramApi, AuthApiError } from '@/lib/auth-api'

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
      await verifyTelegramApi(userId, { code: code.trim() })
      setState('success')
      toast.success('Telegram connected successfully!')
      return true
    } catch (error) {
      setState('error')
      const msg =
        error instanceof AuthApiError
          ? error.message
          : 'Something went wrong. Please try again.'
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

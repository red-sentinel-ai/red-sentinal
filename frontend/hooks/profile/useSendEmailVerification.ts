'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function useSendEmailVerification(walletAddress: string | undefined) {
  const [emailInput, setEmailInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')

  async function sendVerificationLink() {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }
    if (!emailInput.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), walletAddress }),
      })
      const data = await res.json()

      if (data.success) {
        setSentToEmail(emailInput.trim())
        setLinkSent(true)
        setEmailInput('')
      } else {
        toast.error(data.error || 'Failed to send verification email')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  function reset() {
    setLinkSent(false)
    setSentToEmail('')
  }

  return { emailInput, setEmailInput, isSending, linkSent, sentToEmail, sendVerificationLink, reset }
}

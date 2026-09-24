'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const STORAGE_KEY = 'connectSocialPopupDismissedAt'
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const SHOW_DELAY_MS = 1000
const SOCIAL_PLATFORMS = ['email', 'telegram']

/** Paths where we never interrupt with the prompt (the page where they'd act on it). */
const EXCLUDED_PATHS = ['/profile']

function wasDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (!Number.isFinite(dismissedAt)) return false
  return Date.now() - dismissedAt < SNOOZE_MS
}

function snooze() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
}

/**
 * Drives the "Enable notifications" prompt shown to authenticated users who have
 * not connected email or telegram. Dismissing snoozes it for 7 days via localStorage.
 */
export function useConnectSocialPrompt() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const hasSocial = !!user?.social_connections?.some(conn =>
    SOCIAL_PLATFORMS.includes(conn.platform.toLowerCase())
  )

  const eligible =
    !isLoading &&
    isAuthenticated &&
    !hasSocial &&
    !EXCLUDED_PATHS.includes(pathname) &&
    !wasDismissedRecently()

  useEffect(() => {
    if (!eligible) {
      setOpen(false)
      return
    }
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [eligible])

  const remindLater = () => {
    snooze()
    setOpen(false)
  }

  const dismiss = () => {
    setOpen(false)
  }

  const enableNotifications = () => {
    snooze()
    setOpen(false)
  }

  return { open, remindLater, dismiss, enableNotifications }
}

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import posthog from 'posthog-js'

const DISMISSED_KEY = 'pwa_nudge_dismissed_at'
const DISMISSED_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallPromptContextValue {
  /** True if the browser fired beforeinstallprompt AND the app is not yet installed */
  canInstall: boolean
  /** True when running in standalone (installed PWA) mode */
  isInstalled: boolean
  /** True on iOS Safari — no beforeinstallprompt, needs manual guide */
  isIOS: boolean
  /** True if the user dismissed the nudge within the last 7 days */
  isDismissed: boolean
  /** Trigger the native install prompt (Android/Chrome) or show the iOS guide */
  showInstallPrompt: () => void
  /** Suppress the nudge for 7 days */
  dismissPrompt: () => void
  /** Whether the iOS guide dialog is open */
  iosGuideOpen: boolean
  setIosGuideOpen: (open: boolean) => void
}

const InstallPromptContext = createContext<InstallPromptContextValue>({
  canInstall: false,
  isInstalled: false,
  isIOS: false,
  isDismissed: false,
  showInstallPrompt: () => {},
  dismissPrompt: () => {},
  iosGuideOpen: false,
  setIosGuideOpen: () => {},
})

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [iosGuideOpen, setIosGuideOpen] = useState(false)

  useEffect(() => {
    // Detect standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsInstalled(standalone)

    // Track standalone session for analytics
    if (standalone) {
      posthog.capture('pwa_standalone_session')
    }

    // Detect iOS Safari
    const ua = navigator.userAgent
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(ios)

    // Check 7-day dismissal
    const dismissedAt = localStorage.getItem(DISMISSED_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISSED_DURATION_MS) {
        setIsDismissed(true)
      } else {
        localStorage.removeItem(DISMISSED_KEY)
      }
    }

    // Capture beforeinstallprompt (Android/Chrome/Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Track successful installs
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      deferredPromptRef.current = null
      posthog.capture('pwa_installed')
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = useCallback(() => {
    if (isIOS) {
      setIosGuideOpen(true)
      return
    }
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt()
      deferredPromptRef.current.userChoice.then(choice => {
        posthog.capture('pwa_install_prompt_response', { outcome: choice.outcome })
        deferredPromptRef.current = null
        setCanInstall(false)
      })
    }
  }, [isIOS])

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setIsDismissed(true)
    posthog.capture('pwa_nudge_dismissed')
  }, [])

  return (
    <InstallPromptContext.Provider
      value={{
        canInstall,
        isInstalled,
        isIOS,
        isDismissed,
        showInstallPrompt,
        dismissPrompt,
        iosGuideOpen,
        setIosGuideOpen,
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  )
}

export function useInstallPrompt() {
  return useContext(InstallPromptContext)
}

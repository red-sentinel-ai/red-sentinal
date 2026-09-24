'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import Image from 'next/image'
import { useInstallPrompt } from '@/context/InstallPromptContext'
import { cn } from '@/lib/utils'

const NUDGE_DELAY_MS = 10000

export function PWAInstallBanner() {
  const pathname = usePathname()
  const { canInstall, isInstalled, isDismissed, isIOS, showInstallPrompt, dismissPrompt } =
    useInstallPrompt()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.innerWidth < 768
    const isInstallPage = pathname === '/install'
    const eligible =
      isMobile && !isInstalled && !isDismissed && !isInstallPage && (canInstall || isIOS)

    if (!eligible) return

    const timer = setTimeout(() => {
      setVisible(true)
      posthog.capture('pwa_nudge_shown')
    }, NUDGE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled, isDismissed, isIOS, pathname])

  const handleDismiss = () => {
    setVisible(false)
    dismissPrompt()
    posthog.capture('pwa_nudge_dismissed')
  }

  const handleInstall = () => {
    setVisible(false)
    showInstallPrompt()
    posthog.capture('pwa_nudge_clicked')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--color-border-strong)]',
            'pb-safe bg-[var(--color-bg-surface)] px-4 pt-3 shadow-[var(--shadow-elevated)]'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--color-bg-base)]">
              <Image
                src="/icons/pwa-192x192.png"
                alt="Red Sentinel"
                width={48}
                height={48}
                className="h-10 w-10"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold uppercase tracking-[0.06em] text-[var(--color-text-primary)]">
                Red Sentinel
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Play AI security — anywhere. Install for quick access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-none bg-[var(--color-text-primary)] px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
                className="flex h-9 w-9 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState, useSyncExternalStore } from 'react'
import { WifiOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function useOnline() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine,
    () => true
  )
}

export function OfflineBanner() {
  const isOnline = useOnline()
  const [dismissed, setDismissed] = useState(false)

  if (isOnline || dismissed) return null

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-yellow-900/50',
        'bg-yellow-900/90 px-4 py-2.5 pb-safe text-center text-sm text-yellow-200'
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span className="flex-1">You are offline. Some features may be unavailable.</span>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss offline notice"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-yellow-200/80 transition-colors hover:bg-yellow-950/30 hover:text-yellow-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { toast as sonnerToast, Toaster } from 'sonner'
import type { ExternalToast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Common toast wrapper — the app-wide replacement for importing { toast }
 * from 'sonner'. Every string toast gets a Copy button so users can lift
 * error messages / tx hashes straight out of the notification.
 *
 * Non-string content (JSX) and toasts that already define an action pass
 * through untouched; everything not overridden below is forwarded verbatim.
 */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label="Copy message"
      onClick={event => {
        event.stopPropagation()
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
          .catch(() => {})
      }}
      className={cn(
        'shrink-0 cursor-pointer border border-[var(--color-border-default)] px-2 py-1',
        'text-[11px] font-medium uppercase tracking-wide transition-opacity',
        copied
          ? 'text-[var(--color-text-muted)]'
          : 'text-[var(--color-text-primary)] opacity-70 hover:opacity-100'
      )}
      style={{ borderRadius: 0 }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

type ToastMethod = (
  message: string | React.ReactNode,
  data?: ExternalToast
) => string | number

function wrap(method: ToastMethod): ToastMethod {
  return (message, data) => {
    if (typeof message !== 'string') return method(message, data)
    return method(message, {
      ...data,
      action: data?.action ?? <CopyButton text={message} />,
    })
  }
}

// Callable like sonner's own toast, which is assembled the same way.
const toastFunction = (message: string | React.ReactNode, data?: ExternalToast) =>
  sonnerToast(message, data)

export const toast = Object.assign(toastFunction, sonnerToast, {
  error: wrap(sonnerToast.error),
  success: wrap(sonnerToast.success),
  info: wrap(sonnerToast.info),
  warning: wrap(sonnerToast.warning),
  loading: wrap(sonnerToast.loading),
})

export { Toaster }

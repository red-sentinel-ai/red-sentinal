'use client'

import { Download, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInstallPrompt } from '@/context/InstallPromptContext'

type InstallButtonProps = {
  variant?: 'button' | 'sidebar' | 'link'
  className?: string
  onClick?: () => void
}

export function InstallButton({ variant = 'button', className, onClick }: InstallButtonProps) {
  const { isInstalled, showInstallPrompt } = useInstallPrompt()

  if (isInstalled) {
    return (
      <span
        className={cn(
          'flex items-center gap-2 text-[var(--color-text-muted)]',
          variant === 'button' && 'inline-flex',
          className
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
        Installed
      </span>
    )
  }

  const handleClick = () => {
    showInstallPrompt()
    onClick?.()
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'font-body flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:text-white',
          className
        )}
      >
        <Download className="size-3.5" />
        Install App
      </button>
    )
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline',
          className
        )}
      >
        <Download className="h-4 w-4" />
        Install App
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-none border border-[var(--color-text-primary)]',
        'bg-[var(--color-text-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-bg-deepest)]',
        'transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <Download className="h-4 w-4" />
      Install App
    </button>
  )
}

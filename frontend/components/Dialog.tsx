import type React from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when the dialog should close */
  onClose: () => void
  /** Dialog content */
  children: React.ReactNode
  className?: string
}

export const Dialog = ({ open, onClose, children, className }: DialogProps) => {
  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/20 backdrop-blur-sm',
        'flex items-center justify-center',
        'duration-200 animate-in fade-in-0'
      )}
      onClick={handleBackdropClick}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
    >
      <div
        className={cn(
          'relative',
          'bg-white text-black',
          'rounded-lg border border-gray-200 shadow-lg',
          'w-[90vw] max-w-[440px]',
          'p-6',
          'duration-200 animate-in zoom-in-95',
          className
        )}
        onClick={handleContentClick}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

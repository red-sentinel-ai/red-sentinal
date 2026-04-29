'use client'

import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  fieldId: string
  copiedField: string | null
  onCopy: (text: string, fieldId: string) => void
}

export function CopyButton({ text, fieldId, copiedField, onCopy }: CopyButtonProps) {
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        onCopy(text, fieldId)
      }}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all',
        {
          'bg-[var(--color-success-muted)] text-[var(--color-success)]': copiedField === fieldId,
          'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)]': copiedField !== fieldId,
        }
      )}
    >
      {copiedField === fieldId ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )
}

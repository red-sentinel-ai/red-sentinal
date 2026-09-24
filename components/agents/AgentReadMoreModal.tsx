'use client'

import { X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'

interface AgentReadMoreModalProps {
  isOpen: boolean
  prompt: string | undefined
  onClose: () => void
}

export function AgentReadMoreModal({ isOpen, prompt, onClose }: AgentReadMoreModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="z-[100] w-[90vw] max-w-[600px] overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-0"
    >
      <div className="relative w-full p-4 sm:p-6">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Instructions</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-5 w-5 text-[var(--color-text-primary)]" />
          </button>
        </div>

        <div className="ios-scroll max-h-[60vh] overflow-y-auto rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
          <p className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
            {prompt || 'No instructions available.'}
          </p>
        </div>

        <div className="pt-4">
          <button onClick={onClose} className="btn btn-black w-full touch-manipulation">
            CLOSE
          </button>
        </div>
      </div>
    </Dialog>
  )
}

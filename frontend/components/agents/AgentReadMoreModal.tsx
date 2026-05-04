'use client'

import { X } from 'lucide-react'

interface AgentReadMoreModalProps {
  prompt: string | undefined
  onClose: () => void
}

export function AgentReadMoreModal({ prompt, onClose }: AgentReadMoreModalProps) {
  return (
    <div className="ios-scroll absolute inset-0 z-10 flex flex-col overflow-hidden bg-[#f5efe4] duration-200 animate-in fade-in p-6">
      <div className="flex shrink-0 items-center justify-between py-6 md:py-8">
        <h2 className="text-2xl font-medium text-[var(--color-text-primary)]">Instructions</h2>
        <button onClick={onClose} className="touch-manipulation p-2 text-[var(--color-text-secondary)]">
          <X size={24} />
        </button>
      </div>

      <div className="ios-scroll overflow-y-auto whitespace-pre-wrap px-1 text-[var(--color-text-primary)]">
        {prompt || 'No instructions available.'}
      </div>

      <div className="pb-safe shrink-0 pt-8">
        <button onClick={onClose} className="btn btn-black touch-manipulation">
          CLOSE
        </button>
      </div>
    </div>
  )
}

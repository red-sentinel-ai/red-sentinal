import React from 'react'
import { Dialog } from '@/components/Dialog'
import { Check, ExternalLink, X } from 'lucide-react'

import Link from 'next/link'

interface SuccessModalProps {
  open: boolean
  agentAddress: string
  onClose: () => void
}

export const AgentLaunchSuccessModal = ({
  open,
  agentAddress = '',
  onClose,
}: SuccessModalProps) => {
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="relative space-y-5 p-6">
        <button
          onClick={handleClose}
          className="absolute right-0 top-0 p-2 text-[var(--color-text-muted)] hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]/20">
            <Check className="h-8 w-8 text-[var(--color-success)]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Agent Launched Successfully!</h2>

          <div className="mb-4 space-y-3">
            <Link
              href={`/attack/${agentAddress}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-elevated)] py-2.5 font-medium text-white hover:bg-[var(--color-bg-subtle)]"
            >
              <ExternalLink className="h-4 w-4" />
              View Your Agent
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PracticeSentinelPublic } from '@/types/practice'
import { PracticeSentinelBriefing } from './PracticeSentinelBriefing'

interface PracticeSentinelInfoModalProps {
  open: boolean
  onClose: () => void
  sentinel: PracticeSentinelPublic
}

export function PracticeSentinelInfoModal({
  open,
  onClose,
  sentinel,
}: PracticeSentinelInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="flex max-h-[85dvh] w-[92vw] flex-col p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="industrial-header text-[10px] tracking-widest text-[var(--color-text-muted)]">
            SENTINEL_INFO
          </DialogTitle>
          <DialogDescription className="sr-only">
            Attack goal and public instructions for this practice sentinel.
          </DialogDescription>
        </DialogHeader>

        <div className="terminal-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <PracticeSentinelBriefing sentinel={sentinel} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

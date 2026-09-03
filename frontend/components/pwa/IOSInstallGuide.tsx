'use client'

import { Share, PlusSquare, CheckSquare2, Compass } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useInstallPrompt } from '@/context/InstallPromptContext'

export function IOSInstallGuide() {
  const { iosGuideOpen, setIosGuideOpen } = useInstallPrompt()

  return (
    <Dialog open={iosGuideOpen} onOpenChange={setIosGuideOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-0">
        <DialogHeader className="border-b border-[var(--color-border-default)] p-6 pb-4 text-left">
          <DialogTitle className="font-body text-base font-semibold tracking-normal text-[var(--color-text-primary)]">
            Add Red Sentinel to Home Screen
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--color-text-muted)]">
            Install this app in three quick steps so it feels native on your iPhone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6 pt-4">
          <Step
            number={1}
            icon={Share}
            title="Tap Share"
            description="Tap the Share button (􀈂) in Safari's toolbar."
          />
          <Step
            number={2}
            icon={PlusSquare}
            title='Tap "Add to Home Screen"'
            description="Scroll down in the share sheet and tap Add to Home Screen."
          />
          <Step
            number={3}
            icon={CheckSquare2}
            title='Tap "Add"'
            description="Tap Add in the top-right corner. Red Sentinel will appear on your home screen."
          />
        </div>

        <div className="flex items-start gap-3 border-t border-[var(--color-border-default)] bg-white/[0.02] p-4 text-xs text-[var(--color-text-muted)]">
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" />
          <p>
            This only works in Safari — not Chrome or Firefox on iOS. If you don&apos;t see the
            option, make sure you&apos;re using Safari.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Step({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <span className="font-mono text-sm font-bold">{number}</span>
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2 text-[var(--color-text-primary)]">
          <Icon className="h-4 w-4" />
          <span className="font-body text-sm font-semibold uppercase tracking-[0.06em]">
            {title}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  )
}

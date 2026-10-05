'use client'

import { LifeBuoy } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SupportForm } from '@/components/support/SupportForm'

type SupportSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportSheet({ open, onOpenChange }: SupportSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-[var(--color-bg-surface)] text-white sm:w-[480px]"
      >
        <SheetHeader className="border-b border-white/10 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-white">
            <LifeBuoy className="h-5 w-5 text-white/60" />
            Contact Support
          </SheetTitle>
          <SheetDescription className="text-sm text-white/50">
            Tell us what went wrong and attach a screenshot if you can — our team gets notified
            instantly.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <SupportForm onSuccess={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

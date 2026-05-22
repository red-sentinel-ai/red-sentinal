'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FeedbackForm } from './FeedbackForm'

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const shouldHideButton = pathname.startsWith('/attack/')

  if (shouldHideButton) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden items-center justify-center rounded-full bg-black p-3 text-white shadow-lg transition-all hover:bg-gray-800 md:flex"
        aria-label="Open feedback form"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-[#1a1919] text-white sm:w-[480px]"
        >
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-white">
              <MessageSquare className="h-5 w-5 text-white/60" />
              Help us make Red Sentinel better!
            </SheetTitle>
            <p className="mt-1 text-sm text-white/50">
              Share genuine feedback or report bugs and earn Sentinel Points as a thank you.
            </p>
          </SheetHeader>
          <div className="p-4">
            <FeedbackForm onSuccess={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

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
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center rounded-full bg-black p-3 text-white shadow-lg transition-all hover:bg-gray-800"
        aria-label="Open feedback form"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-white text-black sm:w-[480px]"
        >
          <SheetHeader className="border-b border-gray-200 pb-4">
            <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-black">
              <MessageSquare className="h-5 w-5 text-gray-700" />
              Help us make Sui Sentinel better!
            </SheetTitle>
            <p className="mt-1 text-sm text-gray-500">
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

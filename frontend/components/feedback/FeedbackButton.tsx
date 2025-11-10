'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FeedbackForm } from './FeedbackForm'

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all"
        aria-label="Open feedback form"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <Sheet
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] bg-white text-black overflow-y-auto"
        >
          <SheetHeader className="pb-4 border-b border-gray-200">
            <SheetTitle className="text-black text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              Help us make Sui Sentinel better!
            </SheetTitle>
            <p className="text-gray-500 text-sm mt-1">
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

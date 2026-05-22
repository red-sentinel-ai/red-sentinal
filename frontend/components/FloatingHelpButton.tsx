'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, ExternalLink, MessageSquare } from 'lucide-react'
import { socialLinks, NAUTILUS_URL } from '@/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'

const additionalLinks = [
  {
    href: '/pdfs/redsentinel_whitepaper.pdf',
    icon: FileText,
    isImage: false,
    name: 'Whitepaper',
    isExternal: true,
  },
]

export function FloatingHelpButton() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const pathname = usePathname()

  const shouldHide = pathname.startsWith('/attack/')

  if (shouldHide) return null

  const allLinks = [...socialLinks, ...additionalLinks]

  return (
    <>
      <div className="fixed bottom-4 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:bg-gray-800"
              aria-label="Help and resources"
            >
              <span className="text-lg font-semibold">?</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuItem
              onClick={() => setIsFeedbackOpen(true)}
              className="flex cursor-pointer items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Send Feedback
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {allLinks.map(link => {
              const isExternal = link.href.startsWith('http') || link.href.startsWith('/pdfs')
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {link.isImage ? (
                        <Image src={link.icon as string} alt={link.name} width={16} height={16} />
                      ) : (
                        <link.icon className="h-4 w-4" />
                      )}
                      {link.name}
                    </div>
                    {isExternal && <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)]" />}
                  </Link>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={NAUTILUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]"
              >
                Powered by Nautilus
                <ExternalLink className="h-3 w-3" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
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
            <FeedbackForm onSuccess={() => setIsFeedbackOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

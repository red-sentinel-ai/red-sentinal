'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'

import type { FaqItem } from '@/constants/faq'

function FaqRow({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)

  return (
    <div className="border-b border-[var(--color-border-default)]">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-white md:py-5"
      >
        <span className="font-display text-sm font-bold tracking-[0.02em] text-white md:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8 md:pb-6">
          {item.answer.map((paragraph, i) => (
            <p
              key={i}
              className="font-body mt-2 text-xs font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)] first:mt-0 md:text-sm"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/** FAQ accordion. Used inline on the landing page (first few questions + a
 *  link to the full page) and as the body of /faq (every question). */
export function FaqSection({
  items,
  showViewAll = false,
  defaultOpenFirst = false,
}: {
  items: FaqItem[]
  showViewAll?: boolean
  defaultOpenFirst?: boolean
}) {
  return (
    <div>
      <div className="border-t border-[var(--color-border-default)]">
        {items.map((item, i) => (
          <FaqRow key={item.question} item={item} defaultOpen={defaultOpenFirst && i === 0} />
        ))}
      </div>
      {showViewAll && (
        <div className="mt-6 flex justify-center">
          <Link
            href="/faq"
            className="font-body inline-flex items-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white"
          >
            View all FAQs <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { NAUTILUS_URL } from '@/constants'

const Footer = () => {
  const pathname = usePathname()
  const shouldHideFooter = pathname.startsWith('/attack/')

  if (shouldHideFooter) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 text-xs text-[var(--color-text-muted)]">
      <span>Powered by </span>
      <a
        href={NAUTILUS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--color-text-secondary)]"
      >
        Nautilus
      </a>
      <span> • Secured by TEE • </span>
      <a
        href="https://osec.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--color-text-secondary)]"
      >
        Audited by OtterSec
      </a>
    </div>
  )
}

export default Footer

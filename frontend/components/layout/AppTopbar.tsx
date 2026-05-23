'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChainSwitcher } from '@/components/ChainSwitcher'
import { ConnectButton } from '@/components/ConnectButton'

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 md:px-6">
      <SidebarTrigger
        className="rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] text-[var(--color-gold-light)] hover:bg-[rgba(255,176,0,0.08)] hover:text-[var(--color-gold-light)] md:hidden"
        aria-label="Open navigation"
      />
      <div className="ml-auto flex items-center gap-2">
        <ChainSwitcher />
        <ConnectButton />
      </div>
    </header>
  )
}

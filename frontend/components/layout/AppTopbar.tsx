'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChainSwitcher } from '@/components/ChainSwitcher'
import { ConnectButton } from '@/components/ConnectButton'

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/80 px-3 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="md:hidden" aria-label="Open navigation" />
      <div className="ml-auto flex items-center gap-2">
        <ChainSwitcher />
        <ConnectButton />
      </div>
    </header>
  )
}

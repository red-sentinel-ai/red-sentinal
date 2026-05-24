'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChainSwitcher } from '@/components/ChainSwitcher'
import { ConnectButton } from '@/components/ConnectButton'

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-[var(--color-border-default)] bg-black px-3 md:px-12">
      <SidebarTrigger
        className="rounded-none border border-[var(--color-border-default)] bg-black text-white hover:bg-white hover:text-black md:hidden"
        aria-label="Open navigation"
      />
      <div className="ml-auto flex items-center gap-3 md:gap-8">
        <ChainSwitcher />
        <ConnectButton />
      </div>
    </header>
  )
}

'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChainSwitcher } from '@/components/ChainSwitcher'
import { ConnectButton } from '@/components/ConnectButton'
import { NovuInbox } from '@/components/layout/NovuInbox'
import { ARBITRUM_ONLY } from '@/constants/shared'

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 md:px-12">
      <SidebarTrigger
        className="rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-white hover:bg-white hover:text-black md:hidden"
        aria-label="Open navigation"
      />
      <div className="ml-auto flex items-center gap-3 md:gap-8">
        {/* Arbitrum-only mode locks the app to one chain, so the switcher is hidden. */}
        {!ARBITRUM_ONLY && <ChainSwitcher />}
        <NovuInbox />
        <ConnectButton />
      </div>
    </header>
  )
}

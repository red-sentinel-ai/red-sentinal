'use client'

import { useRef } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChainSwitcher } from '@/components/ChainSwitcher'
import { ConnectButton } from '@/components/ConnectButton'
import { NovuInbox } from '@/components/layout/NovuInbox'
import { useTopbarSlot } from '@/context/TopbarSlotContext'

export function AppTopbar() {
  const { content } = useTopbarSlot()
  // The wallet menu right-aligns to this cluster so it lines up with the topbar's
  // screen-edge padding instead of stopping short at the wallet button.
  const rightClusterRef = useRef<HTMLDivElement>(null)

  return (
    <header className="pt-safe sticky top-0 z-40 flex h-[var(--topbar-h)] items-center gap-2 border-b border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 md:px-12">
      <SidebarTrigger
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-white hover:bg-white hover:text-black md:hidden"
        aria-label="Open navigation"
      />

      {content && <div className="flex min-w-0 flex-1 items-center gap-2">{content}</div>}

      <div ref={rightClusterRef} className="ml-auto flex shrink-0 items-center gap-3">
        {/* Arbitrum-only mode locks the app to one chain, so the switcher is hidden. */}
        <ChainSwitcher />
        <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
          <ConnectButton compact anchorRef={rightClusterRef} />
        </div>
        <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
          <NovuInbox />
        </div>
      </div>
    </header>
  )
}

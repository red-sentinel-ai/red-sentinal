'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { FocusModeProvider, useFocusMode } from '@/context/FocusModeContext'
import { TopbarSlotProvider } from '@/context/TopbarSlotContext'
import { WalletChainMismatchNotice } from '@/components/wallet/WalletChainMismatchNotice'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import { IOSInstallGuide } from '@/components/pwa/IOSInstallGuide'
import { OfflineBanner } from '@/components/OfflineBanner'

function AppShellContent({ children }: { children: ReactNode }) {
  const { isFocusMode } = useFocusMode()

  return (
    <SidebarProvider defaultOpen={!isFocusMode}>
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-[100] opacity-[0.035]" />
      {!isFocusMode && <AppSidebar />}
      <SidebarInset className={isFocusMode ? 'ml-0' : undefined}>
        {!isFocusMode && <AppTopbar />}
        <WalletChainMismatchNotice />
        <OfflineBanner />
        <div className="min-w-0 flex-1">{children}</div>
        <PWAInstallBanner />
        <IOSInstallGuide />
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <FocusModeProvider>
      <TopbarSlotProvider>
        <AppShellContent>{children}</AppShellContent>
      </TopbarSlotProvider>
    </FocusModeProvider>
  )
}

'use client'

import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-[100] opacity-[0.035]" />
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

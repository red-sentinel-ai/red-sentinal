'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { AppTopbar } from './AppTopbar'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAttackPage = pathname === '/attack' || pathname?.startsWith('/attack/')

  return (
    <SidebarProvider defaultOpen={!isAttackPage}>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  FileText,
  Gift,
  HelpCircle,
  Home,
  Network,
  PlusSquare,
  Trophy,
  User,
  type LucideIcon,
} from 'lucide-react'

import { APP_NETWORK } from '@/constants'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const LOGO_SRC =
  APP_NETWORK === 'testnet' ? '/icons/logo_large_testnet.svg' : '/icons/logo_large.svg'

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Home', href: '/attack', icon: Home },
  { title: 'Create', href: '/defend', icon: PlusSquare },
  { title: 'Syndicates', href: '/syndicates', icon: Network },
  { title: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { title: 'Rewards', href: '/rewards', icon: Gift },
  { title: 'Profile', href: '/profile', icon: User },
]

function isItemActive(pathname: string, href: string) {
  // The root route renders the Attack view, so treat "/" as Attack being active.
  if (href === '/attack' && pathname === '/') return true
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed' && !isMobile

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = isItemActive(pathname, item.href)
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.title}
          size="default"
          className="h-11 rounded-none border-l-4 border-l-transparent px-3 font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)] hover:bg-[rgba(255,176,0,0.08)] hover:text-[var(--color-gold-light)] data-[active=true]:border-l-[var(--color-gold-primary)] data-[active=true]:bg-[rgba(255,176,0,0.12)] data-[active=true]:text-[var(--color-gold-light)] data-[active=true]:shadow-none [&>svg]:size-4"
        >
          <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
            <Icon />
            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-[var(--color-border-default)] bg-[var(--sidebar)]"
    >
      <SidebarHeader className="border-b border-[var(--color-border-default)] p-4">
        <div
          className={cn(
            'flex min-h-12 items-center gap-2',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && (
            <Link
              href="/"
              aria-label="Red Sentinel home"
              className="flex min-w-0 flex-col gap-1 px-1"
            >
              <Image src={LOGO_SRC} alt="Red Sentinel" width={168} height={42} quality={100} />
              <span className="text-[var(--color-gold-primary)]/80 font-mono text-[9px] font-bold uppercase tracking-[0.24em]">
                Tactical-OS V2.4
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] text-[var(--color-gold-light)] transition-colors hover:border-[var(--color-gold-primary)] hover:bg-[rgba(255,176,0,0.08)] md:flex"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
            />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>{NAV_ITEMS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--color-border-default)] p-3">
        <div className="space-y-1 group-data-[collapsible=icon]:hidden">
          <Link
            href="mailto:support@redsentinel.ai"
            className="flex h-8 items-center gap-3 px-2 font-mono text-[10px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-gold-light)]"
          >
            <HelpCircle className="size-3.5" />
            Support
          </Link>
          <Link
            href="#"
            className="flex h-8 items-center gap-3 px-2 font-mono text-[10px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-gold-light)]"
          >
            <FileText className="size-3.5" />
            Logs
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

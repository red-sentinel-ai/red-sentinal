'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShieldHalf, User, Trophy, Gift, ChevronLeft, Network, type LucideIcon } from 'lucide-react'

import { APP_NETWORK } from '@/constants'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
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
  { title: 'Create Sentinel', href: '/defend', icon: ShieldHalf },
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
        <SidebarMenuButton asChild isActive={active} tooltip={item.title} size="default">
          <Link href={item.href} onClick={() => isMobile && setOpenMobile(false)}>
            <Icon />
            <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="icon" className="border-[var(--color-border-subtle)]">
      <SidebarHeader>
        <div
          className={cn(
            'flex h-12 items-center gap-2',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && (
            <Link href="/" aria-label="Red Sentinel home" className="flex items-center px-1">
              <Image
                src={LOGO_SRC}
                alt="Red Sentinel"
                width={168}
                height={42}
                quality={100}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] md:flex"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')}
            />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{NAV_ITEMS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

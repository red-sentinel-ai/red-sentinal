'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Gift,
  HelpCircle,
  Terminal,
  Network,
  PlusSquare,
  Swords,
  Trophy,
  User,
  type LucideIcon,
} from 'lucide-react'

import { APP_NETWORK, SUI_SENTINEL_SUPPORT_EMAIL } from '@/constants'
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
  { title: 'Home', href: '/attack', icon: Terminal },
  { title: 'Create', href: '/defend', icon: PlusSquare },
  // Syndicates are hidden in Arbitrum-only mode (sentinel flow only).
  { title: 'Syndicates', href: '/syndicates', icon: Network },
  { title: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { title: 'Rewards', href: '/rewards', icon: Gift },
  { title: 'Practice Arena', href: '/practice', icon: Swords },
  { title: 'Profile', href: '/profile', icon: User },
]

function isItemActive(pathname: string, href: string) {
  // The root route renders the Attack view, so treat "/" as Attack being active.
  if (href === '/attack' && pathname === '/') return true
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

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
          className="font-body h-11 rounded-none px-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:bg-white/[0.04] hover:text-white data-[active=true]:bg-white/[0.05] data-[active=true]:text-white data-[active=true]:shadow-none [&>svg]:size-5"
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
      collapsible="offcanvas"
      className="z-50 border-[var(--color-border-default)] bg-[var(--sidebar)]"
    >
      <SidebarHeader className="p-8">
        <div className="flex min-h-12 items-start">
          <Link href="/" aria-label="Red Sentinel home" className="flex min-w-0 flex-col gap-1">
            <Image
              src={LOGO_SRC}
              alt="Red Sentinel"
              width={268}
              height={42}
              quality={100}
              className={cn('h-8 w-auto object-contain', APP_NETWORK !== 'testnet')}
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>{NAV_ITEMS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-[var(--color-border-default)] p-8">
        <div className="space-y-4">
          <Link
            href={`mailto:${SUI_SENTINEL_SUPPORT_EMAIL}`}
            className="font-body flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
          >
            <HelpCircle className="size-3.5" />
            Support
          </Link>
          {/* <Link
            href="#"
            className="font-body flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:text-white"
          >
            <FileText className="size-3.5" />
            Logs
          </Link> */}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
